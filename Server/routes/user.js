const express = require('express');
require('dotenv').config();
const userRouter = express.Router();
const UserModel = require('../model/user.model');
const PostModel = require('../model/posts.model');
const StatsModel = require('../model/stats.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const authenticate = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const crypto = require('crypto');

// ─── Multer – secure upload config ────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.'), false);
    }
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, 'profile-' + Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// ─── Google OAuth client ───────────────────────────────────────────────────────
const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';

// Sanitize a string for safe HTML embedding in emails
const escapeHtml = (str) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

// Cookie options based on environment
const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

// Validation error responder
const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    return null;
};

// In-memory OTP store (for production, use Redis/DB instead)
const otpStore = new Map(); // key: email, value: { otp, expiresAt }

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /users — requires authentication; returns only username + _id (no mass enumeration)
userRouter.get('/users', authenticate, async (_req, res, next) => {
    try {
        const users = await UserModel.find({}, 'username _id');
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// GET /users/:id — requires auth; returns email only if own-account (protects sensitive details)
userRouter.get('/users/:id', authenticate, async (req, res, next) => {
    try {
        const isOwnAccount = req.user.id === req.params.id;
        
        let projection = 'username age profilePicture _id';
        if (isOwnAccount) {
            projection = 'username email age profilePicture _id';
        }
        
        const userDoc = await UserModel.findById(req.params.id).select(projection);
        if (!userDoc) return res.status(404).json({ error: 'User not found' });
        res.json(userDoc);
    } catch (err) {
        next(err);
    }
});

// POST /signup
userRouter.post(
    '/signup',
    [
        body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('age').isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const { username, password, email, age } = req.body;

            // Explicit duplicate checks with user-friendly messages
            const existingEmail = await UserModel.findOne({ email });
            if (existingEmail) return res.status(409).json({ error: 'An account with this email already exists.' });

            const existingUsername = await UserModel.findOne({ username });
            if (existingUsername) return res.status(409).json({ error: 'This username is already taken.' });

            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = new UserModel({ username, password: hashedPassword, email, age });
            await newUser.save();

            // Welcome email — HTML-encoded username
            const safeUsername = escapeHtml(username);
            sendEmail(
                email,
                'Welcome to Handscape!',
                `Hello ${username},\n\nWelcome to Handscape! Your account has been created successfully.`,
                `<h3>Hello ${safeUsername},</h3><p>Welcome to Handscape! Your account has been created successfully.</p><p>Start documenting your focus and create visual resonance today.</p>`
            );

            res.status(201).json({ message: 'Account created successfully. Please log in.' });
        } catch (err) {
            next(err);
        }
    }
);

// POST /login
userRouter.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const { email, password } = req.body;
            const user = await UserModel.findOne({ email });

            // Generic message — avoids email enumeration
            if (!user) return res.status(401).json({ error: 'Invalid email or password' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

            const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.SECRET_KEY, {
                expiresIn: '24h',
                algorithm: 'HS256'
            });

            // Set httpOnly cookie only — DO NOT send token in response body
            res.cookie('token', token, cookieOptions());

            // Send login alert
            const safeUsername = escapeHtml(user.username);
            sendEmail(
                user.email,
                'New Login to Handscape',
                `Hello ${user.username},\n\nA new login to your Handscape account was just detected.`,
                `<h3>Hello ${safeUsername},</h3><p>A new login to your Handscape account was just detected.</p><p>If this was not you, please change your password immediately.</p>`
            );

            res.json({
                message: 'Login successful',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    age: user.age,
                    profilePicture: user.profilePicture
                }
                // ✅ NO token in response body (CRIT-04 fix)
            });
        } catch (err) {
            next(err);
        }
    }
);

// POST /auth/google — verifies Google ID token server-side (HIGH-10 fix)
userRouter.post('/auth/google', async (req, res, next) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Google credential token is required.' });
        }

        // Verify the ID token with Google
        let payload;
        try {
            const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        } catch {
            return res.status(401).json({ error: 'Invalid Google credential. Please try again.' });
        }

        const { email, name, picture } = payload;

        let user = await UserModel.findOne({ email });
        let isNewUser = false;

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            let tempUsername = name
                ? name.toLowerCase().replace(/[^a-z0-9]/g, '') + crypto.randomInt(1000, 9999)
                : 'user' + Date.now();

            // Ensure username uniqueness
            const usernameExists = await UserModel.findOne({ username: tempUsername });
            if (usernameExists) tempUsername = tempUsername + crypto.randomInt(100, 999);

            user = new UserModel({
                username: tempUsername,
                email,
                password: hashedPassword,
                age: 18,
                profilePicture: picture || ''
            });
            await user.save();
            isNewUser = true;

            const safeUsername = escapeHtml(tempUsername);
            sendEmail(
                email,
                'Welcome to Handscape!',
                `Hello ${tempUsername},\n\nWelcome to Handscape! Your account was created via Google.`,
                `<h3>Hello ${safeUsername},</h3><p>Welcome to Handscape! Your account was created via Google.</p>`
            );
        } else {
            const safeUsername = escapeHtml(user.username);
            sendEmail(
                user.email,
                'New Login to Handscape',
                `Hello ${user.username},\n\nA new login via Google was detected.`,
                `<h3>Hello ${safeUsername},</h3><p>A new login to your Handscape account via Google was detected.</p>`
            );
        }

        const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.SECRET_KEY, {
            expiresIn: '24h',
            algorithm: 'HS256'
        });

        // Cookie only — no token in body
        res.cookie('token', token, cookieOptions());

        res.json({
            message: 'Google Auth successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                profilePicture: user.profilePicture
            },
            isNewUser
        });
    } catch (err) {
        next(err);
    }
});

// GET /auth/verify
userRouter.get('/auth/verify', authenticate, async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                profilePicture: user.profilePicture
            }
        });
    } catch (err) {
        next(err);
    }
});

// POST /logout
userRouter.post('/logout', (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    });
    res.json({ message: 'Logout successful' });
});

// POST /request-password-reset — CRIT-03 fix: sends OTP to email, does NOT reset yet
userRouter.post(
    '/request-password-reset',
    [body('email').isEmail().normalizeEmail().withMessage('Valid email required')],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const { email } = req.body;
            // Generic response to prevent email enumeration (MED-01 fix)
            const genericMsg = { message: 'If this email is registered, you will receive a reset code shortly.' };

            const user = await UserModel.findOne({ email });
            if (!user) {
                // Still return 200 with generic message — don't reveal if email exists
                return res.json(genericMsg);
            }

            // Generate 6-digit OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
            otpStore.set(email, { otp, expiresAt });

            const safeUsername = escapeHtml(user.username);
            sendEmail(
                email,
                'Handscape Password Reset Code',
                `Hello ${user.username},\n\nYour password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`,
                `<h3>Hello ${safeUsername},</h3><p>Your password reset code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p><p>If you did not request this, ignore this email.</p>`
            );

            res.json(genericMsg);
        } catch (err) {
            next(err);
        }
    }
);

// POST /verify-reset-otp — verifies OTP then resets password
userRouter.post(
    '/verify-reset-otp',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('6-digit OTP required'),
        body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const { email, otp, newPassword } = req.body;
            const record = otpStore.get(email);

            if (!record) {
                return res.status(400).json({ error: 'No reset request found. Please request a new code.' });
            }

            if (Date.now() > record.expiresAt) {
                otpStore.delete(email);
                return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
            }

            // Constant-time comparison to prevent timing attacks
            const otpValid = crypto.timingSafeEqual(
                Buffer.from(record.otp),
                Buffer.from(otp)
            );

            if (!otpValid) {
                return res.status(400).json({ error: 'Invalid reset code.' });
            }

            const user = await UserModel.findOne({ email });
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            user.password = hashedPassword;
            await user.save();

            otpStore.delete(email); // Invalidate OTP after use

            res.json({ message: 'Password reset successful. You can now log in.' });
        } catch (err) {
            next(err);
        }
    }
);

// Keep /reset-password as legacy alias pointing to new flow (returns guidance)
userRouter.post('/reset-password', (req, res) => {
    res.status(400).json({
        error: 'Direct password reset is no longer supported. Please use /request-password-reset to receive a verification code first.'
    });
});

// PUT /users/:id — CRIT-06/07/08: whitelist fields + ownership check
userRouter.put('/users/:id', authenticate, upload.single('profilePicture'), [
    body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
    body('age').optional().isInt({ min: 13, max: 120 }).withMessage('Age must be between 13 and 120'),
    body('password').optional().isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('currentPassword').optional().isString()
], async (req, res, next) => {
    try {
        // CRIT-08: ownership check
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Forbidden: You can only update your own profile.' });
        }

        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // CRIT-06: Whitelist — only allow safe fields, never spread req.body
        const allowedUpdate = {};

        if (req.body.username !== undefined) {
            // Check uniqueness if changing username
            const existing = await UserModel.findOne({ username: req.body.username });
            if (existing && existing._id.toString() !== req.params.id) {
                return res.status(409).json({ error: 'This username is already taken.' });
            }
            allowedUpdate.username = req.body.username;

            // Update username on all posts created by this user
            await PostModel.updateMany(
                { created_by: req.params.id },
                { username: req.body.username }
            );
        }

        if (req.body.age !== undefined) {
            allowedUpdate.age = parseInt(req.body.age, 10);
        }

        // MED-10: require current password to change password
        if (req.body.password) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set a new password.' });
            }
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }
            allowedUpdate.password = await bcrypt.hash(req.body.password, 12);
        }

        if (req.file) {
            allowedUpdate.profilePicture = req.file.path;
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            allowedUpdate,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            age: updatedUser.age,
            profilePicture: updatedUser.profilePicture
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /users/:id — CRIT-07: ownership check
userRouter.delete('/users/:id', authenticate, async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own account.' });
        }
        
        // Delete all posts created by this user
        await PostModel.deleteMany({ created_by: req.params.id });

        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
        });
        res.json({ message: 'Account deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

// GET /stats
userRouter.get('/stats', async (_req, res, next) => {
    try {
        const totalUsers = await UserModel.countDocuments();
        const totalPosts = await PostModel.countDocuments();

        const likesAggregation = await PostModel.aggregate([
            { $group: { _id: null, totalLikes: { $sum: '$likesCount' } } }
        ]);
        const totalLikes = likesAggregation.length > 0 ? likesAggregation[0].totalLikes : 0;

        let stats = await StatsModel.findOne();
        if (!stats) {
            stats = new StatsModel({ totalViews: 0, dailyActiveUsers: 0 });
            await stats.save();
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentPostsCount = await PostModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const basePostsCount = totalPosts - recentPostsCount;

        let growthRate = 0;
        if (totalPosts === 0) {
            growthRate = 0;
        } else if (basePostsCount === 0) {
            growthRate = recentPostsCount > 0 ? 100 : 0;
        } else {
            growthRate = Math.min(100, Math.floor((recentPostsCount / basePostsCount) * 100));
        }

        res.json({
            totalUsers,
            photosShared: totalPosts,
            totalLikes,
            totalViews: stats.totalViews, // MED-12: no fake multipliers
            growthRate,
            dailyActiveUsers: stats.dailyActiveUsers
        });
    } catch (err) {
        next(err);
    }
});

module.exports = userRouter;

const express = require('express');
require('dotenv').config();
const userRouter = express.Router();
const UserModel = require('../model/user.model');
const PostModel = require('../model/posts.model');
const StatsModel = require('../model/stats.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'profile-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

userRouter.get('/users', async (_req, res) => {
    try {
        const users = await UserModel.find({}, 'username');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.get('/users/:id', authenticate, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/signup', async (req, res) => {
    try {
        const { username, password, email, age } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, password: hashedPassword, email, age });
        await newUser.save();

        // Send welcome email
        sendEmail(
            email,
            "Welcome to Handscape!",
            `Hello ${username},\n\nWelcome to Handscape! Your account has been created successfully.\n\nStart documenting your focus and create visual resonance today.`,
            `<h3>Hello ${username},</h3><p>Welcome to Handscape! Your account has been created successfully.</p><p>Start documenting your focus and create visual resonance today.</p>`
        );

        res.json({ message: "Hurray! Successfully saved the user to the database" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

userRouter.post('/login',async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '24h' });

        // Configure cookie for cross-origin production deployment
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Always use secure for HTTPS
            sameSite: 'None', // Required for cross-origin
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send login alert email (fire and forget)
        sendEmail(
            user.email,
            "New Login to Handscape",
            `Hello ${user.username},\n\nA new login to your Handscape account was just detected. If this was you, you can safely ignore this email.`,
            `<h3>Hello ${user.username},</h3><p>A new login to your Handscape account was just detected.</p><p>If this was you, you can safely ignore this email.</p>`
        );

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token: token // Include token in response as fallback
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/auth/google', async (req, res) => {
    try {
        const { email, name, profilePicture } = req.body;
        let user = await UserModel.findOne({ email });

        let isNewUser = false;
        if (!user) {
            // Create a new user with random password and temp username
            const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            let tempUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000) : "user" + Date.now();
            
            user = new UserModel({
                username: tempUsername,
                email,
                password: hashedPassword,
                age: 18, // default
                profilePicture: profilePicture || ""
            });
            await user.save();
            isNewUser = true;

            // Send welcome email
            sendEmail(
                email,
                "Welcome to Handscape!",
                `Hello ${tempUsername},\n\nWelcome to Handscape! Your account was created via Google.\n\nPlease go to your profile to set a new password and update your details.`,
                `<h3>Hello ${tempUsername},</h3><p>Welcome to Handscape! Your account was created via Google.</p><p>Please go to your profile to set a new password and update your details.</p>`
            );
        } else {
            // Send login alert
            sendEmail(
                user.email,
                "New Login to Handscape",
                `Hello ${user.username},\n\nA new login to your Handscape account via Google was just detected.`,
                `<h3>Hello ${user.username},</h3><p>A new login to your Handscape account via Google was just detected.</p>`
            );
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '24h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Google Auth successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                age: user.age,
                profilePicture: user.profilePicture
            },
            token: token,
            isNewUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.get('/auth/verify', authenticate, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id).select('-password');
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
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/logout',(_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
    res.json({ message: "Logout successful" });
});

userRouter.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User with this email does not exist" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password reset successful. You can now log in." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.put('/users/:id', authenticate, upload.single('profilePicture'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        
        if (req.file) {
            updateData.profilePicture = req.file.path;
        }

        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

userRouter.delete('/users/:id',authenticate, async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get platform statistics
userRouter.get('/stats', async (_req, res) => {
    try {
        // Get total users
        const totalUsers = await UserModel.countDocuments();

        // Get total posts
        const totalPosts = await PostModel.countDocuments();

        // Get total likes across all posts
        const likesAggregation = await PostModel.aggregate([
            { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } }
        ]);
        const totalLikes = likesAggregation.length > 0 ? likesAggregation[0].totalLikes : 0;

        // Get or create stats document
        let stats = await StatsModel.findOne();
        if (!stats) {
            stats = new StatsModel({
                totalViews: totalPosts * 50, // Mock initial views
                dailyActiveUsers: Math.floor(totalUsers * 0.3) // Mock 30% daily active
            });
            await stats.save();
        }

        // Calculate functional growth rate based on recent post activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentPostsCount = await PostModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
        const basePostsCount = totalPosts - recentPostsCount;
        
        // Standard calculation: (Recent / Base) * 100
        let growthRate = 0;
        if (totalPosts === 0) {
            growthRate = 0;
        } else if (basePostsCount === 0) {
            growthRate = recentPostsCount > 0 ? 100 : 0;
        } else {
            growthRate = Math.floor((recentPostsCount / basePostsCount) * 100);
        }

        res.json({
            totalUsers,
            photosShared: totalPosts,
            totalLikes,
            totalViews: stats.totalViews + (totalPosts * 25), // Add some views
            growthRate,
            dailyActiveUsers: stats.dailyActiveUsers
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = userRouter;

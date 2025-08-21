const express = require('express');
require('dotenv').config();
const userRouter = express.Router();
const UserModel = require('../model/user.model');
const PostModel = require('../model/posts.model');
const StatsModel = require('../model/stats.model');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/auth');

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

        // Configure cookie for production
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // Use secure cookies in production
            sameSite: isProduction ? 'None' : 'Lax', // Allow cross-site cookies in production
            domain: isProduction ? '.onrender.com' : undefined // Set domain for production
        });
        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
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
                age: user.age
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/logout',(_req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        domain: isProduction ? '.onrender.com' : undefined
    });
    res.json({ message: "Logout successful" });
});

userRouter.put('/users/:id',authenticate, async (req, res) => {
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

        // Calculate growth rate (mock calculation)
        const growthRate = totalUsers > 100 ? 12 : Math.floor(totalUsers / 10) + 5;

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

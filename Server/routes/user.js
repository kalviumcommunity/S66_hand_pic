const express = require('express');
require('dotenv').config();
const userRouter = express.Router();
const UserModel = require('../model/user.model');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticate = require('./authMiddleware');

userRouter.get('/users', authenticate, async (req, res) => {
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

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
        res.json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/logout',(req, res) => {
    res.clearCookie('token');
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

module.exports = userRouter;

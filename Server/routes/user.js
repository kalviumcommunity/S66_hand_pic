const express = require('express');
const userRouter = express.Router();
const UserModel = require('../model/user.model');

userRouter.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find({}, 'username');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.get('/users/:id', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

userRouter.post('/create/user', async(req,res)=>{
    const{username,password,email,age} = req.body;
    payload={username,password,email,age};
    
    try {
        let new_user = new UserModel(payload);
        await new_user.save();
        res.send({ "message": "Hurray! Successfully saved the user to the database" });
    } catch (error) {
        console.log(error);
        res.send({ "error": error });
    }
});

userRouter.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

userRouter.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = userRouter;

const express = require('express');
const postRouter = express.Router();
const PostModel = require('../model/posts.model');
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

postRouter.post('/create/post', upload.single('image'), async (req, res) => {
    const { title, description, username } = req.body;
    const image = req.file ? req.file.path : null;

    if (!title || !description || !username) {
        return res.status(400).send({ "error": "Title, description, and username are required!" });
    }

    if (!image) {
        return res.status(400).send({ "error": "Image file is required!" });
    }




    const payLoad = { image, title, description, username };

    try {
        const new_post = new PostModel(payLoad);
        await new_post.save();
        res.send({ "message": "Hurray! Successfully saved the post to the database" });
    } catch (error) {
        console.log(error);
        res.send({ "error": error });
    }
});

postRouter.get('/posts', async (req, res) => {
    try {
        const posts = await PostModel.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

postRouter.get('/posts/:id', async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

postRouter.put('/posts/:id', async (req, res) => {
    try {
        const updatedPost = await PostModel.findByIdAndUpdate
        (req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ message: "Post not found" });
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

postRouter.delete('/posts/:id', async (req, res) => {
    try {
        const deletedPost = await PostModel.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = postRouter;

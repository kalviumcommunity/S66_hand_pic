const express = require('express');
const postRouter = express.Router();
const PostModel = require('../model/posts.model');
const multer = require('multer');
const authenticate = require('../middleware/auth');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

postRouter.post('/create/post', authenticate, upload.single('image'), async (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? req.file.path : null;

    if (!title || !description) {
        return res.status(400).send({ "error": "Title and description are required!" });
    }

    if (!image) {
        return res.status(400).send({ "error": "Image file is required!" });
    }

    try {
        // Get user information from the authenticated user
        const UserModel = require('../model/user.model');
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).send({ "error": "User not found!" });
        }

        const payLoad = {
            image,
            title,
            description,
            username: user.username,
            created_by: req.user.id,
            likesCount: 0,
            likes: []
        };

        const new_post = new PostModel(payLoad);
        await new_post.save();
        res.send({ "message": "Hurray! Successfully saved the post to the database" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ "error": error.message });
    }
});

postRouter.get('/posts', async (req, res) => {
    try {
        const { sortBy = 'createdAt', order = 'desc' } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        let sortCriteria = {};
        if (sortBy === 'likes') {
            sortCriteria = { likesCount: sortOrder };
        } else if (sortBy === 'createdAt') {
            sortCriteria = { createdAt: sortOrder };
        } else {
            sortCriteria = { [sortBy]: sortOrder };
        }

        const posts = await PostModel.find().sort(sortCriteria);
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

// Like/Unlike a post
postRouter.post('/posts/:id/like', authenticate, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike the post
            post.likes = post.likes.filter(id => id.toString() !== userId);
            post.likesCount = Math.max(0, post.likesCount - 1);
        } else {
            // Like the post
            post.likes.push(userId);
            post.likesCount += 1;
        }

        await post.save();
        res.json({
            message: isLiked ? "Post unliked" : "Post liked",
            isLiked: !isLiked,
            likesCount: post.likesCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's liked posts
postRouter.get('/user/liked-posts', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const likedPosts = await PostModel.find({ likes: userId });
        res.json(likedPosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = postRouter;

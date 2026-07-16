const express = require('express');
const postRouter = express.Router();
const PostModel = require('../model/posts.model');
const multer = require('multer');
const authenticate = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

// ─── Multer – secure upload config ────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1025; // 5 MB

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
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Allowed sort fields — whitelist to prevent NoSQL injection (HIGH-04 fix)
const ALLOWED_SORT_FIELDS = ['createdAt', 'likesCount', 'title', 'likes', 'viewsCount', 'views'];

const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    return null;
};

// POST /create/post
postRouter.post(
    '/create/post',
    authenticate,
    upload.single('image'),
    [
        body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),
        body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1–500 characters')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        try {
            const UserModel = require('../model/user.model');
            const user = await UserModel.findById(req.user.id).select('username');
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const { title, description } = req.body;

            const newPost = new PostModel({
                image: req.file.path,
                title: title.trim(),
                description: description.trim(),
                username: user.username,
                created_by: req.user.id,
                likesCount: 0,
                likes: []
            });
            await newPost.save();
            res.status(201).json({ message: 'Post created successfully.' });
        } catch (err) {
            next(err);
        }
    }
);

// GET /posts — with pagination (MED-07) and whitelisted sort (HIGH-04)
postRouter.get(
    '/posts',
    [
        query('sortBy').optional().isIn(ALLOWED_SORT_FIELDS).withMessage('Invalid sort field'),
        query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50'),
        query('userId').optional().isMongoId().withMessage('Invalid userId')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const sortBy = req.query.sortBy || 'createdAt';
            const order = req.query.order === 'asc' ? 1 : -1;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            // Build safe sort criteria from whitelist
            let sortField = sortBy;
            if (sortBy === 'likes') sortField = 'likesCount';
            if (sortBy === 'views') sortField = 'viewsCount';
            const sortCriteria = { [sortField]: order };

            // INFO-09: server-side userId filter
            const filter = {};
            if (req.query.userId) {
                filter.created_by = req.query.userId;
            }

            const [posts, total] = await Promise.all([
                PostModel.find(filter).sort(sortCriteria).skip(skip).limit(limit).lean(),
                PostModel.countDocuments(filter)
            ]);

            res.json({
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (err) {
            next(err);
        }
    }
);

// GET /posts/:id
postRouter.get('/posts/:id', [
    param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res, next) => {
    const validErr = handleValidation(req, res);
    if (validErr !== null) return;

    try {
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewsCount: 1 } },
            { new: true }
        ).lean();
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        next(err);
    }
});

// PUT /posts/:id — ownership check + field whitelist
postRouter.put(
    '/posts/:id',
    authenticate,
    [
        param('id').isMongoId().withMessage('Invalid post ID'),
        body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),
        body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1–500 characters')
    ],
    async (req, res, next) => {
        const validErr = handleValidation(req, res);
        if (validErr !== null) return;

        try {
            const post = await PostModel.findById(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post not found' });

            if (post.created_by.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden: You can only update your own posts.' });
            }

            const updatedPost = await PostModel.findByIdAndUpdate(
                req.params.id,
                { title: req.body.title.trim(), description: req.body.description.trim() },
                { new: true, runValidators: true }
            );
            res.json(updatedPost);
        } catch (err) {
            next(err);
        }
    }
);

// DELETE /posts/:id — ownership check
postRouter.delete('/posts/:id', authenticate, [
    param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res, next) => {
    const validErr = handleValidation(req, res);
    if (validErr !== null) return;

    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.created_by.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own posts.' });
        }

        await PostModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully.' });
    } catch (err) {
        next(err);
    }
});

// POST /posts/:id/like — MED-11: atomic operations
postRouter.post('/posts/:id/like', authenticate, [
    param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res, next) => {
    const validErr = handleValidation(req, res);
    if (validErr !== null) return;

    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await PostModel.findById(postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const isLiked = post.likes.some(id => id.toString() === userId);

        let updatedPost;
        if (isLiked) {
            // Atomic unlike
            updatedPost = await PostModel.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId }, $inc: { likesCount: -1 } },
                { new: true }
            );
        } else {
            // Atomic like (addToSet prevents duplicates)
            updatedPost = await PostModel.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId }, $inc: { likesCount: 1 } },
                { new: true }
            );
        }

        res.json({
            message: isLiked ? 'Post unliked' : 'Post liked',
            isLiked: !isLiked,
            likesCount: updatedPost.likesCount
        });
    } catch (err) {
        next(err);
    }
});

// GET /user/liked-posts
postRouter.get('/user/liked-posts', authenticate, async (req, res, next) => {
    try {
        const likedPosts = await PostModel.find({ likes: req.user.id }).lean();
        res.json(likedPosts);
    } catch (err) {
        next(err);
    }
});

module.exports = postRouter;

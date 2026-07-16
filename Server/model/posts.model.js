const mongoose = require('mongoose');

// INFO-10: fix ref mismatch — model name must match what PostModel uses as ref
const PostSchema = mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
    },
    username: {
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',  // INFO-10 fix: was 'User', model is registered as 'Users'
        required: true,
        index: true    // INFO-11: index for efficient user-specific queries
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    likesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    viewsCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true  // LOW-05: adds createdAt + updatedAt automatically
});

// INFO-11: compound index for common sort patterns
PostSchema.index({ createdAt: -1 });
PostSchema.index({ likesCount: -1 });

const PostModel = mongoose.model('HandDetail', PostSchema);

module.exports = PostModel;
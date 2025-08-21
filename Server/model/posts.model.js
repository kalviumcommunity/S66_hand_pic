const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    image:{
        type: String,
        required: true,
    },title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const PostModel = mongoose.model('HandDetail',PostSchema);

module.exports = PostModel;
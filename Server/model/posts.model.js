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
    }
});

const PostModel = mongoose.model('HandDetail',PostSchema);

module.exports = PostModel;
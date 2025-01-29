const mongoose = require('mongoose');

const HandSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    image:{
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
    }
});

const HandModel = mongoose.model('HandDetail',HandSchema);
module.exports = HandModel;
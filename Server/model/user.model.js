const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const UserModel = mongoose.model("Users", userSchema);

module.exports = UserModel;
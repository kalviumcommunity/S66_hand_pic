const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true,
        unique: true,
    },
    password: {
        type:String,
        required: true,
    },
    email: {
        type:String,
        required: true,
        unique: true,
    },
    age: {
        type:Number,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ""
    }
});

const UserModel = mongoose.model("Users", userSchema);

module.exports = UserModel;
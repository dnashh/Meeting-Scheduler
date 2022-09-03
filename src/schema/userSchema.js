const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        max: [50, 'Name cannot be more than 50 characters'],
        min: [3, 'Name cannot be less than 3 characters'],
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        max: [50, 'Username cannot be more than 50 characters'],
        min: [5, 'Username cannot be less than 3 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
    },
    bio: {
        type: String,
        max: [200, 'Bio cannot be more than 200 characters'],
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    image: {
        type: String,
    },
}, {timestamps: true});


module.exports = mongoose.model('User', userSchema);
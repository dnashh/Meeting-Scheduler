const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    uid: String,
    refreshToken: String,
    schedule: {
        type: String,
        unique: true,
        required: true
    },
    timezone: String,
    name: String,
    email: String,
    timeslots: {
        start: String,
        end: String
    },
    repeat: Array
});

module.exports =  mongoose.model('account', accountSchema);
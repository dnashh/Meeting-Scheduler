const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    uid: String,
    status: String,
    created: Date,
    updated: Date,
    summary: String,
    url: String,
    created_by: String,
    start: Date,
    end: Date,
    scheduled_by: String,
    scheduler: String,
    duration: String
});

module.exports = mongoose.model('events', eventSchema);
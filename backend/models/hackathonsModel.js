// models/hackathonsModel.js
const mongoose = require('mongoose');


const hackathonSchema = new mongoose.Schema({
    title: { type: String, unique: true },
    url: { type: String, unique: true },
    date: String,
    location: String,
    city: String,
    prize: String,
    host: String,
}, {timestamps: true});


module.exports = mongoose.model('hackpilot_hackathons', hackathonSchema);
// models/chatMessageModel.js
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
    {
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'hackpilot_teams',
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'hackpilot_users',
        },
        message: {
            type: String,
            required: true,
        },
        seen_by: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'hackpilot_users',
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('hackpilot_chats', chatMessageSchema);

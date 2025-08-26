const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema(
    {
        // customId: { type: String, required: true, unique: true },        //Create `customId` using 'nanoid'-library...
        name: { type: String, required: true, trim: true },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'hackpilot_users',
                required: true,
            },
        ],
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'hackpilot_users',
            required: true,
        },
        github_repo: { type: String, trim: true },
        project_description: {
            type: String,
            maxlength: [250, 'project_description cannot exceed 500 characters'],
        },
    },
    { timestamps: true }
);

const Team = mongoose.model('hackpilot_teams', TeamSchema);

module.exports = Team;

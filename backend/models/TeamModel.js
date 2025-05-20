const mongoose = require("mongoose")


const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    members: [ { type: mongoose.Schema.Types.ObjectId, ref: 'hackpilot_users', required: true, unique: true } ],
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'hackpilot_users', required: true },
    github_repo: { type: String, trim: true },
    project_description: { type: String, required: true, maxlength: [30, 'project_description cannot exceed 30 characters'] }
}, {timestamps: true})

// custom validator to ensure members are unique
TeamSchema.path('members').validate(function (value) {
    const ids = value.map(v => v.toString());
    return new Set(ids).size === ids.length;
}, 'Team members must be unique.');

const Team = mongoose.model("hackpilot_teams", TeamSchema);


module.exports = Team;
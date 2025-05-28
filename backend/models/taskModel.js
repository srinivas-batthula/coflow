const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
    task: { type: String, required: true, trim: true },
    status: { type: String, default: 'pending', enum:['pending', 'under review', 'completed'] },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'hackpilot_users', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'hackpilot_teams', required: true },
}, {timestamps: true})

const Task = mongoose.model("hackpilot_tasks", TaskSchema);

module.exports = Task;
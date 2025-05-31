const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    task: { type: String, required: true, trim: true },
    description: {
      type: String,
      maxlength: [250, "project_description cannot exceed 250 characters"],
    },
    deadline: { type: Date },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "under review", "completed"],
    },
    comments: [{ type: String }],
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackpilot_users",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hackpilot_teams",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("hackpilot_tasks", TaskSchema);

module.exports = Task;

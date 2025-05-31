import React, { useState } from "react";

export default function CreateTaskModal({ team, onClose, onCreate }) {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = () => {
    const newTask = {
      _id: Date.now().toString(),
      task,
      description,
      githubRepo,
      status: "pending",
      assigned_to: assignedTo,
      teamId: team._id,
      comments: [],
      deadline: null,
    };
    onCreate(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Task Title"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <textarea
          className="w-full border p-2 rounded mb-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={50}
        />
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="GitHub Repo URL (optional)"
          value={githubRepo}
          onChange={(e) => setGithubRepo(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded mb-4"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">Assign To</option>
          {team.member_details.map((m) => (
            <option key={m._id} value={m._id}>
              {m.fullName}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubmit}
          disabled={!task || !assignedTo}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Create Task
        </button>
      </div>
    </div>
  );
}

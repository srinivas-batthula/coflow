import React, { useEffect, useState } from "react";

export default function CreateTaskModal({ team, onClose, onCreate }) {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    // Prevent background scrolling while modal is open
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

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
    <div
      className="fixed left-0 right-0 bottom-0 top-[64px] z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }} // subtle transparent blur overlay
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-500 hover:text-black text-3xl font-bold leading-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-black mb-2">
          Create a New Task
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Fill in the task details and assign it to a team member.
        </p>

        {/* Task Title */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-black mb-1">
            Task Title
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-400"
            placeholder="Enter task title"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-black mb-1">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-400 resize-none overflow-y-auto"
            placeholder="Short description (max 50 chars)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={50}
            rows={4}
          />
        </div>

        {/* GitHub Repo */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-black mb-1">
            GitHub Repo URL
          </label>
          <input
            type="url"
            className="w-full border border-gray-300 p-2 rounded text-black placeholder-gray-400"
            placeholder="https://github.com/project"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
          />
        </div>

        {/* Assignee */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-black mb-1">
            Assign To
          </label>
          <select
            className="w-full border border-gray-300 p-2 rounded text-black"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="" className="text-gray-400">
              Select team member
            </option>
            {team.member_details.filter((m) => m._id !== team.leader).length ===
            0 ? (
              <option disabled>No available members</option>
            ) : (
              team.member_details
                .filter((m) => m._id !== team.leader)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.fullName}
                  </option>
                ))
            )}
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!task || !assignedTo}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Create Task
        </button>
      </div>
    </div>
  );
}

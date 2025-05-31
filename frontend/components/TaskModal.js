// components/TaskModal.js
import React from "react";

export default function TaskModal({ task, onClose, user, team, updateStatus }) {
  const isLeader = user._id === team.leader;
  const isAssignee = user._id === task.assigned_to;

  const handleSubmit = () => {
    updateStatus(task._id, "under review");
  };

  const handleApprove = () => {
    updateStatus(task._id, "completed");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-xl">
        <button
          className="absolute top-2 right-3 text-xl font-bold text-gray-600 hover:text-red-500"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-2">{task.task}</h2>
        <p className="text-sm text-gray-700 mb-2">{task.description}</p>
        <p className="text-sm mb-1">Deadline: {task.deadline}</p>
        <p className="text-sm mb-1">Status: {task.status}</p>
        <div className="mb-4">
          <p className="font-semibold">Comments:</p>
          <ul className="text-sm list-disc ml-5">
            {task.comments.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
        {isAssignee && task.status === "pending" && (
          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Submit
          </button>
        )}
        {isLeader && task.status === "under review" && (
          <button
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
}

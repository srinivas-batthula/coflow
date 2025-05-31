import React, { useEffect } from "react";

export default function TaskModal({ task, onClose, user, team, updateStatus }) {
  const isLeader = user._id === team.leader;
  const isAssignee = user._id === task.assigned_to;

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  // Find assignee full name from team member_details
  const assignee = team.member_details.find((m) => m._id === task.assigned_to);

  const handleSubmit = () => updateStatus(task._id, "under review");
  const handleApprove = () => updateStatus(task._id, "completed");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="task-modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-300"
        style={{
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-5 text-gray-600 hover:text-gray-900 text-4xl font-extrabold leading-none"
        >
          &times;
        </button>

        {/* Header */}
        <h2
          id="task-modal-title"
          className="text-3xl font-bold text-black mb-4 select-none flex-shrink-0"
        >
          {task.task}
        </h2>

        {/* Content area with scroll if needed */}
        <div className="flex-grow overflow-auto pr-2">
          {/* Task Details */}
          <div className="space-y-4 text-black text-sm">
            <div>
              <label className="font-semibold block mb-1">Description</label>
              <div
                className="border border-gray-300 rounded p-2 text-gray-900 break-words"
                style={{
                  maxHeight: "5.5rem", // ~4 lines (approx 1.375rem line-height * 4)
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.description || "No description"}
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Assignee</label>
              <p className="text-gray-900">
                {assignee ? assignee.fullName : "Unknown"}
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1">Deadline</label>
              <p className="text-gray-900">
                {task.deadline || "No deadline set"}
              </p>
            </div>

            <div>
              <label className="font-semibold block mb-1">Status</label>
              <p className="text-gray-900 capitalize">{task.status}</p>
            </div>

            <div>
              <label className="font-semibold block mb-1">GitHub Repo</label>
              {team.github_repo ? (
                <a
                  href={team.github_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {team.github_repo}
                </a>
              ) : (
                <p className="text-gray-500 italic">No repo linked</p>
              )}
            </div>

            <div>
              <label className="font-semibold block mb-1">Comments</label>
              {task.comments && task.comments.length > 0 ? (
                <ul className="list-disc ml-5 max-h-32 overflow-y-auto text-gray-800">
                  {task.comments.map((c, i) => (
                    <li key={i} className="mb-1">
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No comments</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 flex-shrink-0">
          {isAssignee && task.status === "pending" && (
            <button
              onClick={handleSubmit}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-semibold transition"
            >
              Submit
            </button>
          )}
          {isLeader && task.status === "under review" && (
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold transition"
            >
              Approve
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-gray-400 border-t pt-3 select-none flex-shrink-0">
          {isAssignee && (
            <p>
              This task is assigned to you. Use "Submit" to mark it ready for
              review.
            </p>
          )}
          {isLeader && (
            <p>
              As the team leader, use "Approve" to mark the task as completed
              when it's ready.
            </p>
          )}
          {!isLeader && !isAssignee && (
            <p>Task details are visible to team members.</p>
          )}
        </div>
      </div>
    </div>
  );
}

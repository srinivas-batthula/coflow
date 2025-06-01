import { useEffect, useState } from "react";
import CountdownTimer from "./CountDownTimer";
import toast from "react-hot-toast";

export default function TaskModal({
  task,
  onClose,
  user,
  team,
  updateStatus,
  addComment,
}) {
  const isLeader = user._id === team.leader;
  const isAssignee = user._id === task.assigned_to;
  const [reassignComment, setReassignComment] = useState("");

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const assignee = team.member_details.find((m) => m._id === task.assigned_to);

  const handleSubmit = () => {
    updateStatus(task._id, "under review");
    onClose();
  };
  const handleApprove = () => {
    updateStatus(task._id, "completed");
    onClose();
  };
  const handleReassign = () => {
    if (task.status !== "under review") {
      toast.error("Reassignment allowed only when task is under review.");
      return;
    }
    if (!reassignComment.trim()) {
      toast.error("Reassignment comment is required.");
      return;
    }
    addComment(task._id, reassignComment);
    updateStatus(task._id, "pending");
    onClose();
  };

  const footerMessage = isLeader
    ? task.status === "under review"
      ? "You can approve this task."
      : task.status === "completed"
      ? "This task is completed."
      : "You are the team leader."
    : isAssignee
    ? task.status === "pending"
      ? "This task is assigned to you. Submit when ready."
      : task.status === "under review"
      ? "Task is under review."
      : "This task is completed."
    : "Task details are visible to team members.";

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "under review": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center bg-white/10 backdrop-blur-md"
      aria-modal="true"
      role="dialog"
      aria-labelledby="task-modal-title"
      aria-describedby="task-modal-desc"
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] p-5 relative
                   text-gray-900 font-sans flex flex-col"
        style={{ minWidth: "280px" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition text-2xl font-bold"
          title="Close"
        >
          &times;
        </button>

        {/* Title */}
        <h2
          id="task-modal-title"
          className="text-xl font-semibold mb-3 truncate"
          title={task.task}
        >
          {task.task}
        </h2>

        {/* Content */}
        <div
          id="task-modal-desc"
          className="flex-grow overflow-y-auto pr-2 space-y-3 text-sm text-gray-700"
          style={{ maxHeight: "calc(80vh - 160px)" }}
        >
          <div>
            <div className="font-semibold text-gray-800 mb-1">Description</div>
            <p className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2">
              {task.description || "No description"}
            </p>
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-1">Assignee</div>
            <p>{assignee ? assignee.fullName : "Unknown"}</p>
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-1">Deadline</div>
            <p>
              {task.deadline
                ? new Date(task.deadline).toLocaleString()
                : "No deadline set"}
            </p>
            {!isLeader && task.status === "pending" && task.deadline && (
              <CountdownTimer deadline={task.deadline} />
            )}
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-1">Status</div>
            <span
              className={`capitalize font-semibold px-2 py-1 rounded-full inline-block select-none
                ${statusColors[task.status] || "bg-gray-200 text-gray-700"}`}
              style={{ minWidth: "80px", textAlign: "center" }}
            >
              {task.status}
            </span>
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-1">GitHub Repo</div>
            {team.github_repo ? (
              <a
                href={team.github_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-words"
              >
                {team.github_repo}
              </a>
            ) : (
              <p className="italic text-gray-400">No repo linked</p>
            )}
          </div>

          <div>
            <div className="font-semibold text-gray-800 mb-1">Comments</div>
            {task.comments?.length ? (
              <ul className="list-disc ml-5 space-y-1">
                {task.comments.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-400">No comments</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {isAssignee && task.status === "pending" && (
            <button
              onClick={handleSubmit}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded shadow transition text-sm"
            >
              Submit for Review
            </button>
          )}

          {isLeader && task.status === "under review" && (
            <>
              <button
                onClick={handleApprove}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded shadow transition text-sm"
              >
                Approve Task
              </button>

              <textarea
                value={reassignComment}
                onChange={(e) => setReassignComment(e.target.value)}
                placeholder="Reason for reassignment"
                rows={3}
                className="w-full border border-gray-300 rounded p-2 text-gray-700 resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50 text-sm"
              />

              <button
                onClick={handleReassign}
                disabled={task.status !== "under review"}
                className={`w-full py-2 rounded text-white font-semibold shadow transition text-sm
                  ${
                    task.status !== "under review"
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                Reassign Task
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-3 border-t pt-2 select-none">
          {footerMessage}
        </p>
      </div>
    </div>
  );
}

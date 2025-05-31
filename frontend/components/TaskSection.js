import { useEffect, useState } from "react";
import CreateTaskModal from "./CreateTask";
import TaskModal from "./TaskModal";

export default function TasksSection({ team, user, socket }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!socket?.connected || !team?._id || !user?._id || !team?.leader) return;

    const payload = {
      teamId: team._id,
      userId: user._id,
      is_leader: team.leader === user._id,
    };

    socket.emit("task_history", payload);

    const handleTaskHistory = ({ success, data }) => {
      if (success && Array.isArray(data)) setTasks(data);
    };

    const handleTaskCreated = ({ success, data }) => {
      if (success && data) setTasks((prev) => [...prev, data]);
    };

    const handleTaskUpdated = ({ success, data }) => {
      if (success && data?._id) {
        setTasks((prev) =>
          prev.map((task) => (task._id === data._id ? data : task))
        );
      }
    };

    socket.on("task_history", handleTaskHistory);
    socket.on("task_created", handleTaskCreated);
    socket.on("task_updated", handleTaskUpdated);

    return () => {
      socket.off("task_history", handleTaskHistory);
      socket.off("task_created", handleTaskCreated);
      socket.off("task_updated", handleTaskUpdated);
    };
  }, [socket?.connected, team?._id, user?._id, team?.leader]);

  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t._id === selectedTask._id);
      if (updated && updated !== selectedTask) {
        setSelectedTask(updated);
      }
    }
  }, [tasks]);

  const handleCreateTask = (newTask) => {
    if (!newTask?.task || !newTask?.assigned_to) return;

    socket.emit("task_create", {
      task: newTask.task,
      assigned_to: newTask.assigned_to,
      teamId: team._id,
      description: newTask.description,
      deadline: newTask.deadline, // ✅ pass deadline
    });

    setShowCreateModal(false);
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    if (!taskId || !newStatus) return;

    if (newStatus === "under review") {
      socket.emit("task_review", {
        taskId,
        leaderId: team.leader,
      });
    } else if (newStatus === "completed") {
      socket.emit("task_approve", {
        taskId,
        teamId: team._id,
      });
    }

    setSelectedTask(null);
  };

  const handleComment = (taskId, comment) => {
    if (!taskId || !comment) return;
    socket.emit("task_comment", { taskId, comment });
  };

  const getMemberName = (id) =>
    team.member_details.find((m) => m._id === id)?.fullName || "Unknown";

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "under review": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 rounded-lg shadow-md max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Tasks
        </h2>
        {user._id === team.leader && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md hover:from-blue-700 hover:to-blue-600 transition"
          >
            + Task
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="overflow-y-auto flex-grow space-y-4 pr-1">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 italic select-none">
            No tasks available.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              onClick={() => setSelectedTask(task)}
              className="cursor-pointer p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition flex flex-col gap-1 bg-white"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelectedTask(task)}
            >
              <p className="font-semibold text-lg text-gray-900 truncate">
                {task.task}
              </p>
              <p className="text-sm text-gray-600">
                Assigned to:{" "}
                <span className="font-medium text-gray-800">
                  {getMemberName(task.assigned_to)}
                </span>
              </p>
              <p className="text-sm text-gray-900">
                Status:{" "}
                <span
                  className={`inline-block px-3 py-0.5 rounded-full font-semibold text-sm capitalize ${
                    statusColors[task.status] || "bg-gray-200 text-gray-700"
                  }`}
                >
                  {task.status}
                </span>
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          user={user}
          team={team}
          onClose={() => setSelectedTask(null)}
          updateStatus={handleStatusUpdate}
          addComment={handleComment}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          team={team}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}

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

    console.log("Emitting task_history with payload:", payload);
    socket.emit("task_history", payload);

    const handleTaskHistory = ({ success, data }) => {
      if (success && Array.isArray(data)) setTasks(data);
      console.log(data);
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
        setSelectedTask(updated); // 🔄 refresh modal with updated task
      }
    }
  }, [tasks]);

  const handleCreateTask = (newTask) => {
    if (!newTask?.task || !newTask?.assigned_to) return;

    socket.emit("task_create", {
      task: newTask.task,
      assigned_to: newTask.assigned_to,
      teamId: team._id,
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
        teamId: team._id, // ✅ Add this
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

  return (
    <div className="flex flex-col h-full p-4 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        {user._id === team.leader && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Task
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-grow space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              onClick={() => setSelectedTask(task)}
              className="p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer transition"
            >
              <p className="font-medium">{task.task}</p>
              <p className="text-sm text-gray-500">
                Assigned to: {getMemberName(task.assigned_to)}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className="font-semibold capitalize text-blue-600">
                  {task.status}
                </span>
              </p>
            </div>
          ))
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <TaskModal
            task={selectedTask}
            user={user}
            team={team}
            onClose={() => setSelectedTask(null)}
            updateStatus={handleStatusUpdate}
            addComment={handleComment}
          />
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <CreateTaskModal
            team={team}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTask}
          />
        </div>
      )}
    </div>
  );
}

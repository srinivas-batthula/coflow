import { useEffect, useState } from "react";
import { Plus, UserCircle2, ListChecks, Flag, ScrollText } from "lucide-react";
import CreateTaskModal from "./CreateTask";
import TaskModal from "./TaskModal";
import toast from "react-hot-toast";

export default function TasksSection({ team, user, socket }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!socket?.connected || !team?._id || !user?._id) return;
    socket.emit("task_history", {
      teamId: team._id,
      userId: user._id,
      is_leader: user._id === team.leader,
    });

    socket.on("task_history", ({ success, data }) => {
      if (success) setTasks(data);
      else toast.error("Failed to load tasks");
    });

    socket.on("task_created", ({ success, data }) => {
      if (success) {
        setTasks((prev) => [...prev, data]);
        toast.success("Task created");
      } else toast.error("Failed to create task");
    });

    socket.on("task_updated", ({ success, data }) => {
      if (success) {
        setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
        setSelectedTask((prev) =>
          prev && prev._id === data._id ? data : prev
        );

        const isAssignee = data.assigned_to === user._id;
        const isLeader = user._id === team.leader;
        if (isAssignee || isLeader) {
          toast.success("Task updated");
        }
      }
    });

    return () => {
      socket.off("task_history");
      socket.off("task_created");
      socket.off("task_updated");
    };
  }, [socket, team, user]);

  const handleCreateTask = (newTask) => {
    if (!newTask.task || !newTask.assigned_to)
      return toast.error("Task name and assignee required");
    socket.emit("task_create", {
      task: newTask.task,
      assigned_to: newTask.assigned_to,
      teamId: team._id,
      description: newTask.description,
      deadline: newTask.deadline,
    });
    setShowCreateModal(false);
  };

  const updateStatus = (taskId, newStatus) => {
    if (newStatus === "under review") {
      socket.emit("task_review", { taskId, leaderId: team.leader });
    } else if (newStatus === "completed") {
      socket.emit("task_approve", {
        taskId,
        teamId: team._id,
        leaderId: user._id,
        assigneeId: selectedTask?.assigned_to,
      });
    } else if (newStatus === "pending") {
      socket.emit("task_reassign", {
        taskId,
        leaderId: user._id,
        assigneeId: selectedTask?.assigned_to,
      });
    }
  };

  const addComment = (taskId, comment) => {
    if (!comment) return toast.error("Comment is required");
    socket.emit("task_comment", { taskId, comment });
    toast.success("Comment added");
  };

  const getMemberName = (id) =>
    team.member_details.find((m) => m._id === id)?.fullName || "Unknown";

  return (
    <div className="flex flex-col  max-w-5xl h-[100%] mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
          <ListChecks className="w-6 h-6" />
          Tasks
        </h2>
        {user._id === team.leader && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Scrollable Task List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">No tasks available.</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              onClick={() => setSelectedTask(task)}
              className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              <p className="text-lg font-semibold text-black flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-gray-400" />
                {task.task}
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <UserCircle2 className="w-4 h-4 text-gray-400" />
                Assigned to:{" "}
                <span className="ml-1">{getMemberName(task.assigned_to)}</span>
              </p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Flag className="w-4 h-4 text-gray-400" />
                Status:
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
                    task.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : task.status === "under review"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
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
          key={selectedTask._id + (selectedTask.updatedAt || "")}
          task={selectedTask}
          user={user}
          team={team}
          onClose={() => setSelectedTask(null)}
          updateStatus={updateStatus}
          addComment={addComment}
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

// socket/teamSocket.js
const Task = require("../models/taskModel");

module.exports = (io, socket) => {
  const fetchHistory = async ({ teamId, userId, is_leader }) => {
    // console.log(teamId, userId, is_leader);
    if (!teamId || !userId) {
      console.warn("Invalid task_history payload", { teamId, userId });
      socket.emit("task_history", { success: false, data: [] });
      return;
    }
    try {
      const data = is_leader
        ? await Task.find({ teamId }).lean()
        : await Task.find({
            $and: [{ teamId }, { assigned_to: userId }],
          }).lean(); // ✅ Corrected
      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, data: [] };
    }
  };

  const createUpdate = async ({ condition, body, taskId }) => {
    try {
      let data;

      switch (condition) {
        case "create":
          data = await Task.create(body);
          break;
        case "status_update":
          data = await Task.findByIdAndUpdate(taskId, body, {
            new: true,
            runValidators: true,
          });
          break;
        case "comment_update":
          data = await Task.findByIdAndUpdate(
            taskId,
            { $push: { comments: body } },
            { new: true, runValidators: true }
          );
          break;
        default:
          throw new Error("Invalid condition");
      }

      return { success: true, data };
    } catch (error) {
      console.error(error);
      return { success: false, data: {} };
    }
  };
  socket.on("task_history", async ({ teamId, userId, is_leader }) => {
    socket.join(userId); // for personal messages
    socket.join(`team_${teamId}`); // for team-wide broadcasts

    const result = await fetchHistory({ teamId, userId, is_leader });
    socket.emit("task_history", result);
  });

  socket.on(
    "task_create",
    async ({ task, assigned_to, teamId, description, deadline }) => {
      const result = await createUpdate({
        condition: "create",
        body: {
          task,
          assigned_to,
          teamId,
          description,
          deadline, // ✅ Add this
          status: "pending",
          comments: [],
          // createdAt and updatedAt will be auto-managed by mongoose if your schema uses timestamps
        },
        taskId: "",
      });

      // Send full task data to leader and assignee
      socket.emit("task_created", result); // To leader
      io.to(assigned_to).emit("task_created", result); // To assignee
    }
  );

  socket.on("task_review", async ({ taskId, leaderId }) => {
    const result = await createUpdate({
      condition: "status_update",
      body: { status: "under review" },
      taskId,
    });

    if (result.success && result.data) {
      const assignee = result.data.assigned_to;
      socket.emit("task_updated", result); // To submitter
      io.to(leaderId).emit("task_updated", result); // To leader
      io.to(assignee).emit("task_updated", result); // Also to assignee
    }
  });

  socket.on(
    "task_approve",
    async ({ taskId, teamId, leaderId, assigneeId }) => {
      const result = await createUpdate({
        condition: "status_update",
        body: { status: "completed" },
        taskId,
      });

      if (result.success && result.data) {
        //   const assigneeId = result.data.assigned_to?.toString();

        // Emit update to leader (sender)
        io.to(leaderId).emit("task_updated", result);

        // Emit update to assignee (important)
        if (assigneeId) {
          io.to(assigneeId).emit("task_updated", result);
        }
      }
    }
  );

  socket.on("task_comment", async ({ taskId, comment }) => {
    const result = await createUpdate({
      condition: "comment_update",
      body: comment,
      taskId,
    });

    if (result.success && result.data) {
      io.to(result.data.assigned_to).emit("task_updated", {
        success: true,
        data: result.data,
      });
    }
  });

  socket.on("task_reassign", async ({ taskId, leaderId, assigneeId }) => {
    const result = await createUpdate({
      condition: "status_update",
      body: { status: "pending" },
      taskId,
    });

    if (result.success && result.data) {
      io.to(assigneeId).emit("task_updated", result);
      io.to(leaderId).emit("task_updated", result);
    }
  });
};

// socket/teamSocket.js
const Task = require("../models/taskModel");
const {sendPushToOfflineUsers} = require("../services/notifications/push_redis-queue");

const fetchHistory = async ({ teamId, userId, is_leader }) => {
  // console.log(teamId, userId, is_leader);
  if (!teamId || !userId) {
    console.log("Invalid task_history payload");
    return { success: false, data: [] };
  }
  try {
    const data = is_leader
      ? await Task.find({ teamId }).sort({ updatedAt: -1 }).lean()
      : await Task.find({ $and: [{ teamId }, { assigned_to: userId }] })
        .sort({ updatedAt: -1 })
        .lean(); // Only `tasks` of a 'team && current member' is returned...
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

const createUpdate = async ({ condition, body, taskId }) => {
  try {
    let data = {};

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
          { $push: { comments: body.comment }, $set: { status: body.status } },
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

module.exports = (io, socket) => {
  socket.on("task_history", async ({ teamId, userId, is_leader }) => {
    socket.join(userId);    // This is for TASK's in `taskSocket.js`...
    socket.join(teamId);   // This is for GROUP CHAT in `chatSocket.js`...
    // console.log("Rooms after join:", Array.from(socket.rooms));
    const result = await fetchHistory({ teamId, userId, is_leader });
    
    socket.emit("task_history", result);
  });

  socket.on(
    "task_create",
    async ({ task, assigned_to, description, deadline, teamId, teamName }) => {
      const result = await createUpdate({
        condition: "create",
        body: {
          task,
          assigned_to,
          teamId,
          description,
          deadline,
        },
        taskId: "",
      });

      if (result.success && result.data) {
        socket.emit("task_created", result); // To leader
        io.to(assigned_to).emit("task_created", result); // To assignee
        // Push Notification to `assignee`...
        await sendPushToOfflineUsers(io, [assigned_to], { title: `New Task Alert from ${teamName}`, body: `${result.data.task.slice(0, 30)}${result.data.task.length > 30 ? '...' : ''}` }).catch((err)=>{console.log(err)});
      }
    }
  );

  socket.on("task_review", async ({ taskId, leaderId }) => {
    const result = await createUpdate({
      condition: "status_update",
      body: { status: "under review" },
      taskId,
    });

    if (result.success && result.data) {
      socket.emit("task_updated", result); // To submitter
      io.to(leaderId).emit("task_updated", result); // To leader
      // Push Notification to `leader`...
      await sendPushToOfflineUsers(io, [leaderId], { title: `Task Submitted for review by ${socket.user.fullName}`, body: `${result.data?.task.slice(0, 30)}${result.data?.task.length > 30 ? '...' : ''}` }).catch((err)=>{console.log(err)});
    }
  });

  socket.on(
    "task_approve",
    async ({ taskId, teamName, assigned_to }) => {
      const result = await createUpdate({
        condition: "status_update",
        body: { status: "completed" },
        taskId,
      });

      if (result.success && result.data) {
        socket.emit("task_updated", result); // To leader
        io.to(assigned_to).emit("task_updated", result); // To member
        // Push Notification to `assignee`...
        await sendPushToOfflineUsers(io, [assigned_to], { title: `Your Task Approved in ${teamName}`, body: `${result.data?.task.slice(0, 30)}${result.data?.task.length > 30 ? '...' : ''}` }).catch((err)=>{console.log(err)});
      }
    }
  );

  socket.on("task_comment", async ({ taskId, comment, teamName, assigned_to }) => {  // Added comment for task & re-assigned to user...
    const result = await createUpdate({
      condition: "comment_update",
      body: { comment, status: 'pending' },
      taskId,
    });

    if (result.success && result.data) {
      socket.emit("task_updated", result); // To leader
      io.to(assigned_to).emit("task_updated", result); // To member
      // Push Notification to `assignee`...
      await sendPushToOfflineUsers(io, [assigned_to], { title: `Added comment for your Task in ${teamName}`, body: `${comment.slice(0, 30)}${comment.length > 30 ? '...' : ''}` }).catch((err)=>{console.log(err)});
    }
  });
};
// socket/chatSocket.js
const { default: mongoose } = require("mongoose");
const Message = require("../models/chatMessageModel");
const {
  sendPushToOfflineUsers,
} = require("../services/notifications/push_redis-queue");

const fetchHistory = async ({ teamId }) => {
  if (!teamId) {
    console.log("Invalid chat_history payload");
    return { success: false, data: [] };
  }
  try {
    const data = await Message.aggregate([
      {
        $match: { teamId: new mongoose.Types.ObjectId(teamId) },
      },
      {
        $lookup: {
          from: "hackpilot_users",
          localField: "sender",
          foreignField: "_id",
          as: "sender_info",
        },
      },
      {
        $unwind: "$sender_info",
      },
      {
        $project: {
          _id: 1,
          message: 1,
          teamId: 1,
          sender: {
            _id: "$sender_info._id",
            name: "$sender_info.fullName",
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $sort: { updatedAt: 1 }, // oldest to newest...
      },
    ]);
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
};

const createUpdate = async ({ condition, body, messageId }) => {
  try {
    let data = {};
    console.log(body);
    switch (condition) {
      case "create":
        data = await Message.create(body);

        // After creating the message, populate sender info for consistency
        const populated = await Message.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(data._id) } },
          {
            $lookup: {
              from: "hackpilot_users",
              localField: "sender",
              foreignField: "_id",
              as: "sender_info",
            },
          },
          { $unwind: "$sender_info" },
          {
            $project: {
              _id: 1,
              message: 1,
              teamId: 1,
              sender: {
                _id: "$sender_info._id",
                name: "$sender_info.fullName",
              },
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ]);

        if (populated.length > 0) {
          data = populated[0];
        }
        break;
      default:
        console.log("Invalid condition");
    }

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: {} };
  }
};

module.exports = (io, socket) => {
  socket.on("onlineUsers", async ({ members_ids = [] }) => {
    // This event is emitted from `ParticipantSection.js` component from frontend...
    const onlineMembers = [];
    for (const userId of members_ids) {
      const room = io.sockets.adapter.rooms.get(userId);
      const isOnline = room && room.size > 0;
      if (isOnline) onlineMembers.push(userId);
    }
    socket.emit("onlineUsers", { onlineMembers });
  });

  socket.on("message_history", async ({ teamId }) => {
    // Fetch previous `messages` of current team/group...
    // socket.join(teamId);            // Joined to `teamId` -room in 'task_history' in `taskSocket.js`...
    const result = await fetchHistory({ teamId });

    socket.emit("message_history", result);
  });

  socket.on(
    "message_create",
    async ({ message, teamId, teamName, members_ids = [], userId }) => {
      // Message Create...  { members_ids: [ list of member id's ] }...
      const result = await createUpdate({
        condition: "create",
        body: { message, sender: userId, teamId },
        messageId: "",
      });

      if (result.success && result.data) {
        io.to(teamId).emit("message_created", result);
        // Push Notifications to all members in `group/team`...
        // await sendPushToOfflineUsers(io, members_ids, { title: `${socket.user.fullName} sent a message in team -${teamName}`, body: `${message.slice(0, 30)}${message.length > 30 ? '...' : ''}` });
      }
    }
  );
};

// socket/chatSocket.js
const { default: mongoose } = require('mongoose');
const Message = require('../models/chatMessageModel');
const { sendPushToOfflineUsers } = require('../services/notifications/push_redis-queue');

const fetchHistory = async ({ teamId, userId }) => {
  if (!teamId || !userId) {
    console.log('Invalid chat_history payload');
    return { success: false, data: [] };
  }
  try {
    await Message.updateMany(
      // Update userId in seen_by
      {
        teamId: new mongoose.Types.ObjectId(teamId),
        sender: { $ne: userId },
        seen_by: { $ne: userId },
      },
      {
        $addToSet: { seen_by: userId },
      }
    );

    const data = await Message.aggregate([
      {
        $match: { teamId: new mongoose.Types.ObjectId(teamId) },
      },
      {
        $lookup: {
          from: 'hackpilot_users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender_info',
        },
      },
      {
        $unwind: '$sender_info',
      },
      {
        $project: {
          _id: 1,
          message: 1,
          teamId: 1,
          sender: {
            _id: '$sender_info._id',
            name: '$sender_info.fullName',
          },
          seen_by: 1,
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
    switch (condition) {
      case 'create':
        data = await Message.create(body).then((doc) => doc.toObject()); // To mutate `data` object after this...
        break;
      case 'status_update':
        data = await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { seen_by: body._id } },
          { new: true, runValidators: true }
        ).then((doc) => doc.toObject());
        break;
      default:
        console.log('Invalid condition');
    }

    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, data: {} };
  }
};

module.exports = (io, socket) => {
  socket.on('onlineUsers', async ({ teamId, members_ids = [] }) => {
    // This event is emitted from `ParticipantSection.js` component from frontend...
    const onlineMembers = [];
    for (const userId of members_ids) {
      const room = io.sockets.adapter.rooms.get(userId);
      const isOnline = room && room.size > 0;
      if (isOnline) onlineMembers.push(userId);
    }
    io.to(teamId).emit('onlineUsers', { onlineMembers }); // Emit to all mem's when a new user connects with team...
  });

  socket.on('message_history', async ({ teamId }) => {
    // Fetch previous `messages` of current team/group...
    // Joined to `teamId` -room in 'task_history' in `taskSocket.js`...
    const result = await fetchHistory({ teamId, userId: socket.user._id });
    io.to(teamId).emit('message_history', result); // Emit 'message_history' to all mem's when a new user connects, to sync all msg's status for all mem's...
  });

  socket.on('message_create', async ({ message, teamId, teamName, members_ids, userId }) => {
    // Message Create...  { members_ids: [ list of member id's ] }...
    let result = await createUpdate({
      condition: 'create',
      body: { message, sender: userId, teamId },
      messageId: '',
    });

    if (result.success && result.data) {
      result.data.sender = {
        _id: socket.user._id,
        name: socket.user.fullName,
      };
      io.to(teamId).emit('message_created', result);
      // Push Notifications to all members in `group/team`...
      await sendPushToOfflineUsers(io, members_ids, {
        title: `${socket.user.fullName} sent a message in team -${teamName}`,
        body: `${message.slice(0, 30)}${message.length > 30 ? '...' : ''}`,
        id: teamId,
      }).catch((err) => {
        console.log(err);
      });
    }
  });

  // Handle typing indicator...
  socket.on('message_start_typing', ({ teamId, userId, name }) => {
    socket.to(teamId).emit('message_started_typing', { userId, name });
  });

  socket.on('message_stop_typing', ({ teamId, userId }) => {
    socket.to(teamId).emit('message_stopped_typing', { userId });
  });

  // Handle Message Delivery Status...
  socket.on('message_mark_seen', async ({ message_id, sender_id, sender_name }) => {
    let result = await createUpdate({
      condition: 'status_update',
      body: { _id: socket.user._id },
      messageId: message_id,
    });

    if (result.success && result.data) {
      result.data.sender = {
        _id: sender_id,
        name: sender_name,
      };
      io.to(sender_id).emit('message_updated', result); // Only To `sender` as a message-seen...
    }
  });
};

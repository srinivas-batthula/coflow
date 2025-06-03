// socket/chatSocket.js
const Message = require('../models/chatMessageModel')
const enqueuePush = require('../services/notifications/push_redis-queue')

const fetchHistory = async ({teamId}) => {
    if (!teamId) {
        console.log("Invalid chat_history payload");
        return { success: false, data: [] };
    }
    try {
        const data = await Message.aggregate([
            {
                $match: { teamId: new mongoose.Types.ObjectId(teamId) }
            },
            {
                $lookup: {
                    from: "hackpilot_users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "sender_info"
                }
            },
            {
                $unwind: "$sender_info"
            },
            {
                $project: {
                    _id: 1,
                    message: 1,
                    teamId: 1,
                    sender: {
                        _id: "$sender_info._id",
                        name: "$sender_info.fullName"
                    },
                    createdAt: 1,
                    updatedAt: 1,
                }
            },
            {
                $sort: { updatedAt: -1 } // newest to oldest...
            }
        ]);
        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, data: [] };
    }
};

const createUpdate = async ({condition, body, messageId}) => {
    try {
        let data = {}
        switch (condition) {
            case "create":
                data = await Message.create(body);
                break;
            default:
                console.log("Invalid condition");
        }

        return { success: true, data };
    } catch (error) {
        console.error(error);
        return { success: false, data: {} };
    }
}

module.exports = (io, socket) => {
    socket.on('message_history', async ({ teamId }) => {   // Fetch previous `messages` of current team/group...
        // console.log(teamId, members_ids)
        socket.join(teamId);
        const result = await fetchHistory({teamId});
        socket.emit('message_history', result);
    });

    socket.on("message_create", async ({ message, teamId, teamName }) => {    // Message Create...
        const result = await createUpdate({condition: 'create', body: { message, sender: socket.user._id, teamId }, messageId: ''});

        if (result.success && result.data) {
            io.to(teamId).emit("message_created", result);
            // Push Notifications to all members in `group/team`...
            // await enqueuePush(teamId, true, { title: `${socket.user.fullName} sent a message in team -${teamName}`, body: `${message.slice(0, 50)}${message.length > 50 ? '...' : ''}` });
        }
    });
};
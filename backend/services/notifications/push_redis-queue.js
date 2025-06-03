// notifications/push_redis-queue.js
require('dotenv').config({ path: './config.env' })
const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL)

// To filter out only Offline Users from all...
const sendPushToOfflineUsers = async (io, userIds = [], payload) => {
    try {
        const offlineUsers = [];

        for (const userId of userIds) {
            const room = io.sockets.adapter.rooms.get(userId.toString());
            const isOnline = room && room.size > 0;
            if (!isOnline) {        // Add to Redis Queue only if user is offline...
                offlineUsers.push(userId);
            }
        }

        if (offlineUsers.length > 0) {
            const res = await enqueuePush(offlineUsers, payload);   // Push to Redis...
        }
    } catch (err) {
        console.error("Error in sendPushToOfflineUsers:", err);
    }
};

// To push notifications into Redis Queue...
const enqueuePush = async (ids, payload, ping = false) => {   // ids = [userId, ..] ,&, is_teamId = (`true` for message_notify's) ,&, payload = { title, body }...
    if (!ids || !payload) {
        console.error("Missing required fields for redis-push")
        return false
    }
    try {
        const job = { ping, ids, payload }
        await redis.rpush("push:queue", JSON.stringify(job));   // Push to Redis Queue...
        return true
    } catch (error) {
        console.error("Failed to enqueue redis-push: ", error)
        return false
    }
};

module.exports = { enqueuePush, sendPushToOfflineUsers };
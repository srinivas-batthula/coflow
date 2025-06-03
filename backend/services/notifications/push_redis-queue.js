// notifications/push_redis-queue.js
require('dotenv').config({path:'./config.env'})
const Redis = require("ioredis")

const redis = new Redis(process.env.REDIS_URL)

const enqueuePush = async ( id, is_teamId=false, payload, ping=false ) => {   // id = teamId/userId ,&, is_teamId = (`true` for message_notify's) ,&, payload = { title, body }...
    if (!id || !payload) {
        console.error("Missing required fields for redis-push")
        return false
    }
    try {
        const job = { ping, is_teamId, id, payload }
        await redis.rpush("push:queue", JSON.stringify(job));
        return true
    } catch (error) {
        console.error("Failed to enqueue redis-push: ", error)
        return false
    }
};

module.exports = enqueuePush
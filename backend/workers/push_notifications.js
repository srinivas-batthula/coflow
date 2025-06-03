// workers/push_notifications.js
require('dotenv').config({ path: './config.env' })
const User = require('../models/userModel')
const Team = require('../models/TeamModel')
const Redis = require("ioredis")
const webPush = require("web-push")

const redis = new Redis(process.env.REDIS_URL)  // Initialize Redis...

webPush.setVapidDetails('mailto:srinivasb.temp@gmail.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)    // Setup Web Push (VAPID keys)...

// Listen to Redis Queue...
const startWorker = async () => {
    console.log("Push-Notification Background-Worker started...");

    while (true) {
        try {
            const [, raw] = await redis.blpop("push:queue", 0)       // Blocks until new item is available in Redis Queue...
            const job = JSON.parse(raw)
            const { ping, is_teamId, id, payload } = job

            if (ping) {        // ping==true
                console.log('Notification-Worker PING...')
                continue
            }
            if (!id || !payload) {
                console.error("Invalid push job received: ", job)
                continue
            }

            let subscriptions = []
            if (!is_teamId) {
                const subscription = await User.findById(id).select('subscription').lean();     // Fetch subscription of userId...
                subscriptions.push(subscription);
            }
            else {
                const list = await Team.aggregate([
                    {
                        $match: { _id: new mongoose.Types.ObjectId(id) }
                    },
                    {
                        $project: { members: 1 }
                    },
                    {
                        $unwind: "$members"
                    },
                    {
                        $lookup: {
                            from: "hackpilot_users",
                            localField: "members",
                            foreignField: "_id",
                            as: "userInfo"
                        }
                    },
                    {
                        $unwind: "$userInfo"
                    },
                    {
                        $project: {
                            subscription: "$userInfo.subscription"
                        }
                    }
                ])
                subscriptions = list.map(item => item.subscription).filter(sub => sub);     // Removes null/undefined...
            }

            // Send Push Notification's to all...
            const sendPushToAll = async (subscriptions) => {
                await Promise.all(
                    subscriptions.map(async (sub) => {
                        try {
                            await webPush.sendNotification(sub, JSON.stringify(payload));
                        } catch (err) {
                            console.error("Push failed for: ", sub.endpoint, " | ", err);
                        }
                    })
                );
            };
            await sendPushToAll(subscriptions);
            console.log(`📨 Push sent to ${id}: ${payload.title}`)
        } catch (err) {
            console.error("Error in push worker: ", err)
        }
    }
}

module.exports = startWorker
// workers/push_notifications.js
require('dotenv').config({ path: './config.env' });
const User = require('../models/userModel');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const webPush = require('web-push');

webPush.setVapidDetails(
    'mailto:srinivasb.temp@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
); // Setup Web Push (VAPID keys)...

const getSubscriptionsForUsers = async (userIds) => {
    try {
        const objectIds = userIds.map((id) => new mongoose.Types.ObjectId(id));
        const users = await User.find({ _id: { $in: objectIds } })
            .select('subscription')
            .lean();
        return users.map((u) => u.subscription).filter(Boolean);
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Listen to Redis Queue...
const startWorker = async () => {
    console.log('Push-Notification Background-Worker started...');
    let redis;
    try {
        redis = new Redis(process.env.REDIS_URL); // Initialize Redis...
    } catch (error) {
        console.log('Error while connecting to redis (Worker): ', error);
    }

    while (true) {
        try {
            const [, raw] = await redis.blpop('push:queue', 0); // Blocks until new item is available in Redis Queue...
            const job = JSON.parse(raw);
            const { ping, ids, payload } = job;

            if (ping) {
                // ping==true
                console.log('Notification-Worker PING...');
                continue;
            }
            if (!ids || !payload) {
                console.error('Invalid push job received: ', job);
                continue;
            }

            const subscriptions = await getSubscriptionsForUsers(ids);

            // Send Push Notification's to all...
            const sendPushToAll = async (subscriptions) => {
                await Promise.all(
                    subscriptions.map(async (sub) => {
                        try {
                            await webPush.sendNotification(sub, JSON.stringify(payload)); // Push notifications sent...
                        } catch (err) {
                            console.error('Push failed for: ', sub.endpoint, ' | ', err);
                        }
                    })
                );
            };
            await sendPushToAll(subscriptions);
            // console.log(`📨 Push sent to ${ids}`);
        } catch (err) {
            console.error('Error in push worker: ', err);
        }
    }
};

module.exports = startWorker;

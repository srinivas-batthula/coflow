//server.js
const server = require('./app');
const mongoose = require('mongoose');
const startWorker = require('./workers/push_notifications');
require('dotenv').config({ path: './config.env' });

require('./services/cron_jobs/hackathonsUpdater'); // Starting Cron-Jobs (Scheduled)...

const ConnectDb = () => {
    mongoose
        .connect(process.env.Mongo_DB_URI)
        .then((res) => {
            console.log(`Connected to MongoDB successfully  -->  ${res}`);
        })
        .catch((err) => {
            console.log(`Error while connecting to MongoDB  -->  ${err}`);
        });
};
ConnectDb();

mongoose.connection.on('connected', () => {
    console.log('Connected to DB...');
});
mongoose.connection.on('error', (err) => {
    console.log(`Error in MongoDB connection  -->  ${err}`);
});
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB is disconnected & attempting to reconnect...');
    ConnectDb();
});

if (process.env.ENABLE_EMBEDDED_WORKER === 'true') {
    // Start the Redis-based worker inline...
    startWorker();
}

const port = process.env.PORT || 8080; //Don't set a PORT n.o after hosting.....
server.listen(port, () => {
    console.log(`Server started & listening at http://localhost:${port}/`);
});

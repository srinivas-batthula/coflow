// tests/seed.js
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Hackathon = require('../models/hackathonsModel');

/**
 * Seeds an in-memory DB with data from a safe source.
 * If ALLOW_PROD_SEED=true, it clones from MongoDB Atlas (prod).
 * Otherwise, seeds from local fixture data.
 */
async function seedDatabase() {
    try {
        if (process.env.ALLOW_PROD_SEED === 'true') {
            console.log('⚠ : Cloning data from PRODUCTION-DB into test DB!');

            const prodConn = await mongoose.createConnection(process.env.Mongo_DB_URI);

            const prodUsers = await prodConn.model('hackpilot_users', User.schema).find({});
            const prodHackathons = await prodConn.model('hackpilot_hackathons', Hackathon.schema).find({});

            await prodConn.close();

            await mongoose.model('hackpilot_users', User.schema).insertMany(prodUsers.map(d => d.toObject()));
            await mongoose.model('hackpilot_hackathons', Hackathon.schema).insertMany(prodHackathons.map(d => d.toObject()));
        }
        else {
            console.log('⚠ : Seeding from LOCAL-fixtures into test DB!');

            // Sample fixture-data for local seeding
            const sampleUsers = [
                { fullName: 'Test User', email: 'srinivasbatthula.mypc@gmail.com', password: '1234' }
            ];
            const sampleHackathons = [
                { title: 'Sample Hackathon', url: 'https://devpost.com/api/hackathons', date: new Date().toISOString(), location: 'Online', city: 'Global', prize: '100,000', host: 'BSP' }
            ];

            await mongoose.model('hackpilot_users', User.schema).insertMany(sampleUsers);
            await mongoose.model('hackpilot_hackathons', Hackathon.schema).insertMany(sampleHackathons);
        }
    }
    catch (err) {
        console.error('Failed to Seed Data to Local-DB : -> ', err);
    }
}


module.exports = seedDatabase;
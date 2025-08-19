// tests/seed.js
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Hackathon = require('../models/hackathonsModel');
const path = require('path');
const fs = require('fs');

/**
    * Seeds an In-Memory DB with data from the local fixture data.
 */
async function seedDatabase() {
    try {
        console.log('⚠ Seeding from static fixtures!'+process.env.TEST_EMAIL);

        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'users.json'), 'utf8'));
        const hackathonsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'hackathons.json'), 'utf8'));

        await mongoose.model('hackpilot_users', User.schema).insertMany(usersData);
        await mongoose.model('hackpilot_hackathons', Hackathon.schema).insertMany(hackathonsData);

        const testUser = {                  // Insert Test User...
            email: process.env.TEST_EMAIL,
            password: process.env.TEST_PASSWORD,
            fullName: "Srinivas"
        };
        await mongoose.model('hackpilot_users', User.schema).create(testUser);
    }
    catch (err) {
        console.error('Failed to Seed Data to Local-DB : -> ', err);
    }
}


module.exports = seedDatabase;
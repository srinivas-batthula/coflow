// tests/seed.js
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Hackathon = require('../models/hackathonsModel');
const Team = require('../models/TeamModel');
const path = require('path');
const fs = require('fs');

/**
 * Seeds an In-Memory DB with data from the local fixture data.
 */
async function seedDatabase() {
    try {
        console.log('⚠ Seeding from static fixtures!');

        const usersData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'fixtures', 'users.json'), 'utf8')
        );
        const hackathonsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'fixtures', 'hackathons.json'), 'utf8')
        );
        const teamsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'fixtures', 'teams.json'), 'utf8')
        );

        await mongoose.model('hackpilot_users', User.schema).insertMany(usersData);
        await mongoose.model('hackpilot_hackathons', Hackathon.schema).insertMany(hackathonsData);
        await mongoose.model('hackpilot_teams', Team.schema).insertMany(teamsData);

        const testUser = {
            // Insert Test User...
            email: process.env.TEST_EMAIL,
            password: process.env.TEST_PASSWORD,
            fullName: 'Srinivas',
        };
        const user = new User(testUser);
        await user.save();
        // await User.create(testUser); // uses schema + pre-save hooks

        await User.find({}).lean();
    } catch (err) {
        console.error('Failed to Seed Data to Local-DB : -> ', err);
    }
}

module.exports = seedDatabase;

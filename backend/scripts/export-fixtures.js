// scripts/export-fixtures.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const Hackathon = require('../models/hackathonsModel');
const Team = require('../models/TeamModel');
require('dotenv').config({path: './config.env'});

/*
    Auto-Fetch static fixture data into JSON-files from Mongodb-Atlas Cloud data by running below CMD --->>>
        ***` $env:Mongo_DB_URI=" mongodb_atlas_connection_string_uri "; node scripts/export-fixtures.js `***
*/

(async () => {
    try {
        await mongoose.connect(process.env.Mongo_DB_URI);
        console.log('Connected to Atlas...');

        let users = await mongoose.model('hackpilot_users', User.schema).find({}).limit(1);
        let hackathons = await mongoose.model('hackpilot_hackathons', Hackathon.schema).find({}).limit(2);
        let teams = await mongoose.model('hackpilot_teams', Team.schema).find({}).limit(2);

        fs.writeFileSync(path.join(__dirname, '../tests/fixtures/users.json'), JSON.stringify(users, null, 2));
        fs.writeFileSync(path.join(__dirname, '../tests/fixtures/hackathons.json'), JSON.stringify(hackathons, null, 2));
        fs.writeFileSync(path.join(__dirname, '../tests/fixtures/teams.json'), JSON.stringify(teams, null, 2));

        console.log('Fixtures exported successfully!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error exporting fixtures:', err);
        process.exit(1);
    }
})();

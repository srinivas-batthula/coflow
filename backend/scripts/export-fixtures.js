// scripts/export-fixtures.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const Hackathon = require('../models/hackathonsModel');

/*
    Auto-Fetch static fixture data into JSON-files from Mongodb-Atlas Cloud data by running below CMD --->>>
        ***` $env:Mongo_DB_URI=" mongodb_atlas_connection_string_uri "; node scripts/export-fixtures.js `***
*/

(async () => {
    try {
        await mongoose.connect(process.env.Mongo_DB_URI);
        console.log('Connected to Atlas...');

        const users = await mongoose.model('hackpilot_users', User.schema).find({});
        const hackathons = await mongoose.model('hackpilot_hackathons', Hackathon.schema).find({});

        fs.writeFileSync(path.join(__dirname, '../tests/fixtures/users.json'), JSON.stringify(users, null, 2));
        fs.writeFileSync(path.join(__dirname, '../tests/fixtures/hackathons.json'), JSON.stringify(hackathons, null, 2));

        console.log('Fixtures exported successfully!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error exporting fixtures:', err);
        process.exit(1);
    }
})();

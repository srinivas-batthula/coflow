// tests/setup.js
const mongoose = require('mongoose');
require('jest-extended');


beforeAll(async () => {
    await mongoose.connect(process.env.Mongo_DB_URI || 'mongodb://localhost:27017/testdb');
});


afterAll(async () => {
    await mongoose.connection.close();
});

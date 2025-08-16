// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');         // Comment in Development Mode &&  Use only in CI/CD...
const seedDatabase = require('./seed');
require('jest-extended');

let mongoServer;


beforeAll(async () => {
    try {
        // await mongoose.connect(process.env.Mongo_DB_URI);   // Directly Run Tests from Cloud-Atlas DB only in Local-DEV...

        console.log(process.env.BACKEND_ENV);
        let memUri;

        if (BACKEND_ENV === 'test') {
            mongoServer = await MongoMemoryServer.create();
            memUri = mongoServer.getUri();
        }
        else {
            memUri = "mongodb://localhost:27017/testdb";
        }

        await mongoose.connect(memUri);

        await seedDatabase();       // Add Data to local-DB for testing...
    }
    catch (err) {
        console.error('Error in beforeAll-tests/ : -> ', err);
    }
});

afterAll(async () => {
    try {
        if (mongoose.connection.readyState) {
            await mongoose.disconnect();
        }
        if (mongoServer) {
            await mongoServer.stop();
        }
    }
    catch (err) {
        console.error('Error in afterAll-tests/ : -> ', err);
    }
});

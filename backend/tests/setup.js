// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedDatabase = require('./seed');
require('dotenv').config({path:'./config.env'})
require('jest-extended');

let mongoServer;


beforeAll(async () => {
    try {
        // await mongoose.connect(process.env.Mongo_DB_URI);   // Directly Run Tests in Cloud-Atlas DB...


        let memUri;
        console.log(process.env.BACKEND_ENV);

        if (process.env.BACKEND_ENV === 'test') {      // Test environment (In CI/CD)...
            mongoServer = await MongoMemoryServer.create();
            memUri = mongoServer.getUri();
        }
        else {                                      // In Development...
            memUri = 'mongodb://localhost:27017/testdb';
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

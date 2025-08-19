// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');         // Comment in Development Mode &&  Use only in CI/CD...
const path = require('path');
const jestOpenAPI = require('jest-openapi').default;
const seedDatabase = require('./seed');
// require('jest-extended');

let mongoServer;


beforeAll(async () => {
    try {
        // await mongoose.connect(process.env.Mongo_DB_URI);   // Directly Run Tests from Cloud-Atlas DB only in Local-DEV... "mongodb://localhost:27017/testdb"
        
        // Load Swagger spec for jest-openapi
        const swaggerPath = path.join(__dirname, '../docs/swagger.json');
        jestOpenAPI(require(swaggerPath));

        console.log(process.env.BACKEND_ENV);

        mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();

        await mongoose.connect(memUri);     // Connect to virtual-db to safely handle data

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

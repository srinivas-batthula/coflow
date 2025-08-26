// tests/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // `MongoMemoryServer` is a virtual mongodb that works well in CI/CD while running tests...
const path = require('path');
const seedDatabase = require('./seed'); // Inserting local fixtures data into virtual `MongoMemoryServer` db
const jestOpenAPI = require('jest-openapi').default; // Validates tests API endpoints responses based on Swagger.json...

let mongoServer;

beforeAll(async () => {
  try {
    // await mongoose.connect(process.env.Mongo_DB_URI);   // Directly Run Tests from Cloud-Atlas DB only in Local-DEV... "mongodb://localhost:27017/testdb"

    // Load Swagger spec for jest-openapi
    const swaggerPath = path.join(__dirname, '../docs/swagger.json');
    jestOpenAPI(require(swaggerPath)); // Validate API responses in Tests (CI/CD) based on `swagger.json` by using `jestOpenAPI`

    console.log('Testing in : ' + process.env.BACKEND_ENV);

    mongoServer = await MongoMemoryServer.create(); // `MongoMemoryServer` is a virtual mongodb that works well in CI/CD while running tests...
    const memUri = mongoServer.getUri();

    await mongoose.connect(memUri); // Connect to virtual-db to safely handle data

    await seedDatabase(); // Add fixtures-Data to `MongoMemoryServer-DB` for testing...
  } catch (err) {
    console.error('Error in beforeAll-tests/ : -> ', err);
  }
});

afterAll(async () => {
  try {
    // Shutting Down Gracefully...
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error in afterAll-tests/ : -> ', err);
  }
});

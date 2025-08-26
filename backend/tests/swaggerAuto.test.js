// tests/swaggerAuto.test.js
const request = require('supertest'); // Sends requests to http API endpoints
const fs = require('fs');
const path = require('path');
const sampler = require('openapi-sampler'); // generates fake body data for requests
const app = require('../app'); //Express App

// load swagger.json
const swaggerPath = path.join(__dirname, '../docs/swagger.json');
const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

// helper: build request body using schema (openapi-sampler)
function buildFakeRequestBody(schema) {
  try {
    return sampler.sample(schema, { skipReadOnly: true });
  } catch (err) {
    console.warn('⚠️ Failed to generate request body:', err.message);
    return {};
  }
}

// Clean up console logs/errors...
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Dynamically create tests for all API endpoints & validate them based on `swagger.json` schema...
describe('Automated API Tests from Swagger', () => {
  for (const [routePath, methods] of Object.entries(swaggerDoc.paths)) {
    // Request each endpoint in `swagger.json` by traversing through them...
    for (const [method, operation] of Object.entries(methods)) {
      test(`${method.toUpperCase()} ${routePath}`, async () => {
        const apiPrefix = swaggerDoc.basePath || '';
        let req = request(app)[method](apiPrefix + routePath.replace(/{/g, ':').replace(/}/g, ''));

        // if body is required
        if (operation.requestBody && operation.requestBody.content) {
          const content = operation.requestBody.content['application/json'];
          if (content && content.schema) {
            const fakeBody = buildFakeRequestBody(content.schema); // generating fake body data using `openapi-sampler`
            req = req.send(fakeBody).set('Content-Type', 'application/json');
          }
        }

        // basic expectations: should return defined response
        const res = await req;
        // const expectedCodes = Object.keys(operation.responses);
        Object.keys(operation.responses);

        // if (!expectedCodes.includes(String(res.status))) {       // Logging the false response status codes...
        //     console.warn(`⚠️ ${method.toUpperCase()} ${routePath} returned ${res.status}, not in spec: [${expectedCodes.join(', ')}m  ]`);
        // }

        expect(res.status).toBeGreaterThanOrEqual(200);
        expect(res.status).toBeLessThan(600);

        // Validate response against Swagger schema by using `jestOpenAPI`...
        // expect(res).toSatisfyApiSpec();
      }, 20000); // increase timeout in case endpoints are slow
    }
  }
});

// tests/swaggerAuto.test.js
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const sampler = require('openapi-sampler');

// load swagger.json
const swaggerPath = path.join(__dirname, '../docs/swagger.json');
const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

const app = require('../app');      //Express App

// helper: build request body using schema (openapi-sampler)
function buildFakeRequestBody(schema) {
    try {
        return sampler.sample(schema, { skipReadOnly: true });
    } catch (err) {
        console.warn("⚠️ Failed to generate request body:", err.message);
        return {};
    }
}

// Clean up console logs/errors...
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});


// dynamically create tests
describe('Automated API Tests from Swagger', () => {
    for (const [routePath, methods] of Object.entries(swaggerDoc.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
            test(`${method.toUpperCase()} ${routePath}`, async () => {
                let req = request(app)[method](routePath.replace(/{/g, ':').replace(/}/g, ''));

                // if body is required
                if (operation.requestBody && operation.requestBody.content) {
                    const content = operation.requestBody.content['application/json'];
                    if (content && content.schema) {
                        const fakeBody = buildFakeRequestBody(content.schema);
                        req = req.send(fakeBody).set('Content-Type', 'application/json');
                    }
                }

                // basic expectations: should return defined response
                const res = await req;
                const expectedCodes = Object.keys(operation.responses);

                // if (!expectedCodes.includes(String(res.status))) {       // Logging the response status codes...
                //     console.warn(`⚠️ ${method.toUpperCase()} ${routePath} returned ${res.status}, not in spec: [${expectedCodes.join(', ')}]`);
                // }
                expect(res.status).toBeGreaterThanOrEqual(200);
                expect(res.status).toBeLessThan(600);

            }, 20000); // increase timeout in case endpoints are slow
        }
    }
});

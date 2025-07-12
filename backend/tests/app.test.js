// tests/app.test.js

const request = require('supertest');
const app = require('../app')


describe('GET /', () => {
    it('should return Guide message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            status: "success",
            details: `You are Viewing a Non-API Route (/), Use '/api/' for all other endpoints to access them`
        });
    });
});


describe('GET /api/hackathons', () => {
    it('should return a list of hackathons', async () => {
        const res = await request(app).get('/api/hackathons');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);                     // Check it's an array
        expect(res.body.data.length).toBeGreaterThan(0);                     // Optional: non-empty

        const firstHackathon = res.body.data[0];
        expect(firstHackathon).toHaveProperty('title');
        expect(firstHackathon).toHaveProperty('url');
        expect(firstHackathon).toHaveProperty('date');
        expect(firstHackathon).toHaveProperty('location');
        expect(firstHackathon).toHaveProperty('city');
        expect(firstHackathon).toHaveProperty('prize');
        expect(firstHackathon).toHaveProperty('host');
    });
});

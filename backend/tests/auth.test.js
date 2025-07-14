// tests/auth.test.js

const request = require('supertest');
const app = require('../app')
const jwt = require('jsonwebtoken');
let token;


// Clean up console logs/errors...
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
    jest.restoreAllMocks();
});


describe('Auth API', () => {
    describe('POST /api/auth/login', () => {            // login test
        it('should return a token for valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'srinivasbatthula.mypc@gmail.com', password: '1234' });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('token');
            expect(typeof res.body.token).toBe('string');
            token = res.body.token;
        });

        it('should return 401/400 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrongEmail@example.com', password: 'wrong' });

            expect([401, 400, 500]).toContain(res.statusCode);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/validateUser?q=true', () => {           // validate test
        it('should return a validated User', async () => {
            const res = await request(app)
                .get('/api/auth/validateUser?q=true')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.auth).toBe(true);
            expect(res.body).toHaveProperty('user');
            console.log('validateUser:  ', res.body.user);
        });

        it('should return 401/400 for invalid credentials', async () => {
            const fakeToken = jwt.sign({ email: 'nonexistent@example.com' }, 'wrong-secret', { expiresIn: '1s' });

            const res = await request(app)
                .get('/api/auth/validateUser?q=true')
                .set('Authorization', `Bearer ${fakeToken}`);

            expect([401, 404]).toContain(res.statusCode);
            expect(res.body.success).toBe(false);
            expect(res.body.auth).toBe(false);
        });
    });

    describe('POST /api/auth/logout', () => {               // logout test
        it('should respond with logout success', async () => {
            const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);   // Setting the token here

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});

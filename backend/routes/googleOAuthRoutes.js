// routes/googleOAuthRoutes.js
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

// ====================
// Google OAuth2.0 Routes
// ====================

// Start Google OAuth flow → redirects user to Google consent screen  -{ `/api/auth/google` }
router.get(
    '/',
    passport.authenticate('google', {
        scope: ['email', 'profile'], // we want email + profile data
    })
);

// Google callback → handles success/failure after user grants permission
router.get(
    '/callback',
    passport.authenticate('google', {
        session: false, // we are not using passport sessions (JWT only)
        failureRedirect: '/api/auth/google/failure', // redirect on failure
    }),
    async (req, res) => {
        try {
            const user = req.user; // user returned from strategy

            // JWT Payload
            const token_body = {
                userId: user._id,
            };

            // Sign JWT token valid for 7 days
            const token = jwt.sign(token_body, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });

            if (!token) {
                // If token generation fails → redirect to login page
                return res.status(501).redirect(process.env.FRONTEND_URL + '/login');
            }

            // Store JWT in a secure, HTTP-only cookie
            res.cookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });

            // Redirect back to frontend (sending token in query for client)
            return res
                .status(201)
                .redirect(process.env.FRONTEND_URL + `/login?token=${token}oauth=true&type=google`);
        } catch (error) {
            console.log(error + '');
            return res.status(500).redirect(process.env.FRONTEND_URL + '/login');
        }
    }
);

// On OAuth failure → redirect user back to login
router.get('/failure', (req, res) => {
    return res.status(500).redirect(process.env.FRONTEND_URL + '/login');
});

module.exports = router;

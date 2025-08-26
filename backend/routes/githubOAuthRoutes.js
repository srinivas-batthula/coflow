// routes/githubOAuthRoutes.js
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

// ====================
// GitHub OAuth2.0 Routes
// ====================

// Start GitHub OAuth flow → redirects to GitHub consent screen { `/api/auth/github` }
router.get(
    '/',
    passport.authenticate('github', {
        scope: ['user:email'], // request access to email
    })
);

// GitHub callback → handles success/failure after user grants permission
router.get(
    '/callback',
    passport.authenticate('github', {
        session: false, // no sessions, using JWT
        failureRedirect: '/api/auth/github/failure',
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
                return res.status(501).redirect(process.env.FRONTEND_URL + '/login');
            }

            // Store JWT in secure HTTP-only cookie
            res.cookie('token', token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            // Redirect back to frontend (sending token in query for client)
            return res
                .status(201)
                .redirect(
                    process.env.FRONTEND_URL + `/login?token=${token}&oauth=true&type=github`
                );
        } catch (error) {
            console.log(error + '');
            return res.status(500).redirect(process.env.FRONTEND_URL + '/login');
        }
    }
);

// On OAuth failure → redirect back to login
router.get('/failure', (req, res) => {
    return res.status(500).redirect(process.env.FRONTEND_URL + '/login');
});

module.exports = router;

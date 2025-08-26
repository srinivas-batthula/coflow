const router = require('express').Router();
const {
    signup,
    login,
    logout,
    protectRoute,
    getUserDetails,
    updateUserDetails,
} = require('../controllers/auth_controller.js');
const EmailSender = require('../services/notifications/emailSender.js');
const googleOAuthRoutes = require('./googleOAuthRoutes.js');
const githubOAuthRoutes = require('./githubOAuthRoutes.js');

// ====================
// Core Auth Routes
// ====================
router.post('/sendEmail', EmailSender);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protectRoute, logout);

// { `/validateUser?q=true` } - Validate User session → called from frontend every time site loads
router.get('/validateUser', protectRoute);

router.get('/user/:id', protectRoute, getUserDetails);
router.patch('/update', protectRoute, updateUserDetails);

// ====================
//      OAuth2.0 Routes...
// ====================
router.use('/google', googleOAuthRoutes); // Google OAuth2.0 Routes
router.use('/github', githubOAuthRoutes); // GitHub OAuth2.0 Routes

module.exports = router;

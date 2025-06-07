const passport = require("passport")
const jwt = require('jsonwebtoken')
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const router = require("express").Router();
const { signup, login, logout, protectRoute, getUserDetails, updateUserDetails } = require("../controllers/auth_controller.js");
const EmailSender = require('../services/notifications/emailSender.js');
const User = require('../models/userModel.js');

router.post("/sendEmail", EmailSender);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Validate User  { `/validateUser?q=true` }
router.get('/validateUser', protectRoute);    // this route is called from frontend every-time user opens the site...

router.get("/user/:id", protectRoute, getUserDetails);
router.patch("/update", protectRoute, updateUserDetails);


// Google -OAuth2.0
let user = {};
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_1 + "",
            clientSecret: process.env.GOOGLE_CLIENT_2 + "",
            callbackURL:
                process.env.NODE_ENV === "production"
                    ? process.env.BACKEND_URL+"/api/auth/google/callback"
                    : "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const data = {
                    //accessed from Google...
                    fullName: profile.displayName,
                    email: profile.emails[0].value,
                    is_from_google: true
                };
                // Check if the user exists in the database...
                let response;
                response = await User.findOne({ email: data.email }).lean();
                if (!response) {
                    //User Not Found,, Create New User...
                    response = await User.create(data);
                }
                user = response;

                // Return the user data to the passport callback
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Google Authentication Routes (Starter Path)
router.get(
    "/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
    })
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/api/auth/google/failure",
    }),
    async (req, res) => {
        try {
            //Token Generation...
            let token_body = {
                userId: user._id
            };
            const token = await jwt.sign(token_body, process.env.JWT_SECRET, { expiresIn: "7d" });
            if (!token) {
                // res.status(501).json({ status: "failed", details: "Token Creation Failed!" });
                return res.status(501).redirect(process.env.FRONTEND_URL+'/login')
            }
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            })
            return res.status(201).redirect(process.env.FRONTEND_URL+`/login?token=${token}&google=true`) //Redirecting User to Home-Page...
            // return res.status(201).json({ success: true, 'details':'User Logged-In successfully!', token })
        } catch (error) {
            // console.log(error)
            // res.status(500).json({ status: "failed", details: "Token Creation Failed!" })
            return res.status(500).redirect(process.env.FRONTEND_URL+'/login')
        }
    }
);

router.get("/google/failure", (req, res) => {
    // res.status(500).json({success: false, 'status': 'Un-Authorized', 'details': 'Please SignIn to continue...'})
    return res.status(500).redirect(process.env.FRONTEND_URL+'/login')
});


module.exports = router;
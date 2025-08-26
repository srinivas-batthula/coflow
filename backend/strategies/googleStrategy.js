// strategies/googleStrategy.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel.js');

module.exports = (passport) => {
    // Register the Google OAuth strategy with Passport
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_1 + '', // Google Client ID
                clientSecret: process.env.GOOGLE_CLIENT_2 + '', // Google Client Secret
                callbackURL:
                    process.env.NODE_ENV === 'production'
                        ? process.env.BACKEND_URL + '/api/auth/google/callback' // Production callback URL
                        : '/api/auth/google/callback', // Dev callback URL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Extract user data from Google profile
                    const data = {
                        fullName: profile.displayName, // Google display name
                        email: profile.emails[0].value, // Google account email
                        is_from_google: true, // flag → logged in via Google
                    };

                    // Check if a user with this email already exists
                    let user = await User.findOne({ email: data.email }).lean();

                    if (!user) {
                        // User not found → create a new one
                        user = await User.create(data);
                    }

                    // Pass user object to Passport callback
                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );
};

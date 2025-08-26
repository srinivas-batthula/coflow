// strategies/googleStrategy.js
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel.js');

module.exports = (passport) => {
  // Register the GitHub OAuth strategy with Passport
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_1 + '', // GitHub Client ID
        clientSecret: process.env.GITHUB_CLIENT_2 + '', // GitHub Client Secret
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? process.env.BACKEND_URL + '/api/auth/github/callback'
            : '/api/auth/github/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let email = null;

          if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value; // sometimes GitHub email can be null if user keeps it private
          }

          if (!email) {
            // Fallback: if email is 'private', then Fetch 'emails' using GitHub API with `accessToken`...
            const { data: emails } = await fetch('https://api.github.com/user/emails', {
              method: 'GET',
              headers: { Authorization: `token ${accessToken}` },
            });
            email = emails.find((e) => e.primary).email; // User's `primaryEmail` in GitHub...
          }

          // Extract user data from GitHub profile
          const data = {
            fullName: profile.displayName || profile.username,
            email,
            is_from_github: true,
          };

          // Check if user exists
          let user = await User.findOne({ email: data.email }).lean();

          if (!user) {
            // Create new user if not found
            user = await User.create(data);
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
};

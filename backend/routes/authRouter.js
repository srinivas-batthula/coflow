const express = require("express");
const {
  signup,
  login,
  logout,
  protectRoute,
  getUserDetails,
  updateUserDetails,
} = require("../controllers/auth_controller.js");
const router = express.Router();

// Signup with Cookie
router.post("/signup", signup);

// Login with Cookie
router.post("/login", login);

// Logout — Clear Cookie
router.post("/logout", logout);

// Validate User  { `/validateUser?q=true` }
router.get('/validateUser', protectRoute);    // this route is called from frontend everytime user opens the site...

// Me - user Details
router.get("/user/:id", protectRoute, getUserDetails);

router.patch("/update", protectRoute, updateUserDetails);

module.exports = router;

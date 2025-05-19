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

// ✅ Signup with Cookie
router.post("/signup", signup);

// ✅ Login with Cookie
router.post("/login", login);

// ✅ Logout — Clear Cookie
router.post("/logout", logout);

// ✅ Me - user Details
router.get("/me", protectRoute, getUserDetails);

//
router.get("/update", protectRoute, updateUserDetails);

module.exports = router;

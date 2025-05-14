const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Set cookie options (secure, HTTP-only in production)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email || !password || !fullName)
    return res.status(400).json({ msg: "All fields are required." });

  if (!/\S+@\S+\.\S+/.test(email))
    return res.status(400).json({ msg: "Invalid email format." });

  if (password.length < 6)
    return res
      .status(400)
      .json({ msg: "Password must be at least 6 characters." });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser._id);
    res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({ userId: newUser._id });
  } catch (err) {
    console.error("error in signup Route: " + err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password." });

    const token = generateToken(user._id);
    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({ userId: user._id });
  } catch (err) {
    console.error("error in login Route: " + err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ msg: "Logged out" });
};

module.exports = {
  signup,
  login,
  logout,
};

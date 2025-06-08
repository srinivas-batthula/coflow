require("dotenv").config({ path: "./config.env" });
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Set cookie options (secure, HTTP-only in production)
const cookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
};

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email || !password || !fullName)
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required!" });

  try {
    const exists = await User.findOne({ email }).lean();
    if (exists)
      return res
        .status(400)
        .json({ success: false, msg: "User already Exists!" });

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    const token = generateToken(newUser._id);
    res.cookie("token", token, cookieOptions);

    return res
      .status(201)
      .json({ success: true, msg: "New User created Successfully!", token });
  } catch (err) {
    console.error("error in signup Route: " + err.message);
    return res
      .status(500)
      .json({ success: false, msg: "Error while creating new user!" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required!" });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, msg: "User Not Found!" });

    if (user.is_from_google) {
      user.password = password;
      user.is_from_google = false;
      await user.save();
    }
    else if (!(await user.comparePassword(password)))    //Comparing Passwords...
      return res
        .status(401)
        .json({ success: false, msg: "Password Not Matched!" });

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions);

    return res
      .status(201)
      .json({ success: true, msg: "Logged-In Successfully!", token });
  } catch (err) {
    console.error("error in login Route: " + err.message);
    return res
      .status(500)
      .json({ success: false, msg: "Error while Logging-In!" });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res
    .status(200)
    .json({ success: true, msg: "Cookie Cleared successfully." });
};

const protectRoute = async (req, res, next) => {
  const { q } = req.query;
  let token = req.cookies?.token;
  token = req.headers.authorization?.split(' ')[1] || '';
  // console.log(req.headers.authorization)

  // If no token found, return 401 Unauthorized
  if (!token) {
    return res
      .status(401)
      .json({ success: false, auth: false, msg: "Cookies/Token Not Found!" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(jwt.decode(token))
    // Fetch the user from the database using userId from decoded token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, auth: false, msg: "User not found!" });
    }

    // Attach the user object to the request so it can be accessed in the next middleware or route handler
    user.password = null;
    req.user = user;

    if (q && q === "true")
      return res.status(200).json({ success: true, auth: true, user });
    else next(); // Call the next middleware or route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res
      .status(401)
      .json({ success: false, auth: false, msg: "Invalid or expired token." });
  }
};

// Route handler to fetch user details
const getUserDetails = async (req, res) => {
  const id = req.params.id;
  try {
    // Find the user by userId which was added to the request object by the middleware
    const user = await User.findById(id).select("-password");

    // Return the user details in the response
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

const updateUserDetails = async (req, res) => {
  const check = req.query.q || '';
  const body = req.body;

  if (!body) {
    return res.status(400).json({ success: false, msg: "Nothing to update." });
  }

  if (check === 'subscription' && !body.subscription) {
    return res.status(400).json({ success: false, msg: "Nothing to update." });
  }
  else if (check !== 'subscription' && (!body.fullName || !body.email)) {
    return res.status(400).json({ success: false, msg: "Nothing to update." });
  }

  try {
    // Save changes
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: body },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");

    return res.status(200).json({
      success: true,
      msg: "User updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err.message);
    return res.status(500).json({ success: false, msg: "Server error." });
  }
};

module.exports = {
  signup,
  login,
  logout,
  protectRoute,
  getUserDetails,
  updateUserDetails,
};

require("dotenv").config({ path: "./config.env" });
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const Authorization_Middleware = async (req, res, next) => {
  // const token = req.cookies.jwt || ''
  let token = req.headers.authorization?.split(" ")[1] || "";
  // console.log(req.headers.authorization)

  if (!token)
    return res
      .status(401)
      .json({ success: false, auth: false, msg: "Cookies/Token Not Found!" });

  try {
    const decode = await jwt.verify(token, process.env.JWT_SECRET);
    if (decode) {
      const user = await User.findById(decode.userId).lean();
      if (!user)
        return res
          .status(408)
          .json({ success: false, auth: false, msg: "User Not Found!" });

      req.user = { userId: user._id }; //Assigning user's details to req-obj for future use...
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, auth: false, msg: "Invalid Token!" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({
        success: false,
        auth: false,
        msg: "Error while Verifying Token!",
      });
  }
};

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

    if (!user.comparePassword(password))
      //Comparing Passwords...
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
  // Get the token from cookies
  const token = req.cookies?.token;

  // If no token found, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({ msg: "Not authorized. No token found." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database using userId from decoded token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Attach the user object to the request so it can be accessed in the next middleware or route handler
    req.user = user;

    next(); // Call the next middleware or route handler
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: "Invalid or expired token." });
  }
};

// Route handler to fetch user details
const getUserDetails = async (req, res) => {
  try {
    // Find the user by userId which was added to the request object by the middleware
    const user = await User.findById(req.user._id).select("-password"); // Exclude the password field

    // If the user is not found, return a 404 error
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Return the user details in the response
    res.status(200).json({
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

const updateUserDetails = async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName && !email) {
    return res.status(400).json({ msg: "Nothing to update." });
  }

  try {
    // Update only provided fields
    if (fullName) req.user.fullName = fullName;
    if (email) req.user.email = email;

    // Save changes
    const updatedUser = await req.user.save();

    // Exclude password from response
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({
      msg: "User updated successfully.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ msg: "Server error." });
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

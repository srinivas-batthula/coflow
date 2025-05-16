require("dotenv").config({ path: "./config.env" })
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");


const Authorization_Middleware = async (req, res, next) => {
  // const token = req.cookies.jwt || ''
  let token = req.headers.authorization?.split(' ')[1] || ''
  // console.log(req.headers.authorization)

  if (!token)
    return res.status(401).json({ 'success': false, 'auth': false, 'msg': "Cookies/Token Not Found!" })

  try {
    const decode = await jwt.verify(token, process.env.JWT_SECRET)
    if(decode) {
      const user = await User.findById(decode.userId).lean()
      if (!user)
        return res.status(408).json({ 'success': false, 'auth': false, 'msg': "User Not Found!" })

      req.user = {userId: user._id}                //Assigning user's details to req-obj for future use...
      next()
    }
    else {
      return res.status(403).json({ 'success': false, 'auth': false, 'msg': "Invalid Token!" });
    }
  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ 'success': false, 'auth': false, 'msg': "Error while Verifying Token!" });
  }
}


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Set cookie options (secure, HTTP-only in production)
const cookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
};

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!email || !password || !fullName)
    return res.status(400).json({ success: false, msg: 'All fields are required!' });

  try {
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(400).json({ success: false, msg: 'User already Exists!' });

    const newUser = new User({ fullName, email, password });
    await newUser.save();

    const token = generateToken(newUser._id);
    res.cookie("token", token, cookieOptions)

    return res.status(201).json({ success: true, msg: 'New User created Successfully!', token });
  } catch (err) {
    console.error("error in signup Route: " + err.message);
    return res.status(500).json({ success: false, msg: 'Error while creating new user!' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, msg: 'All fields are required!' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, msg: 'User Not Found!' });

    if (!(user.comparePassword(password)))             //Comparing Passwords...
      return res.status(401).json({ 'success': false, 'msg': 'Password Not Matched!' })

    const token = generateToken(user._id);
    res.cookie("token", token, cookieOptions)

    return res.status(201).json({ success: true, msg: 'Logged-In Successfully!', token });
  } catch (err) {
    console.error("error in login Route: " + err.message);
    return res.status(500).json({ success: false, msg: 'Error while Logging-In!' });
  }
};

const logout = (req, res) => {
  res.clearCookie("token", { path: '/', httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", });

  return res.status(200).json({ 'success': true, 'msg': "Cookie Cleared successfully." })
};



module.exports = { signup, login, logout };
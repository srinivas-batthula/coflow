require('dotenv').config({ path: './config.env' });
const jwt = require('jsonwebtoken');
const cookie = require('cookie'); // to parse cookies manually
const User = require('../models/userModel');

module.exports = async (socket, next) => {
    let token = null;

    if (socket.handshake.headers.cookie) {
        // Try to get token from cookies if present
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies?.token || '';
    }
    if (!token && socket.handshake.auth) {
        // If not in cookies, try from Authorization header
        token = socket.handshake.auth.token || '';
    }
    if (!token && socket.handshake.headers.authorization) {
        // If not in cookies, try from Authorization header
        token = socket.handshake.headers.authorization?.split(' ')[1] || '';
    }

    if (!token || token === '') return next(new Error('Unauthorized: Token not found'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) return next(new Error('Unauthorized: User not found'));
        socket.user = { _id: user._id, fullName: user.fullName }; // Attach user to socket
        return next();
    } catch (error) {
        console.log(error);
        return next(new Error('Unauthorized: Invalid or expired token'));
    }
};

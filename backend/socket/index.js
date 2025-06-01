// socket/index.js
const chatSocket = require("./chatSocket");
const taskSocket = require("./taskSocket");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, ` ${socket.user.fullName}`);
    const userId = socket.handshake.query.userId;
    socket.join(userId);

    // Attach chat events
    chatSocket(io, socket);

    // Attach team events
    taskSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(
        "Socket disconnected:",
        socket.id,
        ` ${socket.user.fullName}`
      );
    });
  });
};

// socket/index.js
const {enqueuePush} = require("../services/notifications/push_redis-queue");
const chatSocket = require("./chatSocket");
const taskSocket = require("./taskSocket");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, ` ${socket.user.fullName}`);
    // console.log("All rooms:", Array.from(io.sockets.adapter.rooms.keys()));

    // Test item added to Redis Queue...
    enqueuePush(['1'], {t: 't'}, true).catch((err)=>{console.log(err)});

    // Attach chat events
    chatSocket(io, socket);
    // Attach team events
    taskSocket(io, socket);

    socket.on("disconnect", () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      }); // Leave 'User' from all rooms `teamId` & `userId`...
      console.log(
        "Socket disconnected:",
        socket.id,
        ` ${socket.user.fullName}`
      );
    });
  });
};

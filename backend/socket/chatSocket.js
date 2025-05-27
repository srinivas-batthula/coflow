// socket/chatSocket.js
module.exports = (io, socket) => {
    socket.on("join-chat", (teamId) => {
        socket.join(teamId);
        console.log(`(Chat) Socket ${socket.id} joined room ${teamId}`);
    });

    socket.on("chat-message", ({ teamId, message }) => {
        io.to(teamId).emit("chat-message", { message, from: socket.id });
    });
};

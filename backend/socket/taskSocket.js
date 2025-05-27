// socket/teamSocket.js
module.exports = (io, socket) => {
    socket.on("task_history", ({ teamId, userId, is_leader }) => {
        socket.join(userId);
        // Fetch previous `tasks` of current user...
        console.log(`(Team) Socket ${socket.id} joined room ${teamId}`);
    });
    
    socket.on("task-update", ({ teamId, update }) => {
        io.to(teamId).emit("task-update", { update, from: socket.id });
    });
};
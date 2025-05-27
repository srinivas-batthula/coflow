// socket/index.js
const chatSocket = require("./chatSocket");
const taskSocket = require("./taskSocket");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id, `\n ${socket.user}`);
        
        // Attach chat events
        chatSocket(io, socket);
        
        // Attach team events
        taskSocket(io, socket);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};
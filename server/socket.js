const { Server } = require("socket.io");

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    let onlineUsers = [];
    io.on("connection", (socket) => {
        // console.log("new connection", socket.id);

        //listen to a connection from client
        socket.on("newUserConnected", (userId) => {
            //check if user already not exist in onlineUsers
            !onlineUsers.some((user) => user.userId === userId) &&
                //now add user to list
                onlineUsers.push({
                    userId,
                    socketId: socket.id,
                });

            //send data to client
            io.emit("getOnlineUsers", onlineUsers);
        });

        socket.on("sendNewMessage", (message) => {
            const user = onlineUsers.find(
                (user) => user.userId === message.recepientId
            );
            if (user) {
                //send real time message to user
                io.to(user.socketId).emit("getNewMessage", message);
                io.to(user.socketId).emit("getNotification", {
                    senderId: message.senderId,
                    isRead: false,
                    date: new Date(),
                });
            }
        });

        socket.on("disconnect", () => {
            //disconnect user if goes offlined
            onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
            //send new updated onlineUsers
            io.emit("getOnlineUsers", onlineUsers);
        });
    });
}

module.exports = { setupSocket };

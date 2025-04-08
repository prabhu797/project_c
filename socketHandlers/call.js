module.exports = (socket, io, onlineUsers) => {
    // 1. User A initiates the call
    socket.on("call-user", ({ to, offer }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", {
          from: socket.user.userId,
          offer,
        });
      }
    });
  
    // 2. User B answers the call
    socket.on("answer-call", ({ to, answer }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-answered", {
          from: socket.user.userId,
          answer,
        });
      }
    });
  
    // 3. ICE candidate exchange
    socket.on("ice-candidate", ({ to, candidate }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice-candidate", {
          from: socket.user.userId,
          candidate,
        });
      }
    });
  
    // 4. Call ended manually
    socket.on("end-call", ({ to }) => {
      const targetSocketId = onlineUsers.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended", {
          from: socket.user.userId,
        });
      }
    });
  };
  
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messages");

// .env Structure 
// PORT=5000
// MONGO_URI=FROM_DATABASE
// JWT_SECRET=supersecretjwtkey

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Example route
app.get("/", (req, res) => {
    res.send("Chat App API Running!");
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Error:", err));

const jwt = require("jsonwebtoken");

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = user; // attach user info to socket
        next();
    } catch (err) {
        return next(new Error("Invalid token"));
    }
});

// Socket.io setup
const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.user.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${userId}`);

    socket.on("send-message", async ({ to, message }) => {
        const receiverSocketId = onlineUsers.get(to);

        // Save to DB
        await Message.create({
            sender: socket.user.userId,
            receiver: to,
            message,
        });

        // Emit to receiver
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive-message", {
                from: socket.user.userId,
                message,
            });
        }
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

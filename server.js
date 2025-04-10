const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const cors = require("cors");
const http = require("http");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");

const Message = require("./models/Message");

const sendPushNotification = require("./utils/sendPushNotification");

const handleCallSockets = require("./socketHandlers/call");

const errorHandler = require("./middleware/errorHandler");

const userRoutes = require("./routes/users");
const friendRoutes = require("./routes/friends");

// .env Structure 
// PORT=5000
// MONGO_URI=FROM_DATABASE
// JWT_SECRET=supersecretjwtkey
// VAPID_PUBLIC_KEY=GENERATE_AND_ASSIGN_A_VAPID_PUBLIC_KEY
// VAPID_PRIVATE_KEY=GENERATE_AND_ASSIGN_A_VAPID_PRIVATE_KEY

let allowedOrigins = [
    "http://10.80.3.30:5173",
    "http://localhost:5173",
    "https://prabhu797.github.io/"
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});

app.use(cors({
    origin: allowedOrigins, // your frontend URL
    credentials: true, // if you use cookies or auth headers
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
// Example route
app.get("/", (req, res) => {
    res.send("Chat App API Running!");
});

app.use((req, res, next) => {
    res.status(404).json({ error: "Route not found" });
});
app.use(errorHandler);

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
        await sendPushNotification(to, "📩 New Message", message);
    });

    handleCallSockets(socket, io, onlineUsers);

    socket.on("disconnect", () => {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2YyOGY0MmI0OTY5MjdlMmNhOGFiNWMiLCJpYXQiOjE3NDM5NDk2NjMsImV4cCI6MTc0NDEyMjQ2M30.dqnDpR6VJ14LjuAof2TnJj0-Nj9MwrMwUM_Oyebky84",
    },
});

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    setTimeout(() => {
        // Send a message to another user (receiver userId here)
        socket.emit("send-message", {
            to: "67f28916f6f349ee747416ac",
            message: "Hello from test socket client!",
        });
    }, 2000);
});

socket.on("receive-message", (data) => {
    console.log("📥 Received a message:", data);
});

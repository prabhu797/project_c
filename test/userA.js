const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2Y1MDBlNWE0MWZiNWNjNzAxYTVlMGMiLCJpYXQiOjE3NDQxMDk4MDMsImV4cCI6MTc0NDI4MjYwM30.PcfjFkYOnBfzhzAcVHfbZRjG5dcxMx-ws-8dmKd3nCU", // You can hardcode for testing
    },
});

// Simulate online users map by logging in
socket.on("connect", () => {
    console.log("User A connected");

    // Call userB (replace user ID accordingly)
    setTimeout(() => {
        socket.emit("call-user", {
            to: "67f28916f6f349ee747416ac", // Replace with real ID if needed
            offer: "SDP_OFFER_EXAMPLE",
        });
    }, 2000);
});

// Listen for call answered
socket.on("call-answered", (data) => {
    console.log("Call answered by B:", data);
});

// Listen for ICE candidate from B
socket.on("ice-candidate", (data) => {
    console.log("ICE candidate from B:", data);
});

const { io } = require("socket.io-client");

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2YyODkxNmY2ZjM0OWVlNzQ3NDE2YWMiLCJpYXQiOjE3NDQxMDk5OTcsImV4cCI6MTc0NDI4Mjc5N30.KrkBaMXjgoJK1j5RwuhwJ8EQFMrWwLVYqInetRJzOts", // You can hardcode for testing
    },
});

socket.on("connect", () => {
    console.log("User B connected");
});

// Listen for incoming call
socket.on("incoming-call", (data) => {
    console.log("Incoming call from A:", data);

    // Reply with answer after receiving offer
    setTimeout(() => {
        socket.emit("answer-call", {
            to: "67f500e5a41fb5cc701a5e0c", // Replace accordingly
            answer: "SDP_ANSWER_EXAMPLE",
        });
    }, 2000);
});

// Listen for ICE candidate from A
socket.on("ice-candidate", (data) => {
    console.log("ICE candidate from A:", data);
});

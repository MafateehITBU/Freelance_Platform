import { io } from "socket.io-client";

const socket = io("http://localhost:5001", {
    transports: ["websocket"],
    reconnection: true,
});

// Test data
const senderId = "68569f647eab57c6e45d2f6f";         
const senderModel = "User";                            
const participantId = "6856a7a5f15404993d10f5d0";    
const participantModel = "Freelancer";                 
const content = "Hey love, testing the socket";

socket.on("connect", () => {
    console.log(`✅ Connected to socket server: ${socket.id}`);

    // Announce the user is online
    socket.emit("user-online", senderId);
    console.log("User marked online:", senderId);

    // Optional: Listen to online users
    socket.on("online-users", (users) => {
        console.log("Online users:", users);
    });

    // Emit message
    setTimeout(() => {
        socket.emit("send-message", {
            senderId,
            senderModel,
            participantId,
            participantModel,
            content,
            attachment: null, //change this to cloudiary upload
        });
        console.log("Message sent!");
    }, 1000);
});

// Listen to new messages
socket.on("new-message", (msg) => {
    console.log("New message received:", msg);
});

// Typing events
socket.emit("typing", { chatRoomId: "fakeChatId123", senderId });
socket.emit("stop-typing", { chatRoomId: "fakeChatId123", senderId });

// Handle errors and disconnects
socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.error("🚨 Connection error:", err.message);
});
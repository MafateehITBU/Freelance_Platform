import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";

const onlineUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId(s)

export const chatSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("New socket connected:", socket.id);

        // When a user joins (send userId from frontend)
        socket.on("user-online", (userId) => {
            onlineUsers.set(socket.id, userId);

            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            io.emit("online-users", [...userSockets.keys()]);
        });

        // Typing indicator
        socket.on("typing", ({ chatRoomId, senderId }) => {
            socket.to(chatRoomId).emit("typing", { chatRoomId, senderId });
        });

        socket.on("stop-typing", ({ chatRoomId, senderId }) => {
            socket.to(chatRoomId).emit("stop-typing", { chatRoomId, senderId });
        });

        // Join a chat room (like a private room for messages)
        socket.on("join-chat", (chatRoomId) => {
            socket.join(chatRoomId);
            console.log(`Socket ${socket.id} joined chat ${chatRoomId}`);
        });

        // Send message (real-time message sending)
        socket.on("send-message", async (messageData) => {
            const {
                senderId,
                senderModel,
                participantId,
                participantModel,
                content,
                attachment,
            } = messageData;

            // Find chatroom (check both directions)
            let chat = await ChatRoom.findOne({
                $or: [
                    {
                        user: senderModel === "User" ? senderId : participantId,
                        participant: senderModel === "User" ? participantId : senderId,
                        participantModel: senderModel === "User" ? participantModel : senderModel,
                    },
                    {
                        user: senderModel === "User" ? participantId : senderId,
                        participant: senderModel === "User" ? senderId : participantId,
                        participantModel: senderModel === "User" ? senderModel : participantModel,
                    },
                ],
            });

            // Create chat if not exists
            if (!chat) {
                chat = await ChatRoom.create({
                    user: senderModel === "User" ? senderId : participantId,
                    participant: senderModel === "User" ? participantId : senderId,
                    participantModel: senderModel === "User" ? participantModel : senderModel,
                });
            }   

            // Join socket room to receive messages for this chat
            socket.join(chat._id.toString());

            // Create new message
            const newMessage = await Message.create({
                chatRoom: chat._id,
                sender: senderId,
                senderModel,
                content,
                attachment: attachment || null,
            });

            // Update lastMessage in chat room
            chat.lastMessage = newMessage._id;
            await chat.save();

            // Emit new message event to everyone in room (including sender)
            io.to(chat._id.toString()).emit("new-message", newMessage);
        });

        // Handle disconnect
        socket.on("disconnect", () => {
            const userId = onlineUsers.get(socket.id);
            if (userId) {
                userSockets.get(userId)?.delete(socket.id);
                if (userSockets.get(userId)?.size === 0) {
                    userSockets.delete(userId);
                }
            }
            onlineUsers.delete(socket.id);
            io.emit("online-users", [...userSockets.keys()]);
            console.log("❌ Socket disconnected:", socket.id);
        });
    });
};
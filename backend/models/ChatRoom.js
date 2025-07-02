import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'participantModel',
    },
    participantModel: {
        type: String,
        required: true,
        enum: ['Freelancer', 'Influencer'],
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
}, { timestamps: true });

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;

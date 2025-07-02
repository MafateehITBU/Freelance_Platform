import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel',
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Freelancer', 'Influencer'],
    },
    content: {
        type: String,
        default: '',
    },
    attachment: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;

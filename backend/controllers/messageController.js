import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
// import { uploadToCloudinary } from '../utils/cloudinary.js';

// export const sendMessageWithAttachment = async (req, res) => {
//     try {
//         const { userId, participantId, participantModel, content } = req.body;
//         let attachmentUrl = null;
//         let attachmentType = null;

//         // Upload file to Cloudinary if exists
//         if (req.file) {
//             const filePath = req.file.path;
//             const resourceType = req.file.mimetype.includes('image') ? 'image' : 'raw';

//             const result = await uploadToCloudinary(filePath, 'chat', resourceType);
//             attachmentUrl = result;
//             attachmentType = resourceType === 'image' ? 'image' : 'file';
//         }

//         // Find or create chat
//         let chatRoom = await ChatRoom.findOne({
//             user: userId,
//             participant: participantId,
//             participantModel,
//         });

//         if (!chatRoom) {
//             chatRoom = await ChatRoom.create({ user: userId, participant: participantId, participantModel });
//         }

//         // Create message
//         const message = await Message.create({
//             chatRoom: chatRoom._id,
//             sender: userId,
//             senderModel: 'User',
//             content,
//             attachment: attachmentUrl ? { url: attachmentUrl, type: attachmentType } : null,
//         });

//         chatRoom.lastMessage = message._id;
//         await chatRoom.save();

//         // Emit via socket
//         req.io.emit('new-message', message);

//         return res.status(201).json({
//             message: 'Message sent successfully',
//             data: message,
//         });
//     } catch (error) {
//         console.error('Send message error:', error);
//         res.status(500).json({ message: 'Failed to send message', error: error.message });
//     }
// };

/**-----------------------------------------
 *  @desc   Get all chat rooms for the logged-in user/freelancer/influencer
 *  @route  GET /api/chat/rooms
 *  @access Private
 *  @role   User, Influencer, Freelancer
 ------------------------------------------*/
export const getChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let chatRooms;

        if (role === "user") {
            chatRooms = await ChatRoom.find({ user: userId })
                .populate("lastMessage")
                .populate({
                    path: "participant",
                    model: "Freelancer", // fallback; we'll update dynamically below
                    select: "name profilePicture",
                });
        } else {
            // for freelancer or influencer
            chatRooms = await ChatRoom.find({
                participant: userId,
                participantModel: role.charAt(0).toUpperCase() + role.slice(1), // 'Freelancer' or 'Influencer'
            })
                .populate("lastMessage")
                .populate({
                    path: "user",
                    model: "User",
                    select: "name profilePicture",
                });
        }

        res.status(200).json({
            message: "Chat rooms fetched successfully",
            chatRooms,
        });
    } catch (error) {
        console.error("Error fetching chat rooms:", error);
        res.status(500).json({
            message: "Failed to fetch chat rooms",
            error: error.message,
        });
    }
};

/**-----------------------------------------
 * @desc    Get all messages for a specific chat room
 * @route   GET /api/chat/:chatRoomId/messages
 * @access  Private
 -----------------------------------------*/
export const getChatRoomMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { chatRoomId } = req.params;

        const chatRoom = await ChatRoom.findById(chatRoomId);
        if (!chatRoom) {
            return res.status(404).json({ message: "Chat room not found" });
        }

        const isUser =
            role === "user" && chatRoom.user.toString() === userId;
        const isParticipant =
            chatRoom.participant.toString() === userId &&
            chatRoom.participantModel.toLowerCase() === role;

        if (!isUser && !isParticipant) {
            return res.status(403).json({ message: "Not authorized to view this chat" });
        }

        const messages = await Message.find({ chatRoom: chatRoomId })
            .sort({ createdAt: 1 }) // oldest to newest
            .populate("sender", "name profilePicture");

        res.status(200).json({
            message: "Messages fetched successfully",
            messages,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            message: "Failed to fetch messages",
            error: error.message,
        });
    }
};


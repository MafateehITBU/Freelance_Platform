import express from 'express';
import {
    getChatRooms,
    getChatRoomMessages
} from '../controllers/messageController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/rooms', verifyToken, authorizeRole('user', 'freelancer', 'influencer'), getChatRooms);
router.get('/:chatRoomId/messages', verifyToken, authorizeRole('user', 'freelancer', 'influencer'), getChatRoomMessages);
export default router;

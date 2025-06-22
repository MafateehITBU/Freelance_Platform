import express from 'express';
import {
    addComment,
    getPostComments,
    updateComment,
    deleteComment
} from '../controllers/commentController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/:postId', verifyToken, authorizeRole('user', 'freelancer', 'influencer'), addComment);  
router.get('/:postId', verifyToken, getPostComments);
router.put('/:commentId', verifyToken, authorizeRole('user', 'freelancer', 'influencer'), updateComment);
router.delete('/:commentId', verifyToken, deleteComment);             

export default router;
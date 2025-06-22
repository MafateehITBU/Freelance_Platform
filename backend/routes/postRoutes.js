import express from 'express';
import {
    addPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
} from '../controllers/postController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('user'), addPost);
router.get('/',verifyToken, getAllPosts);
router.get('/:id', verifyToken, getPostById);
router.put('/:id', verifyToken, authorizeRole('user'), updatePost);
router.delete('/:id', verifyToken, authorizeRole('user', 'admin'), deletePost);

export default router;
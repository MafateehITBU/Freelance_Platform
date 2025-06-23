import express from 'express';
import {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import imageUpload from '../middleware/imageUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post( '/', verifyToken, authorizeRole('admin'),  imageUpload.single('image'),addCategory);
router.get( '/', getAllCategories);
router.get( '/:id', getCategoryById);
router.put( '/:id', verifyToken, authorizeRole('admin'), imageUpload.single('image'), updateCategory);
router.delete( '/:id', verifyToken, authorizeRole('admin'), deleteCategory);

export default router;
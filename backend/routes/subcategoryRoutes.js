import express from 'express';
import {
    addSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategoryId,
    updateSubCategory,
    deleteSubCategory
} from '../controllers/subcategoryController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin'), addSubCategory);
router.get('/', getAllSubCategories);
router.get('/:categoryId', getSubCategoriesByCategoryId);
router.put('/:subcategoryId', verifyToken, authorizeRole('admin'), updateSubCategory);
router.delete('/:subcategoryId', verifyToken, authorizeRole('admin'), deleteSubCategory);

export default router;
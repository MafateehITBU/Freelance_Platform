import express from 'express';
import {
    getUserCart,
    getCartHistory,
    updatePlatformFee,
    clearCart,
} from '../controllers/cartController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/', verifyToken, authorizeRole('user'), getUserCart);
router.get('/history', verifyToken, authorizeRole('user'), getCartHistory);
router.put('/update-fee', verifyToken, authorizeRole('admin'), updatePlatformFee);
router.put('/clear', verifyToken, authorizeRole('user'), clearCart);

export default router;
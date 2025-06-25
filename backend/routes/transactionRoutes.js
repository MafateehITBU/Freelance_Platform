import express from 'express';
import {
    checkoutCart,
    retryFailedCheckout,
    getUserTransactions,
    getTransactionById,
    getAllTransactions,
    updateTransactionStatus,
} from '../controllers/transactionController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/checkout', verifyToken, authorizeRole('user'), checkoutCart);
router.post('/checkout/retry', verifyToken, authorizeRole('user'), retryFailedCheckout);
router.get('/', verifyToken, authorizeRole('user'), getUserTransactions);
router.get('/admin', verifyToken, authorizeRole('admin'), getAllTransactions);
router.get('/:id', verifyToken, getTransactionById);
router.put('/:id/status', verifyToken, authorizeRole('admin'), updateTransactionStatus);


export default router;
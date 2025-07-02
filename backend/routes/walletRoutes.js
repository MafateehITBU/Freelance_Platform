import express from 'express';
import {
    getAllWallets,
    getUserWallet,
    getWalletById,
    updateWallet
} from '../controllers/walletController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/', verifyToken, authorizeRole('admin'), getAllWallets);
router.get('/user-wallet', verifyToken, authorizeRole('admin', 'freelancer'), getUserWallet);
router.get('/:walletId', verifyToken, authorizeRole('admin', 'freelancer'), getWalletById);
router.put('/:walletId', verifyToken, authorizeRole('admin'), updateWallet);

export default router;
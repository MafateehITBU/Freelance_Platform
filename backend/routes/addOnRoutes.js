import express from 'express';
import {
    createAddOn,
    getAddOnsByService,
    updateAddOn,
    deleteAddOn,
} from '../controllers/addOnController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('freelancer'), createAddOn);

router.get('/:serviceId', getAddOnsByService);

router.put('/:addOnId', verifyToken, authorizeRole('freelancer'), updateAddOn);

router.delete('/:addOnId', verifyToken, authorizeRole('freelancer', 'admin'), deleteAddOn);

export default router;

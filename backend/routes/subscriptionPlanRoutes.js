import express from 'express';
import {
    addSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
} from '../controllers/subscriptionPlancontroller.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin'), addSubscriptionPlan);
router.get('/', getAllSubscriptionPlans);
router.get('/:id', getSubscriptionPlanById);
router.put('/:id', verifyToken, authorizeRole('admin'), updateSubscriptionPlan);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteSubscriptionPlan);

export default router;

import express from 'express';
import {
    addInfluencer,
    influencerLogin,
    getAllInfluencer,
    getInfluencerById,
    updateInfluencer,
    sendOTP,
    verifyOTP,
    updateInfluencerPassword,
    toggleInfluencerVerification,
    deleteInfluencer
} from '../controllers/influencerController.js';
import freelancerUpload from '../middleware/freelancerUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post(
    '/',
    freelancerUpload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'personalIdImage', maxCount: 1 },
    ]),
    addInfluencer
);
router.post('/login', influencerLogin);
router.get(
    '/',
    verifyToken,
    authorizeRole('admin'),
    getAllInfluencer
);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/update-password', updateInfluencerPassword);
router.get(
    '/:id',
    verifyToken,
    getInfluencerById
);
router.put(
    '/:id',
    verifyToken,
    authorizeRole('admin', 'influencer'),
    freelancerUpload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'personalIdImage', maxCount: 1 },
    ]),
    updateInfluencer
);

router.put(
    '/:id/verify',
    verifyToken,
    authorizeRole('admin'),
    toggleInfluencerVerification
);
router.delete(
    '/:id',
    verifyToken,
    authorizeRole('admin'),
    deleteInfluencer
);


export default router;
import express from 'express';
import {
    addFreelancer,
    freelancerLogin,
    getAllFreelancers,
    getFreelancerById,
    updateFreelancer,
    sendOTP,
    verifyOTP,
    updateFreelancerPassword,
    toggleFreelancerVerification,
    deleteFreelancer,
} from '../controllers/freelancerController.js';
import freelancerUpload from '../middleware/freelancerUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post(
    '/',
    freelancerUpload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'personalIdImage', maxCount: 1 },
        { name: 'portfolio', maxCount: 5 } // allow multiple PDFs
    ]),
    addFreelancer
);
router.post('/login', freelancerLogin);
router.get('/', verifyToken, authorizeRole('admin'), getAllFreelancers);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.put('/update-password', updateFreelancerPassword);
router.get('/:id', verifyToken, getFreelancerById);
router.put(
    '/:id',
    verifyToken,
    authorizeRole('admin', 'freelancer'),
    freelancerUpload.fields([
        { name: 'profilePicture', maxCount: 1 },
        { name: 'personalIdImage', maxCount: 1 },
        { name: 'portfolio', maxCount: 5 } // allow multiple PDFs
    ]),
    updateFreelancer
);
router.put(
    '/:id/verify',
    verifyToken,
    authorizeRole('admin'),
    toggleFreelancerVerification
);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteFreelancer);


export default router;
import express from 'express';
import {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUserProfile,
    sendOTP,
    verifyOTP,
    updateUserPassword,
    deleteUserProfile,
    addBillingDetails,
} from '../controllers/userController.js';
import imageUpload from '../middleware/imageUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', imageUpload.single('photo'), registerUser); // Register a new user
router.post('/login', loginUser); // User login
router.get('/', verifyToken, authorizeRole('admin'), getAllUsers); // Get all users
router.post('/send-otp', sendOTP); // Send OTP for password reset
router.post('/verify-otp', verifyOTP); // Verify OTP for password reset
router.put('/update-password', updateUserPassword); // Update user password
router.post('/billing', verifyToken, authorizeRole('user') , addBillingDetails); // Add billing details
router.get('/:id', verifyToken, getUserById); // Get user by ID
router.put('/:id', verifyToken, authorizeRole('user', 'admin'), imageUpload.single('photo'), updateUserProfile); // Update user profile
router.delete('/:id', verifyToken, authorizeRole('user','admin'), deleteUserProfile); // Delete user profile

export default router;
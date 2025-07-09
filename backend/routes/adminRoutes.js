import express from 'express';
import { body } from 'express-validator';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  getAllAdmins,
  getAdminById,
  deleteAdmin
} from '../controllers/adminController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';
import imageUpload from '../middleware/imageUpload.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', imageUpload.single('image'), validateRegistration, registerAdmin);
router.post('/login', validateLogin, loginAdmin);

// Protected routes (require authentication)
router.get('/profile', verifyToken, getAdminProfile);
router.put('/profile', verifyToken, imageUpload.single('image'), validateProfileUpdate, updateAdminProfile);
router.put('/change-password', verifyToken, validatePasswordChange, changePassword);

// Admin management routes (for super admin)
router.get('/', verifyToken, authorizeRole('admin'), getAllAdmins);
router.get('/:id', verifyToken, authorizeRole('admin'), getAdminById);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteAdmin);

export default router;

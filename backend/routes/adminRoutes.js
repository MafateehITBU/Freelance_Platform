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
import { protect } from '../middleware/authMiddleware.js';
import { optionalImageUpload } from '../middleware/photoUpload.js';

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
router.post('/register', optionalImageUpload, validateRegistration, registerAdmin);
router.post('/login', validateLogin, loginAdmin);

// Protected routes (require authentication)
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, optionalImageUpload, validateProfileUpdate, updateAdminProfile);
router.put('/change-password', protect, validatePasswordChange, changePassword);

// Admin management routes (for super admin)
router.get('/', protect, getAllAdmins);
router.get('/:id', protect, getAdminById);
router.delete('/:id', protect, deleteAdmin);

export default router;

import express from 'express';
import {
    addService,
    getAllServices,
    getAllFreelancerServices,
    getServicesByCategory,
    getServicesBySubCategory,
    toggleServiceApprove,
    updateService,
    deleteService
} from '../controllers/serviceController.js';
import imageUpload from '../middleware/imageUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

// Add a new service
router.post(
    '/',
    verifyToken,
    authorizeRole('freelancer'),
    imageUpload.fields([{ name: 'images', maxCount: 5 }]),
    addService
);
// Get all services
router.get('/all', getAllServices);
// Get all freelancer services
router.get('/', getAllFreelancerServices);

// Get services grouped by category
router.get('/category', getServicesByCategory);

// Get services grouped by subcategory
router.get('/subcategory', getServicesBySubCategory);

// Toggle Service Approve
router.put('/:id/approve', verifyToken, authorizeRole('admin'), toggleServiceApprove);

// Update a service
router.put(
    '/:serviceId',
    verifyToken,
    authorizeRole('freelancer'),
    imageUpload.fields([{ name: 'images', maxCount: 5 }]),
    updateService
);

// Delete a service
router.delete(
    '/:serviceId',
    verifyToken,
    authorizeRole('freelancer'),
    deleteService
);

export default router;
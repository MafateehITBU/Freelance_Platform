import express from 'express';
import {
    addRating,
    getAllRatings,
    getRatingsForFreelancer,
    getRatingById,
    updateRating,
    deleteRating
} from '../controllers/ratingController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizeRole from '../middleware/authorizeRole.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('user'), addRating);
router.get('/', getAllRatings);
router.get('/freelancer/:freelancerId', getRatingsForFreelancer);
router.get('/:id', getRatingById);
router.put('/:id', verifyToken, authorizeRole('user'), updateRating);
router.delete('/:id', verifyToken, authorizeRole('admin', 'user'), deleteRating);

export default router;
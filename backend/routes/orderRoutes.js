import express from "express";
import {
    addOrder,
    getAllUserOrders,
    getOrderById,
    updateOrder,
    startOrder,
    endOrder,
    deleteOrder
} from '../controllers/orderController.js';
import verifyToken from "../middleware/verifyToken.js";
import authorizeRole from "../middleware/authorizeRole.js";

const router = express.Router();

router.post('/', verifyToken, authorizeRole('user'), addOrder); // Create a new order
router.get('/user', verifyToken, authorizeRole('user'), getAllUserOrders); // Get All Orders
router.get('/:orderId', verifyToken, authorizeRole('user','admin'), getOrderById); // Get an Order by ID
router.put('/:orderId', verifyToken, authorizeRole('user'), updateOrder); // Update an Order by ID
router.put('/start/:orderId', verifyToken, authorizeRole('freelancer'), startOrder); // Start Order by ID
router.put('/end/:orderId', verifyToken, authorizeRole('freelancer'), endOrder); // End Order by ID
router.delete('/:orderId', verifyToken, authorizeRole('user'), deleteOrder); // Delete an Order by ID

export default router;
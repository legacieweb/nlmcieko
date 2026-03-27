import express from 'express';
import { createOrder, getUserOrders, getCounties } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/counties', getCounties);

export default router;

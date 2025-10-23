import express from 'express';
import { createSubscription } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/subscribe', protect, createSubscription);
export default router;
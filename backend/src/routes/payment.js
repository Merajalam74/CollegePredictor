import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSubscription } from '../controllers/paymentController.js';

const router = express.Router();

// Route: POST /api/payment/subscribe
router.post('/subscribe', protect, createSubscription);

export default router;
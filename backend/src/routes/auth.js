import express from 'express';
import {
  registerUser, loginUser, getUserProfile, verifyEmail, updateUserProfile,
  sendMobileOTP, verifyMobileOTP 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);

// Protected routes (require valid JWT token)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ---Mobile Verification Routes (Protected) ---
router.post('/send-mobile-otp', protect, sendMobileOTP);
router.post('/verify-mobile-otp', protect, verifyMobileOTP);

export default router;

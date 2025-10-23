import express from 'express';
import { registerUser, loginUser, getUserProfile, verifyEmail, updateUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
export default router;
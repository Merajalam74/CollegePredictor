import User from '../models/User.js';
import crypto from 'crypto'; // Built-in Node module for random strings
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// --- Create Subscription (Zero Cost Logic) ---
export const createSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Check if already premium
    if (user.subscription === 'premium') {
      return res.status(200).json({ 
        message: 'User is already a premium member.',
        user 
      });
    }

    // 3. Generate a Random Order ID (e.g., ORD-7382-99XA)
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const orderId = `ORD-${timestamp}-${randomPart}`;

    // 4. Update User Data
    user.subscription = 'premium';
    
    // Optional: Save payment history if your User model supports it
    // If you haven't defined this field in Schema yet, Mongoose will just ignore it, which is fine.
    if (!user.paymentHistory) user.paymentHistory = [];
    user.paymentHistory.push({
      orderId: orderId,
      amount: 0,
      currency: 'INR',
      status: 'success',
      date: new Date()
    });

    await user.save();

    // 5. Send Professional Email in Background
    // We don't await this so the UI response is instant
    sendOrderConfirmationEmail(user.email, user.name, orderId)
      .catch(err => console.error("Background Email Error:", err));

    // 6. Return Success Response
    res.status(200).json({
      message: 'Subscription successful',
      subscription: 'premium',
      orderId: orderId,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        subscription: 'premium',
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ message: 'Server error processing subscription' });
  }
};
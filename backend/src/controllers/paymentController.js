import User from '../models/User.js';

export const createSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      // Placeholder: Add Stripe/Razorpay integration here
      user.subscription = 'premium';
      const updatedUser = await user.save();
      // Return full updated user object (no password)
      res.json({ ...updatedUser.toObject(), password:_ });
    } else { res.status(404).json({ message: 'User not found' }); }
  } catch (error) { console.error("Subscription Error:", error); res.status(500).json({ message: 'Server Error' }); }
};
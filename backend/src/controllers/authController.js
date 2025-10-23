import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Includes home_state and pws
export const registerUser = async (req, res) => {
  const { name, email, password, home_state, pws, ...ranks } = req.body;
  try {
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, email, password, home_state, jee_mains_pws: pws, ...ranks, emailVerificationOTP: otp, emailVerificationExpires: otpExpires });
    if (user) { await sendVerificationEmail(user.email, otp); res.status(201).json({ message: 'Registration successful! Check email for OTP.', email: user.email }); }
    else { res.status(400).json({ message: 'Invalid user data' }); }
  } catch (error) { console.error("Register Error:", error); res.status(500).json({ message: error.message }); }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
    if (user.emailVerificationOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.emailVerificationExpires < new Date()) return res.status(400).json({ message: 'OTP has expired' });
    user.isEmailVerified = true; user.emailVerificationOTP = undefined; user.emailVerificationExpires = undefined;
    const verifiedUser = await user.save();
    // Return full user object + token
    res.status(200).json({ ...verifiedUser.toObject(), password:_ , token: generateToken(verifiedUser._id) });
  } catch (error) { console.error("Verify Email Error:", error); res.status(500).json({ message: error.message }); }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isEmailVerified) return res.status(401).json({ message: 'Email not verified' });
    if (await user.comparePassword(password)) {
      // Return full user object + token
      res.json({ ...user.toObject(), password:_, token: generateToken(user._id) });
    } else { res.status(401).json({ message: 'Invalid credentials' }); }
  } catch (error) { console.error("Login Error:", error); res.status(500).json({ message: error.message }); }
};

export const getUserProfile = async (req, res) => {
  if (req.user) { res.json(req.user); } else { res.status(404).json({ message: 'User not found' }); }
};

// Includes home_state and pws update
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name ?? user.name;
      user.home_state = req.body.home_state ?? user.home_state;
      user.jee_mains_pws = req.body.pws ?? user.jee_mains_pws;
      user.jee_mains_crl_rank = req.body.jee_mains_crl_rank ?? user.jee_mains_crl_rank;
      user.jee_mains_category = req.body.jee_mains_category ?? user.jee_mains_category;
      user.jee_mains_category_rank = req.body.jee_mains_category_rank ?? user.jee_mains_category_rank;
      user.jee_advanced_crl_rank = req.body.jee_advanced_crl_rank ?? user.jee_advanced_crl_rank;
      user.jee_advanced_category = req.body.jee_advanced_category ?? user.jee_advanced_category;
      user.jee_advanced_category_rank = req.body.jee_advanced_category_rank ?? user.jee_advanced_category_rank;
      const updatedUser = await user.save();
      // Return full updated user object (no password)
      res.json({ ...updatedUser.toObject(), password:_ });
    } else { res.status(404).json({ message: 'User not found' }); }
  } catch (error) { console.error("Update Profile Error:", error); res.status(500).json({ message: 'Server Error updating profile' }); }
};
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService.js';
import { sendSmsOTP } from '../utils/smsService.js';

// --- generateToken ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// --- registerUser ---
export const registerUser = async (req, res) => {
  const { name, email, password, mobile, addressState, home_state, pws, ...ranks } = req.body;
  
  try {
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
    if (mobile && await User.findOne({ mobile })) return res.status(400).json({ message: 'Mobile number already in use' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    const user = await User.create({
      name, email, password, mobile, addressState,
      home_state, jee_mains_pws: pws, ...ranks,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpires,
      isEmailVerified: false 
    });

    if (user) {
      // Send email in background
      sendVerificationEmail(user.email, otp).catch(err => console.error("Email Send Error:", err));
      
      res.status(201).json({ 
        message: 'Registration successful! Please check your email for the OTP.', 
        email: user.email,
        requiresVerification: true 
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) { 
    console.error("Register Error:", error); 
    res.status(500).json({ message: error.message }); 
  }
};

// --- verifyEmail ---
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.isEmailVerified) return res.status(200).json({ message: 'Email is already verified. Please login.' });

    if (user.emailVerificationOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.emailVerificationExpires < new Date()) return res.status(400).json({ message: 'OTP has expired. Please try logging in again to get a new OTP.' });

    // Success: Verify user and clear OTP fields
    user.isEmailVerified = true; 
    user.emailVerificationOTP = undefined; 
    user.emailVerificationExpires = undefined;
    
    const verifiedUser = await user.save();

    res.status(200).json({
      _id: verifiedUser._id, 
      name: verifiedUser.name, 
      email: verifiedUser.email,
      token: generateToken(verifiedUser._id),
      message: "Email verified successfully!"
    });
  } catch (error) { 
    console.error("Verify Email Error:", error); 
    res.status(500).json({ message: error.message }); 
  }
};

// --- loginUser  ---
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    
    // 1. Basic Credential Check
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check Verification Status
    if (!user.isEmailVerified) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailVerificationOTP = newOtp;
      user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      // Resend Email
      sendVerificationEmail(user.email, newOtp).catch(err => console.error("Resend Email Error:", err));

      // Return specific 403/401 response that frontend can detect
      return res.status(403).json({ 
        message: 'Email not verified. A new OTP has been sent to your email.',
        email: user.email,
        requiresVerification: true 
      });
    }

    // 3. Login Success
    res.json({
      _id: user._id, name: user.name, email: user.email,
      subscription: user.subscription, home_state: user.home_state,
      addressState: user.addressState, mobile: user.mobile,
      isEmailVerified: user.isEmailVerified, isMobileVerified: user.isMobileVerified,
      jee_mains_pws: user.jee_mains_pws,
      jee_mains_crl_rank: user.jee_mains_crl_rank, 
      jee_mains_category: user.jee_mains_category, 
      jee_mains_category_rank: user.jee_mains_category_rank,
      jee_advanced_crl_rank: user.jee_advanced_crl_rank, 
      jee_advanced_category: user.jee_advanced_category, 
      jee_advanced_category_rank: user.jee_advanced_category_rank,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });

  } catch (error) { 
    console.error("Login Error:", error); 
    res.status(500).json({ message: error.message }); 
  }
};

export const getUserProfile = async (req, res) => {
  if (req.user) { res.json(req.user); } else { res.status(404).json({ message: 'User not found' }); }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name ?? user.name;
      user.home_state = req.body.home_state ?? user.home_state;
      user.addressState = req.body.addressState ?? user.addressState;
      if (req.body.mobile && req.body.mobile !== user.mobile) {
        user.isMobileVerified = false;
        user.mobileVerificationOTP = undefined;
        user.mobileVerificationExpires = undefined;
        user.mobile = req.body.mobile; 
      }
      user.jee_mains_pws = req.body.pws ?? user.jee_mains_pws;
      user.jee_mains_crl_rank = req.body.jee_mains_crl_rank ?? user.jee_mains_crl_rank;
      user.jee_mains_category = req.body.jee_mains_category ?? user.jee_mains_category;
      user.jee_mains_category_rank = req.body.jee_mains_category_rank ?? user.jee_mains_category_rank;
      user.jee_advanced_crl_rank = req.body.jee_advanced_crl_rank ?? user.jee_advanced_crl_rank;
      user.jee_advanced_category = req.body.jee_advanced_category ?? user.jee_advanced_category;
      user.jee_advanced_category_rank = req.body.jee_advanced_category_rank ?? user.jee_advanced_category_rank;
      
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
        subscription: updatedUser.subscription, home_state: updatedUser.home_state,
        addressState: updatedUser.addressState, mobile: updatedUser.mobile,
        isEmailVerified: updatedUser.isEmailVerified, isMobileVerified: updatedUser.isMobileVerified,
        jee_mains_pws: updatedUser.jee_mains_pws,
        jee_mains_crl_rank: updatedUser.jee_mains_crl_rank, jee_mains_category: updatedUser.jee_mains_category, jee_mains_category_rank: updatedUser.jee_mains_category_rank,
        jee_advanced_crl_rank: updatedUser.jee_advanced_crl_rank, jee_advanced_category: updatedUser.jee_advanced_category, jee_advanced_category_rank: updatedUser.jee_advanced_category_rank,
        createdAt: updatedUser.createdAt, updatedAt: updatedUser.updatedAt,
      });
    } else { res.status(404).json({ message: 'User not found' }); }
  } catch (error) { console.error("Update Profile Error:", error); res.status(500).json({ message: 'Server Error updating profile' }); }
};

export const sendMobileOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.mobile) return res.status(400).json({ message: 'No mobile number found.' });
    if (user.isMobileVerified) return res.status(400).json({ message: 'Mobile number is already verified.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.mobileVerificationOTP = otp;
    user.mobileVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); 
    await user.save();

    const smsSent = await sendSmsOTP(user.mobile, otp);
    if (smsSent) res.json({ message: `OTP sent to ${user.mobile}.` });
    else res.status(500).json({ message: 'Failed to send SMS OTP.' });
  } catch (error) {
    console.error("Send Mobile OTP Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const verifyMobileOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isMobileVerified) return res.status(400).json({ message: 'Mobile already verified' });
    if (!user.mobileVerificationOTP || !user.mobileVerificationExpires) return res.status(400).json({ message: 'No OTP found. Please request one.' });
    if (user.mobileVerificationOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.mobileVerificationExpires < new Date()) return res.status(400).json({ message: 'OTP has expired' });

    user.isMobileVerified = true;
    user.mobileVerificationOTP = undefined;
    user.mobileVerificationExpires = undefined;
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
      subscription: updatedUser.subscription, home_state: updatedUser.home_state,
      addressState: updatedUser.addressState, mobile: updatedUser.mobile,
      isEmailVerified: updatedUser.isEmailVerified, isMobileVerified: updatedUser.isMobileVerified,
      jee_mains_pws: updatedUser.jee_mains_pws,
      jee_mains_crl_rank: updatedUser.jee_mains_crl_rank, jee_mains_category: updatedUser.jee_mains_category, jee_mains_category_rank: updatedUser.jee_mains_category_rank,
      jee_advanced_crl_rank: updatedUser.jee_advanced_crl_rank, jee_advanced_category: updatedUser.jee_advanced_category, jee_advanced_category_rank: updatedUser.jee_advanced_category_rank,
      createdAt: updatedUser.createdAt, updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Verify Mobile OTP Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

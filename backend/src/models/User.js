import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  jee_mains_crl_rank: { type: Number },
  jee_mains_category: { type: String },
  jee_mains_category_rank: { type: Number },
  jee_advanced_crl_rank: { type: Number },
  jee_advanced_category: { type: String },
  jee_advanced_category_rank: { type: Number },
  home_state: { type: String }, // Added home state
  jee_mains_pws: {type: Boolean, default: false }, // Added PwD status
  subscription: { type: String, enum: ['free', 'premium'], default: 'free' },
  emailVerificationOTP: { type: String },
  emailVerificationExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) { if (!this.isModified('password')) return next(); const salt = await bcrypt.genSalt(10); this.password = await bcrypt.hash(this.password, salt); });
userSchema.methods.comparePassword = async function (enteredPassword) { return await bcrypt.compare(enteredPassword, this.password); };
const User = mongoose.model('User', userSchema);
export default User;
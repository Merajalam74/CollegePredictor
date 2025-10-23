import mongoose from 'mongoose';

const cutoffSchema = new mongoose.Schema({
  Institute: { type: String, required: true, index: true },
  Branch: { type: String, required: true, index: true },
  Category: { type: String, required: true, index: true }, // OPEN, EWS, OBC-NCL, SC, ST, OPEN-PwD etc.
  Gender: { type: String, required: true }, // Gender-Neutral, Female-only...
  OpeningRank: { type: Number },
  ClosingRank: { type: Number, required: true, index: true }, // Category Rank or CRL based on Category
  // Add State if needed for display filtering later
  // State: { type: String },
}, { collection: 'jeeadvancedcutoffs' }); // Explicitly name collection

cutoffSchema.index({ Branch: 1, Category: 1, Gender: 1, ClosingRank: 1 });
const JeeAdvancedCutoff = mongoose.model('JeeAdvancedCutoff', cutoffSchema);
export default JeeAdvancedCutoff;
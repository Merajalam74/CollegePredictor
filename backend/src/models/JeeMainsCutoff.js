import mongoose from 'mongoose';

const cutoffSchema = new mongoose.Schema({
  CounselingType: { type: String, required: true, index: true, enum: ['JOSAA', 'CSAB'] },
  Institute: { type: String, required: true, index: true },
  Branch: { type: String, required: true, index: true },
  Quota: { type: String, required: true, index: true }, // HS, OS, AI, JK, LA etc.
  Category: { type: String, required: true, index: true }, // OPEN, EWS, OBC-NCL, SC, ST, OPEN-PwD etc.
  Gender: { type: String, required: true }, // Gender-Neutral, Female-only...
  OpeningRank: { type: Number },
  ClosingRank: { type: Number, required: true, index: true }, // Rank type depends on CounselingType/Category
  State: { type: String, required: true }, // State of the Institute
  IsNIT: { type: Boolean, default: false }, // Flag for NITs for HS/OS logic
  InstituteType: { type: String, required: true, index: true, enum: ['NIT', 'IIIT', 'GFTI'] }, // <-- ADD THIS
}, { collection: 'jeemainscutoffs' }); // Explicitly name collection

cutoffSchema.index({ CounselingType: 1, Category: 1, Quota: 1, Gender: 1, ClosingRank: 1, State: 1, IsNIT: 1, Branch: 1 });
const JeeMainsCutoff = mongoose.model('JeeMainsCutoff', cutoffSchema);
export default JeeMainsCutoff;
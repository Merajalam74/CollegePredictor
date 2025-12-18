import mongoose from 'mongoose';

const jeeAdvancedCutoffSchema = new mongoose.Schema({
  Institute: { type: String, required: true, index: true },
  Branch: { type: String, required: true, index: true },
  InstituteType: { type: String, required: true, default: 'IIT', enum: ['IIT'] },
  Category: { type: String, required: true, index: true },
  Gender: { type: String, required: true, enum: ['Gender-Neutral', 'Female-only (including supernumerary)'] },
  OpeningRank: { type: Number },
  ClosingRank: { type: Number, required: true, index: true },
  State: { type: String, index: true }, // State where the IIT is located

  // --- NEW FIELD FOR ADVANCED SORTING ---
  // Stores the ClosingRank (CRL) of the corresponding OPEN seat for this
  // Institute, Branch, and Gender.
  equivalentOpenCrl: {
    type: Number,
    index: true,
    default: 9999999
  }
  
}, { collection: 'jeeadvancedcutoffs', timestamps: true });

// --- NEW INDEX for sorting ---
jeeAdvancedCutoffSchema.index({ equivalentOpenCrl: 1, ClosingRank: 1 });
jeeAdvancedCutoffSchema.index({ Category: 1, Gender: 1, ClosingRank: 1 });

const JeeAdvancedCutoff = mongoose.model('JeeAdvancedCutoff', jeeAdvancedCutoffSchema);
export default JeeAdvancedCutoff;


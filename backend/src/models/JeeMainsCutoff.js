import mongoose from 'mongoose';

const jeeMainsCutoffSchema = new mongoose.Schema({
  CounselingType: { type: String, required: true, index: true, enum: ['JOSAA', 'CSAB'] },
  InstituteType: { type: String, required: true, index: true, enum: ['NIT', 'IIIT', 'GFTI'] },
  Institute: { type: String, required: true, index: true },
  Branch: { type: String, required: true, index: true },
  Quota: { type: String, required: true, index: true },
  Category: { type: String, required: true, index: true },
  Gender: { type: String, required: true, enum: ['Gender-Neutral', 'Female-only (including supernumerary)'] },
  OpeningRank: { type: Number },
  ClosingRank: { type: Number, required: true, index: true },
  State: { type: String, required: true, index: true },
  IsNIT: { type: Boolean, default: false, index: true },

  equivalentOpenCrl: {
    type: Number,
    index: true,
    default: 9999999 
  }

}, { collection: 'jeemainscutoffs', timestamps: true });

jeeMainsCutoffSchema.index({ CounselingType: 1, Category: 1, Quota: 1, Gender: 1, ClosingRank: 1, State: 1 });
jeeMainsCutoffSchema.index({ CounselingType: 1, equivalentOpenCrl: 1, ClosingRank: 1 });

const JeeMainsCutoff = mongoose.model('JeeMainsCutoff', jeeMainsCutoffSchema);
export default JeeMainsCutoff;


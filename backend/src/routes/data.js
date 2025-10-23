import express from 'express';
import { getBranches, predictMains, predictAdvanced } from '../controllers/dataController.js';
const router = express.Router();
router.get('/branches', getBranches);
router.post('/predict/mains', predictMains);
router.post('/predict/advanced', predictAdvanced);
export default router;
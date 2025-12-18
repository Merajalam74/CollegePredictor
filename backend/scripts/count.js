import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import JeeMainsCutoff from '../src/models/JeeMainsCutoff.js';
import JeeAdvancedCutoff from '../src/models/JeeAdvancedCutoff.js';

dotenv.config({ path: '../.env' });

const countEntries = async () => {
  await connectDB();

  const josaaCount = await JeeMainsCutoff.countDocuments({ CounselingType: 'JOSAA' });
  const csabCount = await JeeMainsCutoff.countDocuments({ CounselingType: 'CSAB' });
  const advCount = await JeeAdvancedCutoff.countDocuments();

  console.log(`📊 Database Counts:`);
  console.log(`  - JOSAA Mains: ${josaaCount}`);
  console.log(`  - CSAB Mains:  ${csabCount}`);
  console.log(`  - Advanced:    ${advCount}`);

  process.exit(0);
};

countEntries();

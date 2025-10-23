import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js'; // Adjust path if needed
import JeeMainsCutoff from '../src/models/JeeMainsCutoff.js'; // Adjust path if needed
import JeeAdvancedCutoff from '../src/models/JeeAdvancedCutoff.js'; // Adjust path if needed

// Load .env variables from the backend root directory
dotenv.config({ path: './.env' });
await connectDB(); // Connect to the database

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Define paths to your JSON data files ---
const josaaMainsDataPath = path.join(__dirname, '..', 'data', 'josaa_mains_data.json');
const csabMainsDataPath = path.join(__dirname, '..', 'data', 'csab_mains_data.json');
const advancedDataPath = path.join(__dirname, '..', 'data', 'advanced_data.json');

// --- Helper function to clean Rank values ---
const cleanRank = (rankValue) => {
  if (typeof rankValue === 'number' && !isNaN(rankValue)) return rankValue;
  if (typeof rankValue === 'string') {
    const num = parseInt(rankValue.replace(/P$/, ''), 10); // Remove trailing 'P' if present
    if (!isNaN(num)) return num;
  }
  return null; // Return null if invalid
};

// --- **NEW** Helper function to clean string fields (remove \n and trim) ---
const cleanString = (stringValue) => {
    if (typeof stringValue === 'string') {
        // Replace all newline characters globally (/g) with empty string, then trim whitespace
        return stringValue.replace(/\n/g, '').trim();
    }
    // Return original value if not a string (or null/undefined)
    return stringValue;
};


// --- Helper function to determine if an institute is an NIT ---
const checkIsNIT = (instituteName) => {
  const cleanedName = cleanString(instituteName); // Clean name first
  if (!cleanedName) return false;
  const lowerName = cleanedName.toLowerCase();
  return lowerName.includes('national institute of technology') || lowerName.startsWith('nit ');
};

// --- Helper function to determine InstituteType ---
const determineInstituteType = (instituteName) => {
    const cleanedName = cleanString(instituteName); // Clean name first
    if (!cleanedName) return 'Unknown';
    const lowerName = cleanedName.toLowerCase();
    if (lowerName.includes('national institute of technology') || lowerName.startsWith('nit ')) return 'NIT';
    if (lowerName.includes('indian institute of information technology') || lowerName.startsWith('iiit ')) return 'IIIT';
    if (lowerName.includes('indian institute of technology') || lowerName.startsWith('iit ')) return 'IIT';
    if (lowerName.includes('school of planning') || lowerName.includes('tezpur university')) return 'GFTI'; // Example GFTIs
    return 'GFTI'; // Default to GFTI for Mains if not NIT/IIIT
};

// --- Helper function to validate required fields ---
const validateRequiredFields = (item, type = 'mains') => {
    const requiredMains = ['CounselingType', 'InstituteType', 'Institute', 'Branch', 'Quota', 'Category', 'Gender', 'ClosingRank', 'State'];
    const requiredAdvanced = ['InstituteType', 'Institute', 'Branch', 'Category', 'Gender', 'ClosingRank'];
    const requiredFields = type === 'mains' ? requiredMains : requiredAdvanced;

    for (const field of requiredFields) {
        if (field === 'ClosingRank' && item[field] === null) return false;
        // Use the cleaned string for validation check against empty string
        const valueToCheck = typeof item[field] === 'string' ? cleanString(item[field]) : item[field];
        if (valueToCheck === null || valueToCheck === undefined || valueToCheck === '') {
            // console.warn(`Validation failed for item ${item.Institute}: Missing/empty field "${field}".`);
            return false;
        }
    }
    return true;
};

// --- Main Import Function ---
const importData = async () => {
  try {
    // --- Data Processing Function (Generic) ---
    const processCutoffData = (filePath, counselingType, model, schemaType = 'mains') => {
        console.log(`\n--- Processing ${counselingType} Data ---`);
        console.log(`Reading file: ${path.basename(filePath)}...`);
        if (!fs.existsSync(filePath)) {
            console.warn(`Warning: Data file not found at ${filePath}. Skipping ${counselingType} import.`);
            return [];
        }
        const rawData = fs.readFileSync(filePath, 'utf-8');
        let jsonData = JSON.parse(rawData);
        console.log(`Read ${jsonData.length} raw ${counselingType} records.`);

        console.log(`Processing ${counselingType} data (Cleaning, Enriching, Filtering)...`);
        const processedData = jsonData
            .map((item, index) => {
                const instituteType = determineInstituteType(item.Institute);
                // Basic check for data consistency
                if (schemaType === 'mains' && instituteType === 'IIT') return null;
                if (schemaType === 'advanced' && instituteType !== 'IIT') return null;

                const cleanedClosingRank = cleanRank(item.ClosingRank);
                const cleanedOpeningRank = cleanRank(item.OpeningRank);

                // --- Apply string cleaning to relevant fields ---
                const cleanedInstitute = cleanString(item.Institute);
                const cleanedBranch = cleanString(item.Branch);
                const cleanedCategory = cleanString(item.Category)?.toUpperCase(); // Clean then uppercase
                const cleanedGender = cleanString(item.Gender);
                const cleanedState = cleanString(item.State); // Ensure State exists in JSON
                const cleanedQuota = cleanString(item.Quota)?.toUpperCase(); // Clean then uppercase

                // Structure according to the Mongoose Schema using cleaned values
                const enrichedItem = {
                    Institute: cleanedInstitute,
                    Branch: cleanedBranch,
                    InstituteType: instituteType,
                    Category: cleanedCategory,
                    Gender: cleanedGender,
                    OpeningRank: cleanedOpeningRank,
                    ClosingRank: cleanedClosingRank,
                    ...(schemaType === 'mains' && {
                        CounselingType: counselingType,
                        Quota: cleanedQuota,
                        State: cleanedState, // Use cleaned State
                        IsNIT: instituteType === 'NIT',
                    }),
                    ...(schemaType === 'advanced' && {
                         State: cleanedState, // Use cleaned State if applicable
                    }),
                };

                // Validate using the potentially modified/cleaned enrichedItem
                if (!validateRequiredFields(enrichedItem, schemaType)) {
                   return null; // Mark invalid records for filtering
                }
                return enrichedItem;
            })
            .filter(item => item !== null); // Remove null items (skipped/invalid)

        console.log(`Processed ${processedData.length} valid ${counselingType} records.`);
         if (processedData.length === 0 && jsonData.length > 0) {
            console.error(`Warning: No valid ${counselingType} records remained after processing. Check JSON, required fields (State!), and cleaning logic.`);
         }
        return processedData;
    };

    // --- Import JOSAA Mains Data ---
    const josaaMainsData = processCutoffData(josaaMainsDataPath, 'JOSAA', JeeMainsCutoff, 'mains');
    if (josaaMainsData.length > 0) {
      console.log('Deleting existing JOSAA Mains data...');
      await JeeMainsCutoff.deleteMany({ CounselingType: 'JOSAA' });
      console.log('Importing valid JOSAA Mains data...');
      await JeeMainsCutoff.insertMany(josaaMainsData, { ordered: false });
      console.log('JOSAA Mains Data Imported!');
    } else { console.log("Skipping JOSAA Mains data import."); }

    // --- Import CSAB Mains Data ---
    const csabMainsData = processCutoffData(csabMainsDataPath, 'CSAB', JeeMainsCutoff, 'mains');
    if (csabMainsData.length > 0) {
      console.log('Deleting existing CSAB Mains data...');
      await JeeMainsCutoff.deleteMany({ CounselingType: 'CSAB' });
      console.log('Importing valid CSAB Mains data...');
      await JeeMainsCutoff.insertMany(csabMainsData, { ordered: false });
      console.log('CSAB Mains Data Imported!');
    } else { console.log("Skipping CSAB Mains data import."); }

    // --- Import Advanced Data ---
    const advancedData = processCutoffData(advancedDataPath, 'JeeAdvanced', JeeAdvancedCutoff, 'advanced');
    if (advancedData.length > 0) {
      console.log('Deleting existing Advanced data...');
      await JeeAdvancedCutoff.deleteMany();
      console.log('Importing valid Advanced data...');
      await JeeAdvancedCutoff.insertMany(advancedData, { ordered: false });
      console.log('Advanced Data Imported!');
    } else { console.log("Skipping Advanced data import."); }

    console.log("\nData import process finished.");
    process.exit(0);

  } catch (error) {
    console.error(`\nImport Script Error: ${error.message}`, error.stack);
    process.exit(1);
  }
};

// Execute the import function
importData();
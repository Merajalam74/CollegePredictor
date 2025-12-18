import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import JeeMainsCutoff from '../src/models/JeeMainsCutoff.js';
import JeeAdvancedCutoff from '../src/models/JeeAdvancedCutoff.js';

dotenv.config({ path: './.env' });
await connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const josaaMainsDataPath = path.join(__dirname, '..', 'data', 'josaa_mains_data.json');
const csabMainsDataPath = path.join(__dirname, '..', 'data', 'csab_mains_data.json');
const advancedDataPath = path.join(__dirname, '..', 'data', 'advanced_data.json');

// --- Helper Functions ---
const cleanRank = (r) => { if (typeof r === 'number' && !isNaN(r)) return r; if (typeof r === 'string') { const n = parseInt(r.replace(/P$/, ''), 10); if (!isNaN(n)) return n; } return null; };
const cleanString = (s) => (typeof s === 'string') ? s.replace(/\n/g, '').trim() : s;
const determineInstituteType = (i, t) => { const c = cleanString(t)?.toUpperCase(); if (['NIT','IIIT','GFTI','IIT'].includes(c)) return c; const n = cleanString(i); if (!n) return 'Unknown'; const l = n.toLowerCase(); if (l.includes('national institute of technology') || l.startsWith('nit ')) return 'NIT'; if (l.includes('indian institute of information technology') || l.startsWith('iiit ')) return 'IIIT'; if (l.includes('indian institute of technology') || l.startsWith('iit ')) return 'IIT'; return 'GFTI'; };
const stringToBoolean = (v) => (typeof v === 'boolean') ? v : (typeof v === 'string') ? v.toLowerCase() === 'true' : false;
const validateRequiredFields = (item, type = 'mains') => {
    const fields = type === 'mains' ? ['CounselingType', 'InstituteType', 'Institute', 'Branch', 'Quota', 'Category', 'Gender', 'ClosingRank', 'State'] : ['InstituteType', 'Institute', 'Branch', 'Category', 'Gender', 'ClosingRank'];
    for (const f of fields) { if (item[f] === null || item[f] === undefined || item[f] === '') { console.warn(`Validation failed for ${item.Institute}: Missing field "${f}".`); return false; } }
    return true;
};
// --- End Helpers ---

// --- Seat Key Generators (for matching OPEN seats) ---
const createMainsSeatKey = (item) => [
    cleanString(item.Institute),
    cleanString(item["Academic Program Name"] || item.Branch),
    cleanString(item.Quota)?.toUpperCase(),
    cleanString(item.Gender) // Gender-Neutral and Female-only are different seats
].join('|');

const createAdvancedSeatKey = (item) => [
    cleanString(item.Institute),
    cleanString(item["Academic Program Name"] || item.Branch),
    cleanString(item.Gender)
].join('|');

// --- Build OPEN Rank Map ---
const buildOpenRankMap = (rawData, keyGenFunction) => {
    const rankMap = new Map();
    for (const item of rawData) {
        const category = cleanString(item.Category)?.toUpperCase();
        if (category === 'OPEN') { // Use "OPEN" (non-PwD) as the baseline
            const key = keyGenFunction(item);
            // IMPORTANT: Use the correct rank type (CRL for OPEN)
            const rank = cleanRank(item["Closing Rank"] || item.ClosingRank); 
            if (key && rank !== null) {
                if (!rankMap.has(key) || rank < rankMap.get(key)) {
                    rankMap.set(key, rank); // Store the best (lowest) OPEN rank for this seat
                }
            }
        }
    }
    console.log(`Built OPEN rank map with ${rankMap.size} entries.`);
    return rankMap;
};

// --- Main Data Processing Function ---
const processCutoffData = (rawData, expectedCounselingType, model, schemaType = 'mains', openRankMap) => {
    console.log(`Processing ${rawData.length} raw ${expectedCounselingType} records...`);
    let validCount = 0;
    
    const processedData = rawData
      .map((item, index) => {
        const institute = cleanString(item.Institute);
        const branch = cleanString(item["Academic Program Name"] || item.Branch);
        const instituteType = determineInstituteType(institute, item.InstituteType);
        
        if (schemaType === 'mains' && instituteType === 'IIT') return null;
        if (schemaType === 'advanced' && instituteType !== 'IIT') return null;

        // Standardize "Josaa" to "JOSAA"
        const counselingTypeActual = cleanString(item.CounselingType)?.toUpperCase() || expectedCounselingType;
        if (schemaType === 'advanced') {
            if (instituteType !== 'IIT') return null; // Redundant but safe
        } else {
            // Ensure the type from the file matches the expected type for this run
            if (counselingTypeActual !== expectedCounselingType.toUpperCase()) return null;
        }
        
        const category = cleanString(item.Category)?.toUpperCase();
        const quota = cleanString(item.Quota)?.toUpperCase();
        const gender = cleanString(item.Gender);
        const closingRank = cleanRank(item["Closing Rank"] || item.ClosingRank);
        
        // --- Calculate Equivalent OPEN CRL ---
        let equivalentOpenCrl = null;
        const keyGenFunc = schemaType === 'mains' ? createMainsSeatKey : createAdvancedSeatKey;
        
        if (category === 'OPEN') {
            equivalentOpenCrl = closingRank; // An OPEN seat's sort rank is its own rank
        } else {
            // Find the rank of the corresponding OPEN seat (try item's specific gender first)
            const openSeatKey = keyGenFunc({ ...item, Category: 'OPEN' });
            equivalentOpenCrl = openRankMap.get(openSeatKey);
            
            // Fallback: If no matching gender OPEN seat, try Gender-Neutral
            if (!equivalentOpenCrl && gender !== 'Gender-Neutral') {
                 const openSeatKeyGN = keyGenFunc({ ...item, Category: 'OPEN', Gender: 'Gender-Neutral' });
                 equivalentOpenCrl = openRankMap.get(openSeatKeyGN);
            }
        }
        
        if (equivalentOpenCrl === null || equivalentOpenCrl === undefined) {
           equivalentOpenCrl = 9999999; // Default to high number if no OPEN seat found
        }

        const enrichedItem = {
            Institute: institute, Branch: branch, InstituteType: instituteType,
            Category: category, Gender: gender,
            OpeningRank: cleanRank(item["Opening Rank"] || item.OpeningRank),
            ClosingRank: closingRank,
            equivalentOpenCrl: equivalentOpenCrl, // --- ADDED SORT FIELD ---
            
            ...(schemaType === 'mains' && {
                CounselingType: counselingTypeActual, Quota: quota,
                State: cleanString(item.State), // CRITICAL: Must exist in JSON
                IsNIT: stringToBoolean(item.IsNIT !== undefined ? item.IsNIT : (instituteType === 'NIT')),
            }),
            ...(schemaType === 'advanced' && {
                 State: cleanString(item.State),
            }),
        };

        if (!validateRequiredFields(enrichedItem, schemaType)) return null;
        
        validCount++;
        return enrichedItem;
      })
      .filter(item => item !== null); // Remove invalid items

    console.log(`Processed ${validCount} valid ${expectedCounselingType} records.`);
     if (validCount === 0 && rawData.length > 0) { console.error(`CRITICAL WARNING: No valid ${expectedCounselingType} records remained. Check JSON data fields (e.g., "State", "Closing Rank").`); }
    return processedData;
};
    
// --- Helper to read a JSON file ---
const readJsonFile = (filePath) => {
    if (!fs.existsSync(filePath)) { console.warn(`Warning: Data file not found at ${filePath}.`); return []; }
    try { const d = fs.readFileSync(filePath, 'utf-8'); return Array.isArray(JSON.parse(d)) ? JSON.parse(d) : []; }
    catch (e) { console.error(`Error parsing JSON from ${filePath}: ${e.message}.`); return []; }
};
    
// --- Main Import Execution ---
const importData = async () => {
  try {
    // --- 1. JOSAA Mains ---
    const rawJosaaData = readJsonFile(josaaMainsDataPath);
    const josaaOpenRankMap = buildOpenRankMap(rawJosaaData, createMainsSeatKey);
    const josaaMainsData = processCutoffData(rawJosaaData, 'JOSAA', JeeMainsCutoff, 'mains', josaaOpenRankMap);
    if (josaaMainsData.length > 0) {
      console.log('Deleting JOSAA Mains data...');
      await JeeMainsCutoff.deleteMany({ CounselingType: 'JOSAA' });
      console.log('Importing JOSAA Mains data...');
      await JeeMainsCutoff.insertMany(josaaMainsData, { ordered: false });
      console.log('JOSAA Mains Data Imported!');
    }

    // --- 2. CSAB Mains ---
    const rawCsabData = readJsonFile(csabMainsDataPath);
    // **IMPORTANT**: Use the JOSAA map for CSAB as well to sort by JOSAA's "base" desirability.
    // If you want to sort CSAB by its *own* OPEN ranks, change this to:
    // const csabOpenRankMap = buildOpenRankMap(rawCsabData, createMainsSeatKey);
    const csabMainsData = processCutoffData(rawCsabData, 'CSAB', JeeMainsCutoff, 'mains', josaaOpenRankMap);
    if (csabMainsData.length > 0) {
      console.log('Deleting CSAB Mains data...');
      await JeeMainsCutoff.deleteMany({ CounselingType: 'CSAB' });
      console.log('Importing CSAB Mains data...');
      await JeeMainsCutoff.insertMany(csabMainsData, { ordered: false });
      console.log('CSAB Mains Data Imported!');
    }

    // --- 3. Advanced ---
    const rawAdvancedData = readJsonFile(advancedDataPath);
    const advancedOpenRankMap = buildOpenRankMap(rawAdvancedData, createAdvancedSeatKey);
    const advancedData = processCutoffData(rawAdvancedData, 'IIT', JeeAdvancedCutoff, 'advanced', advancedOpenRankMap);
    if (advancedData.length > 0) {
      console.log('Deleting Advanced data...');
      await JeeAdvancedCutoff.deleteMany();
      console.log('Importing Advanced data...');
      await JeeAdvancedCutoff.insertMany(advancedData, { ordered: false });
      console.log('Advanced Data Imported!');
    }

    console.log("\nData import process finished.");
    process.exit(0);

  } catch (error) {
    console.error(`\nImport Script Error: ${error.message}`, error.stack);
    process.exit(1);
  }
};

importData();


import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { filterCollegesMains, filterCollegesAdvanced } from './logic/filtering.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// --- Load Data at Startup ---
let collegeData = [];
let uniqueBranches = []; // <-- NEW: Store unique branches

try {
  const dataPath = path.join(__dirname, '..', 'data', 'jee_cutoff_data.json');
  const rawData = fs.readFileSync(dataPath);
  collegeData = JSON.parse(rawData);
  console.log(`Successfully loaded ${collegeData.length} college records.`);
  
  // --- NEW: Process and store unique branches ---
  const branchSet = new Set(collegeData.map(row => row.Branch));
  uniqueBranches = [...branchSet].filter(Boolean).sort(); // Filter out null/empty and sort
  console.log(`Found ${uniqueBranches.length} unique branches.`);
  
} catch (e) {
  console.error("!!! FAILED TO LOAD DATA !!!");
  console.error(e);
  process.exit(1); 
}

// --- API Endpoints ---
app.get('/', (req, res) => {
  res.send('College Predictor API is running!');
});

// --- NEW ENDPOINT FOR BRANCHES ---
app.get('/api/branches', (req, res) => {
  res.json(uniqueBranches);
});

// Endpoint for JEE Mains
app.post('/predict/mains', (req, res) => {
  try {
    const results = filterCollegesMains(collegeData, req.body);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint for JEE Advanced
app.post('/predict/advanced', (req, res) => {
  try {
    const results = filterCollegesAdvanced(collegeData, req.body);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening at http://localhost:${PORT}`);
});
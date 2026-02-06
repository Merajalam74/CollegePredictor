import JeeMainsCutoff from '../models/JeeMainsCutoff.js';
import JeeAdvancedCutoff from '../models/JeeAdvancedCutoff.js';

// --- Constants for Rank Filtering (The "Range") ---
const LOWER_RANK_FACTOR = 0.9;     
const UPPER_RANK_FACTOR = 1.20;    
const UPPER_CATEGORY_FACTOR = 1.15; 

// --- Get Branches ---
export const getBranches = async (req, res) => {
  try {
    const mainsBranches = await JeeMainsCutoff.distinct('Branch');
    const advancedBranches = await JeeAdvancedCutoff.distinct('Branch');
    const combinedSet = new Set([...mainsBranches, ...advancedBranches]);
    const uniqueBranches = [...combinedSet].filter(Boolean).sort();
    res.json(uniqueBranches);
  } catch (e) {
    console.error("[getBranches] Error fetching branches:", e);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// --- Predict JEE Mains ---
export const predictMains = async (req, res) => {
  const {
    counseling_type, student_category, category_rank, crl_rank, gender,
    home_state, branch, pws, limit
  } = req.body;

  console.log('[predictMains] Received request body:', req.body);

  const genderLower = (gender || '').toLowerCase();
  const queryLimit = Number(limit) || 100;
  const userCategory = (student_category || 'OPEN').toUpperCase();
  const isCategoryUser = userCategory !== 'OPEN';
  const type = counseling_type; 

  // --- Validation ---
  if (!crl_rank || !gender || !home_state || home_state === 'NONE' || home_state === '' || !type) {
      console.error('[predictMains] Validation Error: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields: CRL Rank, Gender, Home State, and Counseling Type' });
  }
  
  if (isCategoryUser && !category_rank && type === 'JOSAA') {
      console.error('[predictMains] Validation Error: Missing Category Rank for JOSAA');
      return res.status(400).json({ error: 'Category Rank is required for category users in JOSAA counseling.' });
  }

  try {
    console.log(`\n--- [predictMains] Building Query for ${type} ---`);
    let query = {
        CounselingType: type,
        Quota: { "$nin": ["GO", "JK", "LA", "LD"] } 
    };

    // --- Common Filters ---
    if (branch && branch.length > 0) { query.Branch = { $in: branch }; }
    if (genderLower === 'female') { query.Gender = { $in: ['Gender-Neutral', 'Female-only (including supernumerary)'] }; }
    else { query.Gender = 'Gender-Neutral'; }

    // PwD Filter
    const categoryBase = isCategoryUser ? userCategory : 'OPEN';
    const pwdCategory = `${categoryBase}-PwD`;
    let categoryQueryPart = {};
    if (pws) {
        categoryQueryPart = { Category: { $in: [pwdCategory, 'OPEN-PwD'] } };
    } else {
        categoryQueryPart = { Category: { $not: /-PwD$/i } };
    }
    query = { ...query, ...categoryQueryPart };


    // --- Rank Eligibility Filter (Range Query) ---
    let rankConditions = [];
    if (type === "JOSAA") {
      console.log(`[predictMains] JOSAA Logic: User Cat=${userCategory}, Cat Rank=${category_rank}, CRL=${crl_rank}`);
      if (crl_rank) {
        rankConditions.push({ Category: pws ? 'OPEN-PwD' : 'OPEN', ClosingRank: { $gte: crl_rank * LOWER_RANK_FACTOR, $lte: crl_rank * UPPER_RANK_FACTOR } });
      }
      if (isCategoryUser && category_rank) {
        rankConditions.push({ Category: pws ? pwdCategory : userCategory, ClosingRank: { $gte: category_rank * LOWER_RANK_FACTOR, $lte: category_rank * UPPER_CATEGORY_FACTOR } });
      }
    } else if (type === "CSAB") {
      console.log(`[predictMains] CSAB Logic: User Cat=${userCategory}, CRL=${crl_rank}`);
       if (crl_rank) {
            // CSAB uses CRL for all categories
            rankConditions.push({ Category: pws ? 'OPEN-PwD' : 'OPEN', ClosingRank: { $gte: crl_rank * LOWER_RANK_FACTOR, $lte: crl_rank * UPPER_RANK_FACTOR } });
            if (isCategoryUser) {
                rankConditions.push({ Category: pws ? pwdCategory : userCategory, ClosingRank: { $gte: crl_rank * LOWER_RANK_FACTOR, $lte: crl_rank * UPPER_RANK_FACTOR } });
            }
       }
    }

    // --- Combine Filters using $and ---
    query.$and = query.$and || [];
    if (rankConditions.length > 0) {
        query.$and.push({ $or: rankConditions });
    } else {
         console.warn(`[predictMains] Skipping ${type} search: No valid rank conditions.`);
         return res.json([]);
    }

    // --- Quota Eligibility Logic for BOTH JOSAA & CSAB *** ---
    const quotaConditions = [
       { IsNIT: true, State: home_state, Quota: { $in: ["HS", "AI"] } },
       { IsNIT: true, State: { $ne: home_state }, Quota: { $in: ["OS", "AI"] } },
       { IsNIT: false, Quota: { $in: ["AI", "OS"] } }
    ];
    query.$and.push({ $or: quotaConditions });
    console.log(`[predictMains] Added Quota Conditions (Home State: ${home_state}):`, JSON.stringify({ $or: quotaConditions }));


    // --- Execute Query ---
    console.log(`[predictMains] Final ${type} Query:`, JSON.stringify(query, null, 2));
    const typeResults = await JeeMainsCutoff.find(query)
      .sort({ equivalentOpenCrl: 1, ClosingRank: 1 })
      .limit(queryLimit)
      .lean();

    console.log(`---> [predictMains] Found ${typeResults.length} ${type} results in DB.`);
    
    res.json(typeResults); 

  } catch (e) {
    console.error(`[predictMains] Error: ${e.message}`, e.stack);
    res.status(500).json({ error: 'An error occurred during prediction' });
  }
};


// --- Predict JEE Advanced ---
export const predictAdvanced = async (req, res) => {
     const { student_category, category_rank, crl_rank, gender, branch, limit, pws } = req.body;
     console.log('[predictAdvanced] Received request body:', req.body);

     const genderLower = (gender || '').toLowerCase();
     const queryLimit = Number(limit) || 100;
     const userCategory = (student_category || 'OPEN').toUpperCase();
     const isCategoryUser = userCategory !== 'OPEN';
     const isPwsAdv = pws || false;

     if (!crl_rank || !gender) { return res.status(400).json({ error: 'Missing required fields: CRL Rank, Gender' }); }
     if (isCategoryUser && !category_rank) { return res.status(400).json({ error: 'Category Rank required for category users.' }); }

      try {
        let query = {};
        if (branch && branch.length > 0) query.Branch = { $in: branch };
        if (genderLower === 'female') query.Gender = { $in: ['Gender-Neutral', 'Female-only (including supernumerary)'] };
        else query.Gender = 'Gender-Neutral';

        // PwD Filter
        const categoryBaseAdv = isCategoryUser ? userCategory : 'OPEN';
        const pwdCategoryAdv = `${categoryBaseAdv}-PwD`;
        let categoryQueryPartAdv = {};
        if (isPwsAdv) { categoryQueryPartAdv = { Category: { $in: [pwdCategoryAdv, 'OPEN-PwD'] } }; }
        else { categoryQueryPartAdv = { Category: { $not: /-PwD$/i } }; }
        query = { ...query, ...categoryQueryPartAdv };

        // Rank Eligibility Filter (Range Query)
        let rankConditions = [];
        if(crl_rank){
            rankConditions.push({ Category: isPwsAdv ? 'OPEN-PwD' : 'OPEN', ClosingRank: { $gte: crl_rank * LOWER_RANK_FACTOR, $lte: crl_rank * UPPER_RANK_FACTOR } });
        }
        if (isCategoryUser && category_rank) {
           rankConditions.push({ Category: isPwsAdv ? pwdCategoryAdv : userCategory, ClosingRank: { $gte: category_rank * LOWER_RANK_FACTOR, $lte: category_rank * UPPER_CATEGORY_FACTOR } });
        }

         if (rankConditions.length === 0){ console.warn('[predictAdvanced] Skipping search: No valid rank conditions.'); return res.json([]); }
         query.$and = query.$and || [];
         query.$and.push({ $or: rankConditions });

        console.log("[predictAdvanced] Executing Query:", JSON.stringify(query, null, 2));
        const advResults = await JeeAdvancedCutoff.find(query)
          .sort({ equivalentOpenCrl: 1, ClosingRank: 1 })
          .limit(queryLimit)
          .lean();

        console.log(`---> [predictAdvanced] Found ${advResults.length} results in DB.`);
        res.json(advResults); 

      } catch (e) {
        console.error(`[predictAdvanced] Error: ${e.message}`, e.stack);
        res.status(500).json({ error: 'An error occurred during prediction' });
      }
};


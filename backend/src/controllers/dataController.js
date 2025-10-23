import JeeMainsCutoff from '../models/JeeMainsCutoff.js';
import JeeAdvancedCutoff from '../models/JeeAdvancedCutoff.js';

// --- Constants for Rank Filtering (Optional: Define rank range factors) ---
// const LOWER_RANK_FACTOR = 0.9;
// const UPPER_RANK_FACTOR = 1.20;
// const UPPER_CATEGORY_FACTOR = 1.15;

// --- Get Unique Branches ---
// @desc    Get all unique branches from both databases
// @route   GET /api/data/branches
export const getBranches = async (req, res) => {
  try {
    const mainsBranches = await JeeMainsCutoff.distinct('Branch');
    const advancedBranches = await JeeAdvancedCutoff.distinct('Branch');
    const combinedSet = new Set([...mainsBranches, ...advancedBranches]);
    const uniqueBranches = [...combinedSet].filter(Boolean).sort();
    res.json(uniqueBranches);
  } catch (e) {
    console.error("Error fetching branches:", e);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

// --- Predict JEE Mains ---
// @desc    Predict JEE Mains colleges implementing JOSAA/CSAB and HS/OS logic
// @route   POST /api/data/predict/mains
export const predictMains = async (req, res) => {
  const {
    counseling_type, // "JOSAA", "CSAB", or potentially array ["JOSAA", "CSAB"]
    student_category, // User's category (e.g., "OBC-NCL")
    category_rank, // User's category rank
    crl_rank, // User's CRL rank
    gender, // User's gender
    home_state, // User's selected Home State (e.g., "Bihar")
    branch, // Array of preferred branches
    // quota field from user input is no longer needed, we calculate eligibility
    pws, // Boolean PwD status
    limit // Max results per counseling type
  } = req.body;

  const genderLower = (gender || '').toLowerCase();
  const queryLimit = Number(limit) || 100;
  const userCategory = (student_category || 'OPEN').toUpperCase();
  const isCategoryUser = userCategory !== 'OPEN';

  // --- Validation ---
  if (!crl_rank || !gender || !home_state || home_state === 'NONE' || home_state === '') {
      return res.status(400).json({ error: 'Missing required fields: CRL Rank, Gender, and Home State' });
  }
  if (isCategoryUser && !category_rank && counseling_type !== 'CSAB' && (!Array.isArray(counseling_type) || counseling_type.includes('JOSAA'))) {
      // Category rank needed for JOSAA if user has a category
      return res.status(400).json({ error: 'Category Rank is required for category users in JOSAA counseling.' });
  }

  // Determine which counseling types to query
  let counselingTypesToQuery = [];
  if (Array.isArray(counseling_type) && counseling_type.length > 0) {
      counselingTypesToQuery = counseling_type.filter(ct => ['JOSAA', 'CSAB'].includes(ct)); // Filter valid types
  } else if (typeof counseling_type === 'string' && ['JOSAA', 'CSAB'].includes(counseling_type)) {
      counselingTypesToQuery = [counseling_type];
  } else {
      counselingTypesToQuery = ["JOSAA", "CSAB"]; // Default
  }

  if (counselingTypesToQuery.length === 0) {
      return res.status(400).json({ error: 'Please select at least one valid counseling type (JOSAA/CSAB).' });
  }

  try {
    const results = {}; // Store results keyed by counseling type { JOSAA: [], CSAB: [] }

    for (const type of counselingTypesToQuery) {
        let query = { CounselingType: type }; // Base filter: JOSAA or CSAB data

        // --- Common Filters (Gender, Branch, PwD) ---
        if (branch && branch.length > 0) {
          query.Branch = { $in: branch };
        }
        if (genderLower === 'female') {
          query.Gender = { $in: ['Gender-Neutral', 'Female-only (including supernumerary)'] };
        } else {
          query.Gender = 'Gender-Neutral';
        }
        // PwD Filter: Assumes PwD categories end with '-PwD' (e.g., OPEN-PwD, OBC-NCL-PwD)
        // Adjust regex if your PwD category naming is different.
        if (pws) {
            // User is PwD, find seats matching their category + PwD suffix OR general PwD seats
            // This logic might need refinement based on exact category names
             if (isCategoryUser) {
                 query.Category = { $in: [`${userCategory}-PwD`, 'OPEN-PwD'] }; // Match specific PwD or OPEN-PwD
             } else {
                 query.Category = 'OPEN-PwD'; // OPEN users only match OPEN-PwD
             }
        } else {
            // User is NOT PwD, exclude PwD seats using negative lookahead regex
             query.Category = { $not: /-PwD$/i };
        }


        // --- Rank Eligibility Filter ($or condition based on counseling type) ---
        let rankConditions = [];
        if (type === "JOSAA") {
          // JOSAA: Check OPEN seats via CRL AND Category seats via Category Rank
          if (crl_rank) {
            rankConditions.push({
              Category: pws ? 'OPEN-PwD' : 'OPEN', // Match OPEN or OPEN-PwD
              ClosingRank: { $gte: crl_rank } // User CRL must be <= Closing Rank (which is CRL for OPEN)
              // Add range factors: $gte: crl_rank * LOWER_RANK_FACTOR, $lte: crl_rank * UPPER_RANK_FACTOR
            });
          }
          if (isCategoryUser && category_rank) {
            rankConditions.push({
              Category: pws ? `${userCategory}-PwD` : userCategory, // Match specific Category or its PwD variant
              ClosingRank: { $gte: category_rank } // User Category Rank must be <= Closing Rank (which is Cat Rank for JOSAA Cat)
              // Add range factors: $gte: category_rank * LOWER_RANK_FACTOR, $lte: category_rank * UPPER_CATEGORY_FACTOR
            });
          }
        } else if (type === "CSAB") {
          // CSAB: Check OPEN seats via CRL AND Category seats via CRL
           if (crl_rank) {
                rankConditions.push({
                    Category: pws ? 'OPEN-PwD' : 'OPEN',
                    ClosingRank: { $gte: crl_rank } // Compare CSAB Closing (CRL) with User CRL
                    // Add range factors if desired
                });
                if (isCategoryUser) {
                    rankConditions.push({
                        Category: pws ? `${userCategory}-PwD` : userCategory,
                        ClosingRank: { $gte: crl_rank } // Compare CSAB Closing (CRL) with User CRL
                        // Add range factors if desired
                    });
                }
           }
        }

        // --- Quota Eligibility Filter ($or condition based on Home State and IsNIT) ---
        const quotaConditions = [
           // Condition 1: Non-NITs - Eligible for AI and OS (assuming OS used broadly for non-HS)
           { IsNIT: false, Quota: { $in: ["AI", "OS"] } },
           // Condition 2: NIT in User's Home State - Eligible for HS and AI
           { IsNIT: true, State: home_state, Quota: { $in: ["HS", "AI"] } },
           // Condition 3: NIT NOT in User's Home State - Eligible for OS and AI
           { IsNIT: true, State: { $ne: home_state }, Quota: { $in: ["OS", "AI"] } }
           // Add conditions for JK, LA quotas if needed, based on home_state or other user flags
        ];

        // --- Combine Filters using $and ---
        query.$and = [];
        if (rankConditions.length > 0) {
            query.$and.push({ $or: rankConditions }); // Add rank eligibility
        } else {
             // If somehow no rank conditions met (e.g., missing ranks), don't proceed
             results[type] = [];
             console.log(`Skipping ${type} due to missing rank data for query.`);
             continue; // Go to next counseling type
        }
        query.$and.push({ $or: quotaConditions }); // Add quota eligibility


        // --- Execute Query for this counseling type ---
        console.log(`Executing ${type} Query:`, JSON.stringify(query, null, 2));
        const typeResults = await JeeMainsCutoff.find(query)
          .sort({ ClosingRank: 1 }) // Sort results within the eligible range
          .limit(queryLimit)       // Apply limit
          .lean();                 // Use lean for performance

        results[type] = typeResults; // Store results keyed by type
        console.log(`Found ${typeResults.length} ${type} results.`);
    } // End loop through counseling types

    res.json(results); // Send back object like { JOSAA: [...], CSAB: [...] }

  } catch (e) {
    console.error("Error during Mains prediction:", e);
    res.status(500).json({ error: 'An error occurred during prediction' });
  }
};


export const predictAdvanced = async (req, res) => {
     
     const { student_category, category_rank, crl_rank, gender, branch, limit } = req.body;
     const genderLower = (gender || '').toLowerCase();
     const queryLimit = Number(limit) || 100;
     const userCategory = (student_category || 'OPEN').toUpperCase();
     const isCategoryUser = userCategory !== 'OPEN';

     if (!crl_rank || !gender) return res.status(400).json({ error: 'Missing required fields: CRL Rank, Gender' });
     if (isCategoryUser && !category_rank) return res.status(400).json({ error: 'Category Rank is required for category users.' });

      try {
        let query = {};
        if (branch && branch.length > 0) query.Branch = { $in: branch };
        if (genderLower === 'female') query.Gender = { $in: ['Gender-Neutral', 'Female-only (including supernumerary)'] };
        else query.Gender = 'Gender-Neutral';
        // Add PwD logic similar to Mains if needed based on Adv Category names

        let rankConditions = [];
        // OPEN Seats Check (All users eligible via CRL)
        rankConditions.push({ Category: 'OPEN', ClosingRank: { $gte: crl_rank } });
        // Category Seats Check (Only Category Users via Category Rank)
        if (isCategoryUser) {
           rankConditions.push({ Category: userCategory, ClosingRank: { $gte: category_rank } });
        }
         query.$or = rankConditions;

        console.log("Executing Advanced Query:", JSON.stringify(query, null, 2));
        const advResults = await JeeAdvancedCutoff.find(query) // Renamed variable
          .sort({ ClosingRank: 1 })
          .limit(queryLimit)
          .lean();

        console.log(`Found ${advResults.length} Advanced results.`);
        res.json(advResults); // Send back array
      } catch (e) {
        console.error("Error during Advanced prediction:", e);
        res.status(500).json({ error: 'An error occurred during prediction' });
      }
};
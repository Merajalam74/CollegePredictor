import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import JeeMainsCutoff from "./src/models/JeeMainsCutoff.js";
import JeeAdvancedCutoff from "./src/models/JeeAdvancedCutoff.js";

// === Load environment variables ===
dotenv.config({ path: "./.env" });

// === Helper functions ===
const clean = (v) => (typeof v === "string" ? v.trim() : v);
const cleanRank = (r) => {
  if (typeof r === "number" && !isNaN(r)) return r;
  if (typeof r === "string") {
    const n = parseInt(r.replace(/P$/, "").trim(), 10);
    if (!isNaN(n)) return n;
  }
  return null;
};

// === JSON Reader with normalization ===
const readJsonFile = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    if (!Array.isArray(json)) return [];

    // Normalize keys
    return json.map((item) => {
      const normalized = { ...item };

      // Handle Academic Program → Branch
      if (normalized["Academic Program"] && !normalized.Branch) {
        normalized.Branch = normalized["Academic Program"];
      } else if (normalized["Academic Program Name"] && !normalized.Branch) {
        normalized.Branch = normalized["Academic Program Name"];
      }

      // Handle Closing Rank → ClosingRank
      if (normalized["Closing Rank"] && !normalized.ClosingRank) {
        normalized.ClosingRank = normalized["Closing Rank"];
      }

      // Handle Opening Rank → OpeningRank
      if (normalized["Opening Rank"] && !normalized.OpeningRank) {
        normalized.OpeningRank = normalized["Opening Rank"];
      }

      return normalized;
    });
  } catch (err) {
    console.error(`❌ Error reading ${filePath}: ${err.message}`);
    return [];
  }
};

// === Validate required fields ===
const validateItem = (item, type = "mains") => {
  const errors = [];
  const fields =
    type === "mains"
      ? [
          "CounselingType",
          "InstituteType",
          "Institute",
          "Branch",
          "Quota",
          "Category",
          "Gender",
          "ClosingRank",
          "State",
        ]
      : ["InstituteType", "Institute", "Branch", "Category", "Gender", "ClosingRank"];

  for (const f of fields) {
    if (item[f] === null || item[f] === undefined || item[f] === "") {
      errors.push(`Missing field: ${f}`);
    }
  }

  if (item.ClosingRank === null || isNaN(item.ClosingRank)) {
    errors.push("Invalid or missing ClosingRank");
  }

  return errors;
};

// === Compare JSON vs Database ===
const compareData = async (name, jsonFile, dbModel, dbFilter = {}, schemaType = "mains") => {
  console.log(`\n🔍 Comparing ${name} data...`);

  const jsonData = readJsonFile(jsonFile);
  const dbData = await dbModel.find(dbFilter).lean();

  console.log(`📄 JSON entries: ${jsonData.length}`);
  console.log(`💾 DB entries:   ${dbData.length}`);

  const validationErrors = [];
  const jsonKeys = new Set();
  const dbKeys = new Set();

  const makeKey = (item) =>
    [
      clean(item.Institute),
      clean(item.Branch),
      clean(item.Category)?.toUpperCase(),
      clean(item.Gender),
      schemaType === "mains" ? clean(item.Quota)?.toUpperCase() : "",
    ].join("|");

  // Build JSON map and check for validation errors
  jsonData.forEach((item) => {
    const key = makeKey(item);
    if (key) jsonKeys.add(key);

    const errors = validateItem(item, schemaType);
    if (errors.length > 0) {
      validationErrors.push({ ...item, ErrorReason: errors.join("; ") });
    }
  });

  // Build DB map
  dbData.forEach((item) => {
    const key = makeKey(item);
    if (key) dbKeys.add(key);
  });

  // Compare sets
  const missingInDB = [...jsonKeys].filter((k) => !dbKeys.has(k));
  const missingInJSON = [...dbKeys].filter((k) => !jsonKeys.has(k));

  // === Save results ===
  const outputDir = "./compare_results";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  fs.writeFileSync(
    path.join(outputDir, `${name}_MissingInDB.json`),
    JSON.stringify(missingInDB, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, `${name}_MissingInJSON.json`),
    JSON.stringify(missingInJSON, null, 2)
  );
  fs.writeFileSync(
    path.join(outputDir, `${name}_ValidationErrors.json`),
    JSON.stringify(validationErrors, null, 2)
  );

  console.log(`📊 Summary for ${name}:`);
  console.log(`   - Missing in DB:    ${missingInDB.length}`);
  console.log(`   - Missing in JSON:  ${missingInJSON.length}`);
  console.log(`   - Validation Errors: ${validationErrors.length}`);
  console.log(`✅ Results saved in: compare_results/${name}_*.json`);
};

// === MAIN EXECUTION ===
const runComparison = async () => {
  await connectDB();

  const josaaPath = path.resolve("./data/josaa_mains_data.json");
  const csabPath = path.resolve("./data/csab_mains_data.json");
  const advPath = path.resolve("./data/advanced_data.json");

  await compareData("JOSAA", josaaPath, JeeMainsCutoff, { CounselingType: "JOSAA" }, "mains");
  await compareData("CSAB", csabPath, JeeMainsCutoff, { CounselingType: "CSAB" }, "mains");
  await compareData("ADVANCED", advPath, JeeAdvancedCutoff, {}, "advanced");

  console.log("\n🎯 Comparison complete. Check 'compare_results' folder for output.");
  mongoose.connection.close();
};

runComparison().catch((err) => {
  console.error("❌ Comparison script failed:", err);
  mongoose.connection.close();
});

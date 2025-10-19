// This function replicates your Python filtering logic for JEE Mains
export function filterCollegesMains(allData, inputs) {
  const { student_category, category_rank, crl_rank, gender, branch, quota } = inputs;
  
  const studentCategoryUpper = (student_category || '').toUpperCase();
  const genderLower = (gender || '').toLowerCase();
  const quotaLower = (quota || '').toLowerCase();

  const eligibleRows = allData.filter(row => {
    const seat_category = String(row.Category || '').toUpperCase();
    const seat_gender = String(row.Gender || '').toLowerCase();
    const seat_quota = String(row.Quota || '').toLowerCase();
    const seat_branch = String(row.Branch || '');
    const closing_rank = Number(row.ClosingRank);

    if (seat_gender === "female-only (including supernumerary)" && genderLower !== "female") {
      return false;
    }
    if (quotaLower !== "all" && seat_quota !== quotaLower) {
      return false;
    }
    if (branch && branch.length > 0 && !branch.includes(seat_branch)) {
      return false;
    }
    
    const margin_factor = 1.20;
    if (seat_category === "OPEN") {
      if (crl_rank <= closing_rank * margin_factor) {
        return true;
      }
    } else if (seat_category === studentCategoryUpper) {
      if (category_rank <= closing_rank * (margin_factor - 0.05)) {
        return true;
      }
    }
    
    return false;
  });

  // Sort by ClosingRank, ascending, AND limit to 100
  return eligibleRows
    .sort((a, b) => a.ClosingRank - b.ClosingRank)
    .slice(0, 100); // <-- THIS IS THE CHANGE
}


// This function replicates your Python filtering logic for JEE Advanced (no quota)
export function filterCollegesAdvanced(allData, inputs) {
  const { student_category, category_rank, crl_rank, gender, branch } = inputs;
  
  const studentCategoryUpper = (student_category || '').toUpperCase();
  const genderLower = (gender || '').toLowerCase();

  const eligibleRows = allData.filter(row => {
    const seat_category = String(row.Category || '').toUpperCase();
    const seat_gender = String(row.Gender || '').toLowerCase();
    const seat_branch = String(row.Branch || '');
    const closing_rank = Number(row.ClosingRank);

    if (seat_gender === "female-only (including supernumerary)" && genderLower !== "female") {
      return false;
    }
    if (branch && branch.length > 0 && !branch.includes(seat_branch)) {
      return false;
    }
    
    const margin_factor = 1.20;
    if (seat_category === "OPEN") {
      if (crl_rank <= closing_rank * margin_factor) {
        return true;
      }
    } else if (seat_category === studentCategoryUpper) {
      if (category_rank <= closing_rank * (margin_factor - 0.05)) {
        return true;
      }
    }
    
    return false;
  });

  // Sort by ClosingRank, ascending, AND limit to 100
  return eligibleRows
    .sort((a, b) => a.ClosingRank - b.ClosingRank)
    .slice(0, 100); // <-- THIS IS THE CHANGE
}
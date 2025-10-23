import React from 'react';
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";

// Keep the full list for potential future use or dynamic fetching
const allCounselingOptions = [
  "JOSAA",
  "CSAB",
  // "WBJEE", // Add others here later
  // "UPTU",
  // "IPU",
  // "JAC Chandigarh",
  // "JAC Delhi",
];

// Component now takes available options to display as tabs
export default function CounselingSelector({
  selectedCounseling,
  onSelectCounseling,
  availableCounselings = [] // Array of strings like ["JOSAA", "CSAB"]
}) {
  // Only show buttons for counselings that have results
  const optionsToShow = allCounselingOptions.filter(option => availableCounselings.includes(option));

  // Don't render anything if only one type of result is available
  if (optionsToShow.length <= 1) {
    return null;
  }

  return (
    // Styling for tab container
    <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-300 dark:border-gray-700">
      {optionsToShow.map((option) => (
        <Button
          key={option}
          variant="ghost" // Use ghost variant for tabs
          onClick={() => onSelectCounseling(option)}
          // Styling for individual tabs (active vs inactive)
          className={cn(
            "rounded-none px-4 py-2 text-sm md:text-base transition-colors duration-200 border-b-2 -mb-px", // -mb-px pulls border up
            selectedCounseling === option
              ? "border-primary-blue text-primary-blue font-semibold bg-blue-50 dark:bg-gray-800" // Active tab style
              : "border-transparent text-gray-500 hover:text-primary-blue hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800" // Inactive tab style
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
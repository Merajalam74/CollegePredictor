import React from 'react';
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";

const allCounselingOptions = [
  "JOSAA",
  "CSAB",
  // "WBJEE", 
  // "UPTU",
  // "IPU",
  // "JAC Chandigarh",
  // "JAC Delhi",
];

export default function CounselingSelector({
  selectedCounseling,
  onSelectCounseling,
  availableCounselings = [] 
}) {
  
  const optionsToShow = allCounselingOptions.filter(option => availableCounselings.includes(option));

  if (optionsToShow.length <= 1) {
    return null;
  }

  return (
    // Styling for tab container
    <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-300 dark:border-gray-700">
      {optionsToShow.map((option) => (
        <Button
          key={option}
          variant="ghost" 
          onClick={() => onSelectCounseling(option)}
          // Styling for individual tabs (active vs inactive)
          className={cn(
            "rounded-none px-4 py-2 text-sm md:text-base transition-colors duration-200 border-b-2 -mb-px", 
            selectedCounseling === option
              ? "border-primary-blue text-primary-blue font-semibold bg-blue-50 dark:bg-gray-800" 
              : "border-transparent text-gray-500 hover:text-primary-blue hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800" // Inactive tab style
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

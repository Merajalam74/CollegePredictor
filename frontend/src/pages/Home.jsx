import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function Home() {
  return (
    <div className="max-w-4xl animate-in fade-in-50 duration-500">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
        🎓 Welcome to the JEE College Predictor!
      </h1>
      
      <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Your Personal Guide to Engineering Admissions
        </h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
          Navigating the college admissions process can be overwhelming. This tool is designed to simplify that journey by providing a clear, data-driven prediction of the colleges you might be eligible for based on your JEE Main and Advanced ranks.
        </p>
        
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
          How to Use This Tool
        </h3>
        <ol className="list-decimal list-inside text-lg text-gray-700 dark:text-gray-300 space-y-3">
          <li><strong>Select a Predictor:</strong> Use the navigation sidebar on the left.</li>
          <li><strong>Enter Your Details:</strong> Fill in your rank, category, and gender.</li>
          <li><strong>Get Your Results:</strong> Instantly see a list of eligible colleges.</li>
        </ol>

        <Alert className="mt-10 max-w-3xl">
          <Info className="h-4 w-4" />
          <AlertTitle>Please Note</AlertTitle>
          <AlertDescription>
            This tool uses official JoSAA cutoff data from previous years. Cutoffs can vary year-to-year, so these predictions are for informational purposes only.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
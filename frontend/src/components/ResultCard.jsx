import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function ResultCard({ result, userRank }) {
  
  // Logic from your display_college_card function
  const closing_rank = result.ClosingRank;
  const safety_margin = closing_rank - userRank;
  let safety_text;
  let safety_color_class;

  if (safety_margin < 0) {
    safety_text = `Difficult (${Math.abs(safety_margin).toLocaleString()} ranks away)`;
    safety_color_class = "text-red-600 dark:text-red-500";
  } else if (safety_margin < closing_rank * 0.1) {
    safety_text = `Moderate (${safety_margin.toLocaleString()} ranks buffer)`;
    safety_color_class = "text-yellow-600 dark:text-yellow-500";
  } else {
    safety_text = `Safe (${safety_margin.toLocaleString()} ranks buffer)`;
    safety_color_class = "text-green-600 dark:text-green-500";
  }

  // Assign colors to quota badges
  const quota = (result.Quota || 'AI').toUpperCase();
  let quota_color_class = "bg-gray-700";
  if (quota === 'HS') quota_color_class = "bg-green-600";
  if (quota === 'OS') quota_color_class = "bg-orange-600";

  return (
    <Card className="animate-in fade-in-50 duration-300">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{result.Institute}</CardTitle>
        <p className="text-blue-600 dark:text-blue-400 font-medium pt-1 text-lg">{result.Branch}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <Badge className={cn("text-white", quota_color_class)}>{result.Quota}</Badge>
            <Badge variant="outline">{result.Category}</Badge>
            <Badge variant="secondary">{result.Gender}</Badge>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Closing Rank</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {result.ClosingRank.toLocaleString()}
            </p>
            <p className={cn("text-sm font-medium", safety_color_class)}>
              {safety_text}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
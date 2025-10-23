import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowRight, UserCheck } from 'lucide-react'; // Added UserCheck icon

// Helper function to assign colors to badges (customize as needed)
const getBadgeColor = (type, value) => {
    value = value?.toLowerCase() || '';
    if (type === 'category') {
        if (value.includes('obc')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        if (value.includes('ews')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (value.includes('sc')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        if (value.includes('st')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'; // OPEN or others
    }
    if (type === 'quota') {
        if (value === 'os') return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        if (value === 'hs') return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'; // AI or others
    }
    if (type === 'gender') {
        if (value.includes('female')) return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'; // Gender-Neutral
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};


export function ResultCard({ result }) {
    // Assuming result object has fields like:
    // Institute, Branch, Category, Quota, Gender, OpeningRank, ClosingRank

    return (
        <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {result.Institute}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 pt-1">
                    {result.Branch}
                </p>
            </CardHeader>
            <CardContent className="flex-grow pt-2 pb-4 space-y-3">
                {/* Badges for Seat Type, Quota, Gender */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`text-xs font-medium ${getBadgeColor('category', result.Category)} border-transparent`}>
                        Seat Type: {result.Category}
                    </Badge>
                    {result.Quota && (
                       <Badge variant="outline" className={`text-xs font-medium ${getBadgeColor('quota', result.Quota)} border-transparent`}>
                           Quota: {result.Quota}
                       </Badge>
                    )}
                    <Badge variant="outline" className={`text-xs font-medium ${getBadgeColor('gender', result.Gender)} border-transparent`}>
                        {result.Gender}
                    </Badge>
                </div>

                {/* Opening and Closing Ranks */}
                <div className="flex justify-between items-center text-sm pt-2">
                    <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Opening Rank</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{result.OpeningRank?.toLocaleString() ?? 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400">Closing Rank</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{result.ClosingRank?.toLocaleString() ?? 'N/A'}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-800 p-3 mt-auto">
                {/* Placeholder Button */}
                <Button variant="ghost" className="w-full text-primary-blue hover:bg-blue-100 dark:hover:bg-gray-700">
                    Meet College Seniors <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
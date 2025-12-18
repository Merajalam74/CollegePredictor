import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { ArrowRight, Trophy, TrendingUp } from 'lucide-react';

// Helper for Badge Colors
const getBadgeColor = (type, value) => {
    const val = (value || '').toLowerCase();
    
    if (type === 'allotted') {
        // Special highlighting if a category student gets an OPEN seat
        if (val === 'open') return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-100';
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900 dark:text-blue-100';
    }

    if (type === 'quota') {
        if (val === 'hs') return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100';
        if (val === 'os') return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    if (type === 'gender') {
        if (val.includes('female')) return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-100';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    return 'bg-gray-100 text-gray-800';
};

export function ResultCard({ result }) {
    // Determine if this is a "Merit Upgrade" (Category student got Open Seat)
    // We assume if allottedVia is OPEN but the Seat Category might be different in database context, 
    // or simply if the badge says "OPEN".
    const allottedVia = result.allottedVia || result.Category;
    const isMeritSeat = allottedVia === 'OPEN';
    
    // Safety check for ranks
    const closingRank = result.ClosingRank || result.Closing_Rank; // Handle different casing if any
    const equivRank = result.equivalentOpenRank;

    return (
        <Card className="flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group">
            
            <CardHeader className="pb-3 bg-gradient-to-r from-transparent to-gray-50 dark:to-gray-800/50">
                <div className="flex justify-between items-start mb-2">
                    {/* Quota & Gender Badges */}
                    <div className="flex gap-2">
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${getBadgeColor('quota', result.Quota)}`}>
                            {result.Quota || 'AI'}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide ${getBadgeColor('gender', result.Gender)}`}>
                            {result.Gender === 'Gender-Neutral' ? 'Neutral' : 'Female'}
                        </Badge>
                    </div>
                    
                    {/* The "How you got this" Badge */}
                    <Badge className={`text-xs font-semibold shadow-sm ${getBadgeColor('allotted', allottedVia)}`}>
                        {isMeritSeat && <TrendingUp className="w-3 h-3 mr-1" />}
                        Via {allottedVia}
                    </Badge>
                </div>

                <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-50 leading-snug group-hover:text-primary-blue transition-colors">
                    {result.Institute}
                </CardTitle>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {result["Academic Program Name"] || result.Branch}
                </p>
            </CardHeader>

            <CardContent className="flex-grow pt-2 pb-4 space-y-4">
                {/* Rank Display Grid */}
                <div className="grid grid-cols-2 gap-3">
                    
                    {/* Box 1: The Cutoff you cleared */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                            Closing Rank
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                #{closingRank?.toLocaleString() ?? 'N/A'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                ({result.Category})
                            </span>
                        </div>
                    </div>

                    {/* Box 2: The CRL Equivalent (Prestige) */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
                        {/* Decorative Icon */}
                        <Trophy className="absolute -right-2 -bottom-2 w-8 h-8 text-indigo-100 dark:text-indigo-800 opacity-50" />
                        
                        <p className="text-xs text-indigo-600 dark:text-indigo-300 mb-1 uppercase tracking-wider font-semibold flex items-center gap-1">
                             CRL Value
                        </p>
                        <div className="flex items-baseline gap-1 relative z-10">
                             <span className="text-lg font-bold text-indigo-700 dark:text-indigo-200">
                                #{equivRank ? equivRank.toLocaleString() : closingRank?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Contextual Message */}
                {equivRank && equivRank !== closingRank && (
                    <p className="text-[10px] text-center text-gray-400 italic">
                        *Market value of this seat in General Category is CRL {equivRank.toLocaleString()}
                    </p>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-gray-50 dark:bg-gray-800/50 mt-auto border-t border-gray-100 dark:border-gray-700">
                <Button variant="ghost" className="w-full text-sm h-9 text-primary-blue hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 group/btn">
                    Connect with Seniors 
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}
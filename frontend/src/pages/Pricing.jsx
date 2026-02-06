import React from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge.jsx";

export default function Pricing() {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!userInfo) {
      navigate('/login?redirect=pricing');
    } else {
      navigate('/checkout'); 
    }
  };

  const isPremium = userInfo?.subscription === 'premium';

  return (
    <div className="max-w-md mx-auto pt-10 px-4">
      <Card className="shadow-xl border-2 border-primary-blue/20 relative overflow-hidden">
        {/* Banner for "Free" */}
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-8 py-1 transform rotate-45 translate-x-8 translate-y-4">
          FREE
        </div>

        <CardHeader className="text-center pb-2">
          <Badge className="w-fit mx-auto mb-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Limited Time Offer
          </Badge>
          <CardTitle className="text-3xl font-bold">Pro Plan Access</CardTitle>
          <CardDescription>Everything you need to crack your dream college.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-center my-6 flex justify-center items-end gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">₹0</span>
            <span className="text-xl text-gray-400 line-through mb-2">₹299</span>
            <span className="text-gray-500 mb-2">/ lifetime</span>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Unlimited College Predictions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Connect with IIT Seniors</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">AI Counseling Assistant</span>
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleGetStarted} 
            className="w-full text-lg h-12 bg-primary-blue hover:bg-blue-700 shadow-lg shadow-blue-500/30" 
            disabled={isPremium}
          >
            {isPremium ? (
                <>Already Subscribed <Check className="ml-2 h-4 w-4" /></>
            ) : (
                <>Claim Free Access <Sparkles className="ml-2 h-4 w-4" /></>
            )}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-3">No credit card required.</p>
        </CardContent>
      </Card>
    </div>
  );
}

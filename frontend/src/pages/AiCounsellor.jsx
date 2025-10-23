import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Link } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AiCounsellor() {
  const { userInfo } = useAuth();
  
  // Check if user is logged in AND is premium
  if (!userInfo || userInfo.subscription !== 'premium') {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <Star className="h-4 w-4" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            This feature is only for premium users.
            <Link to="/pricing"><Button>Upgrade to Premium</Button></Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // User is premium, show the placeholder page
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="p-10 border rounded-lg bg-white dark:bg-gray-950 shadow-lg">
        <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">AI Counsellor</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This feature is coming soon!
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Our AI will use your rank details to give you personalized college and branch advice.
        </p>
      </div>
    </div>
  );
}
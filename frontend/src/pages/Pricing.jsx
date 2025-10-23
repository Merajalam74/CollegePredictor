import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Check, AlertCircle } from 'lucide-react';
import api from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";

export default function Pricing() {
  const { userInfo, saveLogin } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    setError(null);
    if (!userInfo) {
      navigate('/login?redirect=pricing'); // Redirect to login if not signed in
      return;
    }
    
    setIsLoading(true);
    try {
      // This sends the protected request
      const { data } = await api.post('/payment/subscribe'); 
      saveLogin(data); // Update context with new user info (subscription: 'premium')
      alert('Subscription Successful! You are now a premium user.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Premium Plan</CardTitle>
          <CardDescription>One-time payment for full access.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center my-4">
            <span className="text-5xl font-bold">₹299</span>
            <span className="text-gray-500">/ one-time</span>
          </div>
          
          <ul className="space-y-3 my-6">
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Unlimited College Predictions</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Full Access to "Talk to Senior"</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Full Access to AI Counsellor</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Priority Support</span>
            </li>
          </ul>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSubscribe} className="w-full text-lg" size="lg" disabled={isLoading || userInfo?.subscription === 'premium'}>
            {isLoading ? "Processing..." : (userInfo?.subscription === 'premium' ? "Already Subscribed" : "Upgrade to Premium")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
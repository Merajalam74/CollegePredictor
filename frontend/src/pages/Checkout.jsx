import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card.jsx";
import { Separator } from "@/components/ui/Separator.jsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Loader2, ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { userInfo, saveLogin } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!userInfo) navigate('/login?redirect=checkout');
    if (userInfo?.subscription === 'premium') navigate('/');
  }, [userInfo, navigate]);

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/payment/subscribe'); 
      
      saveLogin(data); 
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto pt-20 px-4 text-center">
        <div className="mb-6 flex justify-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">You have successfully subscribed to the Premium Plan.</p>
        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Left Side: User Details */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Billing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <div className="p-3 bg-gray-50 border rounded-md text-gray-600">
                    {userInfo?.name || 'Student'}
                </div>
            </div>
            <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="p-3 bg-gray-50 border rounded-md text-gray-600">
                    {userInfo?.email || 'user@example.com'}
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-100">
                <ShieldCheck className="h-4 w-4" />
                <span>No payment method required for this transaction.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side: Order Summary */}
      <div className="md:col-span-1">
        <Card className="shadow-lg border-t-4 border-t-primary-blue">
          <CardHeader className="bg-gray-50/50 pb-4">
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            {/* Line Items */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Premium Plan (Lifetime)</span>
              <span className="font-medium">₹299.00</span>
            </div>
            
            <div className="flex justify-between text-sm text-green-600">
              <span>Launch Discount</span>
              <span>- ₹299.00</span>
            </div>

            <Separator className="my-2" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <div className="text-right">
                <span className="block font-bold text-2xl">₹0.00</span>
                <span className="text-xs text-gray-500">Includes GST</span>
              </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 bg-gray-50/50 pt-6">
            <Button 
                onClick={handleConfirmOrder} 
                className="w-full bg-black hover:bg-gray-800 text-white" 
                size="lg"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {isLoading ? "Processing..." : "Complete Order"}
            </Button>
            <p className="text-xs text-center text-gray-400">
                By clicking above, you agree to our Terms of Service.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

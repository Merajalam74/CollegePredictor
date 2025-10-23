import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Link, useNavigate } from 'react-router-dom'; // <-- Make sure useNavigate is imported
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { AlertCircle, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate(); // <-- Initialize the navigate function

  const handleChange = (e) => {
    // Ensure rank fields are sent as numbers
    const value = e.target.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // The signup function calls the backend and returns the response
      const data = await signup(formData);
      
      // *** THIS IS THE FIX ***
      // On success, navigate to the OTP page and pass the email along.
      navigate('/verify-email', { state: { email: data.email } });

    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"];

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            
            <hr />
            <p className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Mains Details (Optional)</p>
            <Input name="jee_mains_crl_rank" type="number" placeholder="JEE Mains CRL Rank" onChange={handleChange} />
            <Select name="jee_mains_category" onValueChange={handleSelectChange('jee_mains_category')}>
              <SelectTrigger><SelectValue placeholder="Select Mains Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={`mains-${cat}`} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name="jee_mains_category_rank" type="number" placeholder="Mains Category Rank" onChange={handleChange} />

            <hr />
            <p className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Advanced Details (Optional)</p>
            <Input name="jee_advanced_crl_rank" type="number" placeholder="JEE Advanced CRL Rank" onChange={handleChange} />
            <Select name="jee_advanced_category" onValueChange={handleSelectChange('jee_advanced_category')}>
              <SelectTrigger><SelectValue placeholder="Select Advanced Category" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={`advanced-${cat}`} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name="jee_advanced_category_rank" type="number" placeholder="Advanced Category Rank" onChange={handleChange} />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600 font-medium">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
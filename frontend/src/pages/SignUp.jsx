import React, { useState } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { AlertCircle, Loader2 } from 'lucide-react';
import { indianStates } from '../utils/constants'; 

export default function Signup() {
  
  const [mobileNumber, setMobileNumber] = useState("");
  const [formData, setFormData] = useState({
     pws: 'No' 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- NEW: Mobile input handler ---
  const handleMobileChange = (e) => {
    
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    
    const truncatedValue = numericValue.slice(0, 10);
    setMobileNumber(truncatedValue); 
    
    setFormData(prev => ({ ...prev, mobile: `+91${truncatedValue}` })); 
  };

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value === 'NONE' ? '' : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (mobileNumber.length !== 10) {
       setError("Mobile number must be exactly 10 digits.");
       setIsLoading(false);
       return;
    }

    try {
      const payload = {
        ...formData,
        
        pws: formData.pws === 'Yes',
        
        jee_mains_crl_rank: Number(formData.jee_mains_crl_rank) || undefined,
        jee_mains_category_rank: Number(formData.jee_mains_category_rank) || undefined,
        jee_advanced_crl_rank: Number(formData.jee_advanced_crl_rank) || undefined,
        jee_advanced_category_rank: Number(formData.jee_advanced_category_rank) || undefined,
      };
      
      const data = await signup(payload);
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
            {/* --- Basic Details --- */}
            <Input name="name" type="text" placeholder="Full Name" onChange={handleChange} required />
            <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            <Input name="password" type="password" placeholder="Password (min 6 chars)" onChange={handleChange} required />
            
            {/* --- NEW Mobile & State Fields --- */}
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                +91
              </span>
              <Input
                name="mobile"
                type="tel" 
                placeholder="10-digit Mobile Number"
                value={mobileNumber} 
                onChange={handleMobileChange} 
                className="rounded-l-none" 
                required
                pattern="[0-9]{10}" 
                title="Please enter exactly 10 digits"
              />
            </div>
            <Select name="addressState" onValueChange={handleSelectChange('addressState')} required>
              <SelectTrigger><SelectValue placeholder="Select Your State (Address) *" /></SelectTrigger>
              <SelectContent>
                {indianStates.map(state => <SelectItem key={`state-${state}`} value={state}>{state}</SelectItem>)}
              </SelectContent>
            </Select>

            <hr />
            <p className="font-medium text-center">Quota Details</p>
            {/* --- Quota Details (Home State) --- */}
            <Select name="home_state" onValueChange={handleSelectChange('home_state')} required>
                <SelectTrigger><SelectValue placeholder="Select Home State (for Quota) *" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="NONE">None / Other State</SelectItem>
                    {indianStates.map(state => <SelectItem key={`home-state-${state}`} value={state}>{state}</SelectItem>)}
                </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 pt-2">
                 <span className="text-sm font-medium">PwD Eligible?</span>
                 <Select name="pws" value={formData.pws} onValueChange={handleSelectChange('pws')}>
                    <SelectTrigger className="w-[100px] h-8"><SelectValue placeholder="No" /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                 </Select>
             </div>

            <hr />
            <p className="font-medium text-center">JEE Mains Details (Optional)</p>
            <Input name="jee_mains_crl_rank" type="number" placeholder="Mains CRL Rank" onChange={handleChange} />
            <Select name="jee_mains_category" onValueChange={handleSelectChange('jee_mains_category')}>
              <SelectTrigger><SelectValue placeholder="Select Mains Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                {categories.map(cat => <SelectItem key={`mains-cat-${cat}`} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name="jee_mains_category_rank" type="number" placeholder="Mains Category Rank" onChange={handleChange} />

            <hr />
            <p className="font-medium text-center">JEE Advanced Details (Optional)</p>
            <Input name="jee_advanced_crl_rank" type="number" placeholder="Advanced CRL Rank" onChange={handleChange} />
            <Select name="jee_advanced_category" onValueChange={handleSelectChange('jee_advanced_category')}>
              <SelectTrigger><SelectValue placeholder="Select Advanced Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                {categories.map(cat => <SelectItem key={`adv-cat-${cat}`} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input name="jee_advanced_category_rank" type="number" placeholder="Advanced Category Rank" onChange={handleChange} />

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


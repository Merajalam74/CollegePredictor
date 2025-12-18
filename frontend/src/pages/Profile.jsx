import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";
import { User, Crown, Edit, Loader2, AlertCircle, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';
import api from '../api/index.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog.jsx";
import { indianStates } from '../utils/constants.js'; // <-- *** THIS IS THE FIX ***

export default function Profile() {
  const { userInfo, saveLogin } = useAuth();
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageError, setPageError] = useState(null); // For errors outside dialog
  const [success, setSuccess] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- NEW State for Mobile Verification ---
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyError, setVerifyError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Pre-fill edit form when userInfo loads or dialog opens
  useEffect(() => {
    if (userInfo) {
      setEditData({
        name: userInfo.name || '',
        mobile: userInfo.mobile || '',
        addressState: userInfo.addressState || '',
        home_state: userInfo.home_state || '',
        pws: userInfo.jee_mains_pws || false,
        jee_mains_crl_rank: userInfo.jee_mains_crl_rank ?? '',
        jee_mains_category: userInfo.jee_mains_category ?? '',
        jee_mains_category_rank: userInfo.jee_mains_category_rank ?? '',
        jee_advanced_crl_rank: userInfo.jee_advanced_crl_rank ?? '',
        jee_advanced_category: userInfo.jee_advanced_category ?? '',
        jee_advanced_category_rank: userInfo.jee_advanced_category_rank ?? '',
      });
    }
  }, [userInfo, isEditOpen]); // Re-run if userInfo changes or dialog state changes

  // Redirect if not logged in
  if (!userInfo) {
    return <Navigate to="/login" />;
  }

  const isPremium = userInfo.subscription === 'premium';
  const categories = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"];

  const handleEditChange = (e) => {
    const value = e.target.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
    setEditData({ ...editData, [e.target.name]: value });
  };

  const handleEditSelectChange = (name) => (value) => {
    setEditData(prev => ({ ...prev, [name]: value === 'NONE' ? '' : value }));
  };

  // Handle Edit Profile Save
  const handleSaveChanges = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null); setSuccess(null); setPageError(null);
    try {
      const { data } = await api.put('/auth/profile', editData);
      saveLogin(data); // Update user info in context/localStorage with the response
      setSuccess("Profile updated successfully!");
      setIsEditOpen(false); // Close the dialog on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile."); // Show error inside dialog
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: Handle Send OTP ---
  const handleSendOtp = async () => {
    setIsSendingOtp(true); setVerifyError(null); setVerifySuccess(null);
    try {
      const { data } = await api.post('/auth/send-mobile-otp');
      setVerifySuccess(data.message); // e.g., "OTP sent..."
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };
  
  // --- NEW: Handle Verify OTP ---
  const handleVerifyOtp = async (e) => {
     e.preventDefault();
     setIsLoading(true); setVerifyError(null); setVerifySuccess(null);
     try {
       const { data } = await api.post('/auth/verify-mobile-otp', { otp });
       saveLogin(data); // Update context with new verified status
       setVerifySuccess("Mobile number verified successfully!");
       setIsVerifyOpen(false); // Close dialog
     } catch (err) {
       setVerifyError(err.response?.data?.message || "Verification failed.");
     } finally {
       setIsLoading(false);
     }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {success && (
        <Alert variant="success" className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
       {pageError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><User /> Your Details</span>
              {isPremium && <Crown className="h-5 w-5 text-yellow-500" title="Premium User"/>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email} {userInfo.isEmailVerified ? <span className="text-xs text-green-600">(Verified)</span> : <span className="text-xs text-red-600">(Not Verified)</span>}</p>
            <div className="flex items-center gap-2">
              <strong>Mobile:</strong> {userInfo.mobile || 'N/A'}
              {userInfo.isMobileVerified ? (
                 <span className="text-xs text-green-600">(Verified)</span>
              ) : (
                userInfo.mobile && (
                  // --- Verify Mobile Button/Dialog ---
                  <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-xs">Verify</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Verify Your Mobile Number</DialogTitle>
                        <DialogDescription>
                          We'll send a 6-digit OTP to {userInfo.mobile}. (Check your backend console for the test OTP).
                        </DialogDescription>
                      </DialogHeader>
                      {verifyError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{verifyError}</AlertDescription></Alert>}
                      {verifySuccess && <Alert variant="success"><CheckCircle2 className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{verifySuccess}</AlertDescription></Alert>}
                      
                      <Button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full mt-4">
                        {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                        Send OTP
                      </Button>

                      <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
                         <Input name="otp" type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                         <DialogFooter>
                           <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                           <Button type="submit" disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Verify & Save
                           </Button>
                         </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )
              )}
            </div>
            <p><strong>State:</strong> {userInfo.addressState || 'N/A'}</p>
            <p><strong>Subscription:</strong>
              <span className={`ml-2 font-medium ${isPremium ? 'text-green-600' : 'text-red-600'}`}>
                {userInfo.subscription}
              </span>
            </p>
            <p className="text-sm text-gray-500">Joined: {new Date(userInfo.createdAt).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Rank Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your Rank Profile
              {/* --- Edit Button Trigger & Dialog --- */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your details and ranks here. Click save when done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSaveChanges} className="space-y-4 py-4">
                     {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Update Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {/* --- Edit Basic Info --- */}
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">Basic Info</h4>
                     <Input name="name" type="text" placeholder="Full Name" value={editData.name ?? ''} onChange={handleEditChange} />
                     <Input name="mobile" type="tel" placeholder="Mobile Number" value={editData.mobile ?? ''} onChange={handleEditChange} />
                     <Select name="addressState" value={editData.addressState ?? ''} onValueChange={handleEditSelectChange('addressState')}>
                       <SelectTrigger><SelectValue placeholder="Select Your State (Address)" /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="NONE">None</SelectItem>
                         {indianStates.map(state => <SelectItem key={`edit-state-${state}`} value={state}>{state}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     
                    {/* --- Edit Quota Info --- */}
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">Quota Details</h4>
                     <Select name="home_state" value={editData.home_state ?? ''} onValueChange={handleEditSelectChange('home_state')}>
                       <SelectTrigger><SelectValue placeholder="Select Home State (for Quota)" /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="NONE">None / Other State</SelectItem>
                         {indianStates.map(state => <SelectItem key={`edit-home-${state}`} value={state}>{state}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     <div className="flex items-center space-x-2 pt-2">
                        <span className="text-sm font-medium">PwD Eligible?</span>
                        <Select name="pws" value={editData.pws ? 'Yes' : 'No'} onValueChange={(val) => setEditData(p => ({...p, pws: val === 'Yes'}))}>
                            <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                        </Select>
                     </div>

                    {/* --- Edit Rank Info --- */}
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Mains Details</h4>
                    <Input name="jee_mains_crl_rank" type="number" placeholder="Mains CRL Rank" value={editData.jee_mains_crl_rank ?? ''} onChange={handleEditChange} />
                    <Select name="jee_mains_category" value={editData.jee_mains_category ?? ''} onValueChange={handleEditSelectChange('jee_mains_category')}>
                      <SelectTrigger><SelectValue placeholder="Select Mains Category" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="NONE">None</SelectItem>
                        {categories.map(cat => <SelectItem key={`edit-mains-${cat}`} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input name="jee_mains_category_rank" type="number" placeholder="Mains Category Rank" value={editData.jee_mains_category_rank ?? ''} onChange={handleEditChange} />

                    <hr />
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Advanced Details</h4>
                    <Input name="jee_advanced_crl_rank" type="number" placeholder="Advanced CRL Rank" value={editData.jee_advanced_crl_rank ?? ''} onChange={handleEditChange} />
                    <Select name="jee_advanced_category" value={editData.jee_advanced_category ?? ''} onValueChange={handleEditSelectChange('jee_advanced_category')}>
                      <SelectTrigger><SelectValue placeholder="Select Advanced Category" /></SelectTrigger>
                      <SelectContent>
                         <SelectItem value="NONE">None</SelectItem>
                        {categories.map(cat => <SelectItem key={`edit-adv-${cat}`} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input name="jee_advanced_category_rank" type="number" placeholder="Advanced Category Rank" value={editData.jee_advanced_category_rank ?? ''} onChange={handleEditChange} />

                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                      <Button typeG="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Current Ranks */}
            <div>
              <h4 className="font-semibold">JEE Mains</h4>
              <p><strong>Home State:</strong> {userInfo.home_state || 'N/A'}</p>
              <p><strong>PwD:</strong> {userInfo.jee_mains_pws ? 'Yes' : 'No'}</p>
              <p><strong>CRL Rank:</strong> {userInfo.jee_mains_crl_rank?.toLocaleString() ?? 'N/A'}</p>
              <p><strong>Category:</strong> {userInfo.jee_mains_category ?? 'N/A'}</p>
              <p><strong>Category Rank:</strong> {userInfo.jee_mains_category_rank?.toLocaleString() ?? 'N/A'}</p>
            </div>
            <hr/>
            <div>
              <h4 className="font-semibold">JEE Advanced</h4>
              <p><strong>CRL Rank:</strong> {userInfo.jee_advanced_crl_rank?.toLocaleString() ?? 'N/A'}</p>
              <p><strong>Category:</strong> {userInfo.jee_advanced_category ?? 'N/A'}</p>
              <p><strong>Category Rank:</strong> {userInfo.jee_advanced_category_rank?.toLocaleString() ?? 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
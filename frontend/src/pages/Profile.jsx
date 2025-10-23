import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.jsx";
import { User, Crown, Edit, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export default function Profile() {
  const { userInfo, saveLogin } = useAuth(); // Use saveLogin to update context after edit
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Error for the edit dialog
  const [pageError, setPageError] = useState(null); // Error for the main page
  const [success, setSuccess] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Pre-fill edit form when userInfo loads or dialog opens
  useEffect(() => {
    if (userInfo) {
      setEditData({
        jee_mains_crl_rank: userInfo.jee_mains_crl_rank ?? '',
        jee_mains_category: userInfo.jee_mains_category ?? '',
        jee_mains_category_rank: userInfo.jee_mains_category_rank ?? '',
        jee_advanced_crl_rank: userInfo.jee_advanced_crl_rank ?? '',
        jee_advanced_category: userInfo.jee_advanced_category ?? '',
        jee_advanced_category_rank: userInfo.jee_advanced_category_rank ?? '',
      });
    }
  }, [userInfo, isDialogOpen]);

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
    // If user selects "NONE", set the state value to an empty string for the backend
    setEditData(prev => ({ ...prev, [name]: value === 'NONE' ? '' : value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setPageError(null);
    try {
      const { data } = await api.put('/auth/profile', editData);
      saveLogin(data);
      setSuccess("Profile updated successfully!");
      setIsDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
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
            <p><strong>Email:</strong> {userInfo.email}</p>
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Ranks</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Edit Rank Profile</DialogTitle>
                    <DialogDescription>
                      Update your JEE Mains and Advanced rank details here. Click save when done.
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
                    {/* JEE Mains Edit Fields */}
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Mains Details</h4>
                    <Input name="jee_mains_crl_rank" type="number" placeholder="Mains CRL Rank" value={editData.jee_mains_crl_rank ?? ''} onChange={handleEditChange} />
                    <Select name="jee_mains_category" value={editData.jee_mains_category ?? ''} onValueChange={handleEditSelectChange('jee_mains_category')}>
                      <SelectTrigger><SelectValue placeholder="Select Mains Category" /></SelectTrigger>
                      <SelectContent>
                         {/* *** FIX: Changed value from "" to "NONE" *** */}
                         <SelectItem value="NONE">None</SelectItem>
                        {categories.map(cat => <SelectItem key={`edit-mains-${cat}`} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input name="jee_mains_category_rank" type="number" placeholder="Mains Category Rank" value={editData.jee_mains_category_rank ?? ''} onChange={handleEditChange} />

                    <hr />
                    {/* JEE Advanced Edit Fields */}
                    <h4 className="font-medium text-center text-gray-700 dark:text-gray-300">JEE Advanced Details</h4>
                    <Input name="jee_advanced_crl_rank" type="number" placeholder="Advanced CRL Rank" value={editData.jee_advanced_crl_rank ?? ''} onChange={handleEditChange} />
                    <Select name="jee_advanced_category" value={editData.jee_advanced_category ?? ''} onValueChange={handleEditSelectChange('jee_advanced_category')}>
                      <SelectTrigger><SelectValue placeholder="Select Advanced Category" /></SelectTrigger>
                      <SelectContent>
                         {/* *** FIX: Changed value from "" to "NONE" *** */}
                         <SelectItem value="NONE">None</SelectItem>
                        {categories.map(cat => <SelectItem key={`edit-adv-${cat}`} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input name="jee_advanced_category_rank" type="number" placeholder="Advanced Category Rank" value={editData.jee_advanced_category_rank ?? ''} onChange={handleEditChange} />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isLoading}>
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
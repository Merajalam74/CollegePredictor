import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card.jsx";
import { ResultCard } from '@/components/ResultCard.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { Loader2, Search, AlertCircle, CheckCircle2, Info, ChevronsUpDown, Check, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command.jsx";
import { cn } from "@/lib/utils.js";
import api from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';


export default function JeeAdvanced() {
  const { userInfo } = useAuth();

  // Initialize state
  const [formData, setFormData] = useState({
    student_category: userInfo?.jee_advanced_category || '',
    category_rank: userInfo?.jee_advanced_category_rank || undefined,
    crl_rank: userInfo?.jee_advanced_crl_rank || undefined,
    gender: 'Male',
    pws: false, 
    branch: [],
    limit: 100
  });

  // UI States
  const [allBranches, setAllBranches] = useState([]);
  const [openFormBranchPopover, setOpenFormBranchPopover] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultLimit, setResultLimit] = useState(100);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterBranches, setSelectedFilterBranches] = useState([]);
  const [openFilterBranchPopover, setOpenFilterBranchPopover] = useState(false);

  // Effect to auto-apply user ranks
  useEffect(() => {
    if (userInfo) {
      setFormData(prevData => ({
        ...prevData,
        student_category: userInfo.jee_advanced_category || prevData.student_category || '',
        category_rank: userInfo.jee_advanced_category_rank || prevData.category_rank,
        crl_rank: userInfo.jee_advanced_crl_rank || prevData.crl_rank,
        branch: prevData.branch || [],
      }));
    }
  }, [userInfo]);

  // Effect to fetch branch list
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('api/data/branches');
        
        setAllBranches(response.data || []);
      } catch (err) { console.error("Failed to fetch branches:", err); }
    };
    fetchBranches();
  }, []);

  // Static options
  const categories = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"]; 
  const genders = ["Male", "Female"];
  const limitOptions = [100, 200, 500];

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isRankField = name.includes('_rank');
    setFormData(prev => ({ ...prev, [name]: isRankField ? (value === '' ? undefined : Number(value)) : value }));
  };
  const handleSelectChange = (name) => (value) => {
     if (name === 'student_category' && value === 'OPEN') {
        setFormData(prev => ({ ...prev, student_category: value, category_rank: undefined }));
     } else {
        setFormData(prev => ({ ...prev, [name]: value }));
     }
  };
  const handleBranchSelect = (branch) => {
    setFormData(prev => {
      const currentBranches = prev.branch || [];
      const newBranches = currentBranches.includes(branch) ? currentBranches.filter(b => b !== branch) : [...currentBranches, branch];
      return { ...prev, branch: newBranches };
    });
  };
  const handleLimitChange = (value) => {
    const newLimit = Number(value);
    setResultLimit(newLimit);
    setFormData(prev => ({ ...prev, limit: newLimit }));
  };
  const handlePwSToggle = (value) => {
     setFormData(prev => ({ ...prev, pws: value === 'Yes' }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null); setResults([]); setIsSubmitted(false);
    setSearchTerm(""); setSelectedFilterBranches([]);

    const categoryRankToSend = (formData.student_category === 'OPEN' || !formData.student_category) ? undefined : formData.category_rank;
    const payload = { ...formData, category_rank: categoryRankToSend };

    try {
      const response = await api.post('api/data/predict/advanced', payload);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch (err) { setError(err.response?.data?.error || "Failed to fetch results."); console.error(err); }
    finally { setIsLoading(false); setIsSubmitted(true); }
  };

  // --- Filtering Logic ---
  const uniqueBranchesInResults = useMemo(() => Array.isArray(results) ? [...new Set(results.map(r => r.Branch).filter(Boolean))].sort() : [], [results]);

  const filteredResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return results.filter(result => {
      if (searchTerm && !(result.Institute?.toLowerCase() || '').includes(searchTerm.toLowerCase())) return false;
      if (selectedFilterBranches.length > 0 && !selectedFilterBranches.includes(result.Branch)) return false;
      return true;
    });
  }, [results, searchTerm, selectedFilterBranches]);

  const displayedFilteredResults = Array.isArray(filteredResults) ? filteredResults.slice(0, resultLimit) : [];

  // --- Filter Bar Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleResetFilters = () => { setSearchTerm(""); setSelectedFilterBranches([]); };
  const handleFilterBranchSelect = (branch) => {
    setSelectedFilterBranches(prev => {
        const currentSelection = prev || [];
        const newSelection = currentSelection.includes(branch) ? currentSelection.filter(b => b !== branch) : [...currentSelection, branch];
        return newSelection;
    });
  };

  // --- Other derived state ---
  const isCategorySelected = formData.student_category && formData.student_category !== 'OPEN';

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">🚀 JEE Advanced Predictor</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Enter your rank details to find eligible **IITs**. Your saved ranks are pre-filled if logged in.
      </p>

      {/* --- Form Section --- */}
      <Card className="mb-8 shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category, Ranks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select name="student_category" value={formData.student_category} onValueChange={handleSelectChange('student_category')} required>
                <SelectTrigger id="adv-category-select"><SelectValue placeholder="Select Category *" /></SelectTrigger>
                <SelectContent> {categories.map(cat => <SelectItem key={`adv-cat-${cat}`} value={cat}>{cat}</SelectItem>)} </SelectContent>
              </Select>
              
              {/* --- CONDITIONAL RENDER FIX --- */}
              {isCategorySelected ? (
                <Input id="adv-category-rank" type="number" name="category_rank" placeholder="Category Rank *" value={formData.category_rank ?? ''} onChange={handleInputChange} min={1} required={isCategorySelected}/>
              ) : (
                <div className="h-[40px] hidden md:block" aria-hidden="true"></div> 
              )}
              

              <Input id="adv-crl-rank" type="number" name="crl_rank" placeholder="CRL Rank *" value={formData.crl_rank ?? ''} onChange={handleInputChange} min={1} required />
            </div>

            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="gender" value={formData.gender} onValueChange={handleSelectChange('gender')} required>
                <SelectTrigger id="adv-gender-select"><SelectValue placeholder="Select Gender *" /></SelectTrigger>
                <SelectContent> {genders.map(gen => <SelectItem key={`adv-gen-${gen}`} value={gen}>{gen}</SelectItem>)} </SelectContent>
              </Select>
              <div className="flex items-center space-x-2 pt-2 md:pt-0 md:justify-self-start">
                 <span className="text-sm font-medium">PwD Eligible?</span>
                 <Select name="pws" value={formData.pws ? 'Yes' : 'No'} onValueChange={handlePwSToggle}>
                    <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                 </Select>
               </div>
            </div>

            {/* Branch Multi-Select (Form) */}
            <Popover open={openFormBranchPopover} onOpenChange={setOpenFormBranchPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={openFormBranchPopover} className="w-full justify-between font-normal">
                  {(formData.branch || []).length > 0 ? `${(formData.branch || []).length} branch(es) selected` : "Select branches... (Optional)"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                <Command>
                  <CommandInput placeholder="Search branch..." />
                  <CommandList><CommandEmpty>No branch found.</CommandEmpty><CommandGroup>
                    {allBranches.map((branch) => (
                      <CommandItem key={`adv-branch-${branch}`} value={branch} onSelect={() => handleBranchSelect(branch)}>
                        <Check className={cn("mr-2 h-4 w-4", (formData.branch || []).includes(branch) ? "opacity-10t" : "opacity-0")} />{branch}
                      </CommandItem>
                    ))}
                  </CommandGroup></CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Result Limit Select */}
            <div className="flex justify-end pt-2">
              <Select onValueChange={handleLimitChange} defaultValue={resultLimit.toString()}>
                <SelectTrigger className="w-full md:w-[180px]"> <SelectValue placeholder="Show results..." /> </SelectTrigger>
                <SelectContent> {limitOptions.map(limit => (<SelectItem key={`adv-limit-${limit}`} value={limit.toString()}> Show Top {limit} </SelectItem>))} </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Finding IITs..." : "Find Eligible IITs"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Results Section --- */}
      {isSubmitted && !isLoading && (
        <div className="mt-12">
           {error && ( <Alert variant="destructive" className="mb-6"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}

          {results.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your predicted colleges</h2>
              {/* Filter Bar */}
              <div className="flex flex-wrap gap-4 items-center mb-6 mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
                 <div className="relative flex-grow sm:flex-grow-0 sm:w-64"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> <Input type="search" placeholder="Search IITs..." className="pl-9 h-9" value={searchTerm} onChange={handleSearchChange}/> </div>
                 <Button variant="outline" size="sm" onClick={handleResetFilters} className="h-9"><RefreshCw className="mr-2 h-3 w-3"/> Reset Filters</Button>
                 <Popover open={openFilterBranchPopover} onOpenChange={setOpenFilterBranchPopover}>
                   <PopoverTrigger asChild>
                     <Button variant="outline" role="combobox" aria-expanded={openFilterBranchPopover} className="w-full sm:w-[200px] h-9 text-sm justify-between font-normal">
                       {(selectedFilterBranches || []).length > 0 ? `${(selectedFilterBranches || []).length} Branch(es) Selected` : "Select branches..."}
                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0"> <Command> <CommandInput placeholder="Search branch filter..." /> <CommandList><CommandEmpty>No branch found.</CommandEmpty><CommandGroup> {uniqueBranchesInResults.map((branch) => ( <CommandItem key={`filter-adv-branch-${branch}`} value={branch} onSelect={() => handleFilterBranchSelect(branch)}> <Check className={cn("mr-2 h-4 w-4", (selectedFilterBranches || []).includes(branch) ? "opacity-100" : "opacity-0")} />{branch} </CommandItem> ))} </CommandGroup></CommandList> </Command> </PopoverContent>
                 </Popover>
              </div>

              {/* Results Count and Grid */}
              {displayedFilteredResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"> Showing {displayedFilteredResults.length} of {filteredResults.length} matching IITs. (Max {resultLimit} displayed) </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedFilteredResults.map((result, index) => ( <ResultCard key={`adv-result-${result._id || index}`} result={result} /> ))}
                  </div>
                </>
              ) : ( <Alert className="mt-6"> <Info className="h-4 w-4" /> <AlertTitle>No Matching Colleges Found</AlertTitle> <AlertDescription>No IITs matched your current filters. Try resetting filters.</AlertDescription> </Alert> )}

              {/* CTA */}
              <Card className="mt-12 p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"> <CardTitle className="text-xl mb-2">Want personalized guidance?</CardTitle> <CardDescription className="mb-4">Book a session with a senior from your dream IIT.</CardDescription> <Link to="/talk-to-senior"><Button className="bg-primary-blue hover:bg-blue-700 text-white">Browse Mentors</Button></Link> </Card>
            </>
          ) : (
            !error && ( <Alert className="mt-12"> <Info className="h-4 w-4" /> <AlertTitle>No Results Found</AlertTitle> <AlertDescription>No IITs matched your criteria. Try adjusting inputs.</AlertDescription> </Alert> )
          )}
        </div>
      )}
    </div>
  );
}


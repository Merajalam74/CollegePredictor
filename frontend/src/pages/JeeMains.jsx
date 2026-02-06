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
import CounselingSelector from '../components/CounselingSelector.jsx';
import { Link } from 'react-router-dom';
import { indianStates } from '../utils/constants.js'; 

const COUNSELING_TYPES = ["JOSAA", "CSAB"];
const DEFAULT_COUNSELING = "JOSAA";

export default function JeeMains() {
  const { userInfo } = useAuth();

  
  const [resultsData, setResultsData] = useState({ JOSAA: [], CSAB: [] });
  
  const [displayedCounseling, setDisplayedCounseling] = useState(DEFAULT_COUNSELING);

  
  const [formData, setFormData] = useState({
    selectedFormCounselings: [],
    student_category: userInfo?.jee_mains_category || '',
    category_rank: userInfo?.jee_mains_category_rank || undefined,
    crl_rank: userInfo?.jee_mains_crl_rank || undefined,
    gender: 'Male',
    home_state: userInfo?.home_state || '', 
    pws: userInfo?.jee_mains_pws || false,
    branch: [],
    limit: 100
  });

  // Other UI states
  const [allBranches, setAllBranches] = useState([]);
  const [openBranchPopover, setOpenBranchPopover] = useState(false); 
  const [openCounselingPopover, setOpenCounselingPopover] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultLimit, setResultLimit] = useState(100); 

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollegeTypes, setSelectedCollegeTypes] = useState([]);
  const [selectedFilterBranches, setSelectedFilterBranches] = useState([]);
  const [openFilterBranchPopover, setOpenFilterBranchPopover] = useState(false); 

  
  useEffect(() => {
    if (userInfo) {
      setFormData(prevData => ({
        ...prevData,
        selectedFormCounselings: prevData.selectedFormCounselings || [],
        student_category: userInfo.jee_mains_category || prevData.student_category || '',
        category_rank: userInfo.jee_mains_category_rank || prevData.category_rank,
        crl_rank: userInfo.jee_mains_crl_rank || prevData.crl_rank,
        home_state: userInfo.home_state || prevData.home_state || '', 
        pws: userInfo.jee_mains_pws ?? prevData.pws ?? false,
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

  // --- Input Handlers ---
  const handleInputChange = (e) => {
     const { name, value } = e.target;
     const isRankField = name.includes('_rank');
     setFormData(prev => ({ ...prev, [name]: isRankField ? (value === '' ? undefined : Number(value)) : value, }));
  };
  const handleSelectChange = (name) => (value) => {
     if (name === 'student_category' && value === 'OPEN') {
        setFormData(prev => ({ ...prev, student_category: value, category_rank: undefined }));
     } else {
        setFormData(prev => ({ ...prev, [name]: value === 'NONE' ? '' : value }));
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
  const handleCounselingFormSelect = (counselingType) => {
     setFormData(prev => {
       const currentSelection = prev.selectedFormCounselings || [];
       const newSelection = currentSelection.includes(counselingType) ? currentSelection.filter(c => c !== counselingType) : [...currentSelection, counselingType];
       return { ...prev, selectedFormCounselings: newSelection };
     });
  };

  // --- Form Submission (FIXED) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    setResultsData({ JOSAA: [], CSAB: [] }); setIsSubmitted(false);
    setDisplayedCounseling(DEFAULT_COUNSELING);
    setSearchTerm(""); setSelectedCollegeTypes([]); setSelectedFilterBranches([]);

    const currentSelectedCounselings = formData.selectedFormCounselings || [];
    const counselingsToFetch = currentSelectedCounselings.length > 0 ? currentSelectedCounselings : ["JOSAA", "CSAB"];
    const categoryRankToSend = (formData.student_category === 'OPEN' || !formData.student_category) ? undefined : formData.category_rank;
    const isCategoryUser = formData.student_category && formData.student_category !== 'OPEN';

    // 1. Safety Check: If Category User, ensure Rank is provided for JOSAA
    if (currentSelectedCounselings.includes('JOSAA') && isCategoryUser && !formData.category_rank) {
      setError("Please enter your Category Rank to predict JOSAA results.");
      setIsLoading(false);
      return;
    }

    const basePayload = {
        student_category: formData.student_category || null,
        gender: formData.gender,
        home_state: formData.home_state || null,
        branch: formData.branch || [],
        limit: formData.limit || 100,
        pws: formData.pws || false,
        category_rank: isCategoryUser ? Number(formData.category_rank) : undefined, 
        crl_rank: Number(formData.crl_rank), 
    };

    const requests = counselingsToFetch.map(type =>
      api.post('api/data/predict/mains', { ...basePayload, counseling_type: type })
    );

     try {
       const responses = await Promise.allSettled(requests);
       let firstAvailableType = DEFAULT_COUNSELING; let foundFirst = false; 
       const newResultsData = { JOSAA: [], CSAB: [] };

       responses.forEach((response, index) => {
         const counselingType = counselingsToFetch[index];
         
         const responseData = response.status === 'fulfilled' && Array.isArray(response.value?.data) ? response.value.data : [];
         
         if (counselingType === 'JOSAA') newResultsData.JOSAA = responseData;
         if (counselingType === 'CSAB') newResultsData.CSAB = responseData;

         if (responseData.length > 0 && !foundFirst) {
            firstAvailableType = counselingType;
            foundFirst = true;
         }
         if (response.status === 'rejected') {
           console.error(`[Submit] Failed fetch for ${counselingType}:`, response.reason);
           const errorMsg = response.reason?.response?.data?.error || `Failed to fetch ${counselingType} results.`;
           setError(prev => `${prev ? prev + '; ' : ''}${errorMsg}`);
         }
       });

       setResultsData(newResultsData);
       setDisplayedCounseling(firstAvailableType);

     } catch (err) {
       console.error("[Submit] CRITICAL Error processing fetch results:", err);
       setError("An unexpected error occurred while processing results.");
     } finally {
       setIsLoading(false);
       setIsSubmitted(true);
     }
  };

  // --- Filtering Logic ---
  const currentRawResults = useMemo(() => {
      return resultsData[displayedCounseling] || [];
  }, [resultsData, displayedCounseling]);

  const uniqueCollegeTypesInResults = useMemo(() => Array.isArray(currentRawResults) ? [...new Set(currentRawResults.map(r => r.InstituteType).filter(Boolean))].sort() : [], [currentRawResults]);
  const uniqueBranchesInResults = useMemo(() => Array.isArray(currentRawResults) ? [...new Set(currentRawResults.map(r => r.Branch).filter(Boolean))].sort() : [], [currentRawResults]);

  const filteredResults = useMemo(() => {
    if (!Array.isArray(currentRawResults)) return [];
    return currentRawResults.filter(result => {
      const instituteMatch = searchTerm ? (result.Institute?.toLowerCase() || '').includes(searchTerm.toLowerCase()) : true;
      const typeMatch = selectedCollegeTypes.length > 0 ? selectedCollegeTypes.includes(result.InstituteType) : true;
      const branchMatch = selectedFilterBranches.length > 0 ? selectedFilterBranches.includes(result.Branch) : true;
      return instituteMatch && typeMatch && branchMatch;
    });
  }, [currentRawResults, searchTerm, selectedCollegeTypes, selectedFilterBranches]);

  const displayedFilteredResults = Array.isArray(filteredResults) ? filteredResults.slice(0, resultLimit) : [];

  // --- Filter Bar Handlers ---
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleResetFilters = () => { setSearchTerm(""); setSelectedCollegeTypes([]); setSelectedFilterBranches([]); };
  const handleCollegeTypeChange = (value) => { setSelectedCollegeTypes(value === "ALL" ? [] : [value]); };
  const handleFilterBranchSelect = (branch) => {
    setSelectedFilterBranches(prev => {
        const currentSelection = prev || [];
        const newSelection = currentSelection.includes(branch) ? currentSelection.filter(b => b !== branch) : [...currentSelection, branch];
        return newSelection;
    });
  };

  
  const availableCounselingResults = Object.keys(resultsData).filter(key => Array.isArray(resultsData[key]) && resultsData[key].length > 0);
  const isCategorySelected = formData.student_category && formData.student_category !== 'OPEN';


  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">🎓 JEE Mains Predictor</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select counseling types, enter ranks, and find eligible colleges. Fetches JOSAA & CSAB by default.
      </p>

      {/* --- Form Section --- */}
      <Card className="mb-8 shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Counseling Type Multi-Select */}
            <Popover open={openCounselingPopover} onOpenChange={setOpenCounselingPopover}>
              <PopoverTrigger asChild>
                 <Button variant="outline" role="combobox" aria-expanded={openCounselingPopover} className="w-full justify-between font-normal">
                   {(formData.selectedFormCounselings || []).length > 0 ? `${(formData.selectedFormCounselings || []).length} Type(s) Selected` : "Select Counseling Types (Default: All)"}
                   <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                 </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                 <Command>
                   <CommandInput placeholder="Search type..." />
                   <CommandList><CommandEmpty>No type found.</CommandEmpty><CommandGroup>
                     {COUNSELING_TYPES.map((counselingType) => (
                       <CommandItem key={`form-counseling-${counselingType}`} value={counselingType} onSelect={() => handleCounselingFormSelect(counselingType)}>
                         <Check className={cn("mr-2 h-4 w-4", (formData.selectedFormCounselings || []).includes(counselingType) ? "opacity-100" : "opacity-0")} />{counselingType}
                       </CommandItem>
                     ))}
                   </CommandGroup></CommandList>
                 </Command>
              </PopoverContent>
            </Popover>

            
            <Select name="home_state" value={formData.home_state} onValueChange={handleSelectChange('home_state')} required>
                <SelectTrigger id="home-state-select"><SelectValue placeholder="Select Home State *" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None / Other State</SelectItem>
                  {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                </SelectContent>
            </Select>

            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Select name="student_category" value={formData.student_category} onValueChange={handleSelectChange('student_category')} required>
                 <SelectTrigger id="mains-category-select"><SelectValue placeholder="Select Category *" /></SelectTrigger>
                 <SelectContent>
                   {categories.map(cat => <SelectItem key={`mains-cat-${cat}`} value={cat}>{cat}</SelectItem>)}
                 </SelectContent>
               </Select>
               
              
               {isCategorySelected ? (
                  <Input id="mains-category-rank" type="number" name="category_rank" placeholder="Category Rank *" value={formData.category_rank ?? ''} onChange={handleInputChange} min={1} required={isCategorySelected}/>
               ) : (
                  <div className="h-[40px] hidden md:block" aria-hidden="true"></div>
               )}
               
               
               <Input id="mains-crl-rank" type="number" name="crl_rank" placeholder="CRL Rank *" value={formData.crl_rank ?? ''} onChange={handleInputChange} min={1} required />
            </div>

             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Select name="gender" value={formData.gender} onValueChange={handleSelectChange('gender')} required>
                  <SelectTrigger id="mains-gender-select"><SelectValue placeholder="Select Gender *" /></SelectTrigger>
                  <SelectContent>
                    {genders.map(gen => <SelectItem key={`mains-gen-${gen}`} value={gen}>{gen}</SelectItem>)}
                  </SelectContent>
               </Select>
               <div className="flex items-center space-x-2 pt-2 md:pt-0 md:justify-self-start">
                 <span className="text-sm font-medium">PwD Eligible?</span>
                 <Select name="pws" value={formData.pws ? 'Yes' : 'No'} onValueChange={handlePwSToggle}>
                    <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
             </div>

            
            <Popover open={openBranchPopover} onOpenChange={setOpenBranchPopover}>
               <PopoverTrigger asChild>
                 <Button variant="outline" role="combobox" aria-expanded={openBranchPopover} className="w-full justify-between font-normal">
                   {(formData.branch || []).length > 0 ? `${(formData.branch || []).length} branch(es) selected` : "Select branches... (Optional)"}
                   <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                 <Command>
                   <CommandInput placeholder="Search branch..." />
                   <CommandList><CommandEmpty>No branch found.</CommandEmpty><CommandGroup>
                     {allBranches.map((branch) => (
                       <CommandItem key={`mains-branch-${branch}`} value={branch} onSelect={() => handleBranchSelect(branch)}>
                         <Check className={cn("mr-2 h-4 w-4", (formData.branch || []).includes(branch) ? "opacity-100" : "opacity-0")} />
                         {branch}
                       </CommandItem>
                     ))}
                   </CommandGroup></CommandList>
                 </Command>
               </PopoverContent>
            </Popover>

         
            <div className="flex justify-end pt-2">
                 <Select onValueChange={handleLimitChange} defaultValue={resultLimit.toString()}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Show results..." />
                    </SelectTrigger>
                    <SelectContent>
                      {limitOptions.map(limit => (<SelectItem key={`mains-limit-${limit}`} value={limit.toString()}> Show Top {limit} </SelectItem>))}
                    </SelectContent>
                 </Select>
            </div>

            
            <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 {isLoading ? "Finding Colleges..." : "Find Eligible Colleges"}
            </Button>
          </form>
        </CardContent>
      </Card>

     
      {isSubmitted && !isLoading && (
        <div className="mt-12">
           {error && ( <Alert variant="destructive" className="mb-6"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}

          {availableCounselingResults.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your predicted colleges</h2>
              <CounselingSelector selectedCounseling={displayedCounseling} onSelectCounseling={setDisplayedCounseling} availableCounselings={availableCounselingResults} />
              <div className="flex flex-wrap gap-4 items-center mb-6 mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
                 <div className="relative flex-grow sm:flex-grow-0 sm:w-64"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /> <Input type="search" placeholder="Search Institutes..." className="pl-9 h-9" value={searchTerm} onChange={handleSearchChange}/> </div>
                 <Button variant="outline" size="sm" onClick={handleResetFilters} className="h-9"><RefreshCw className="mr-2 h-3 w-3"/> Reset Filters</Button>
                 <Select onValueChange={handleCollegeTypeChange} value={selectedCollegeTypes.length === 1 ? selectedCollegeTypes[0] : "ALL"}> <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm"><SelectValue placeholder="College Type" /></SelectTrigger> <SelectContent><SelectItem value="ALL">All Types</SelectItem> {uniqueCollegeTypesInResults.map(type => ( <SelectItem key={`type-${type}`} value={type}>{type}</SelectItem> ))} </SelectContent> </Select>
                 <Popover open={openFilterBranchPopover} onOpenChange={setOpenFilterBranchPopover}>
                   <PopoverTrigger asChild>
                     <Button variant="outline" role="combobox" aria-expanded={openFilterBranchPopover} className="w-full sm:w-[200px] h-9 text-sm justify-between font-normal">
                       {(selectedFilterBranches || []).length > 0 ? `${(selectedFilterBranches || []).length} Branch(es) Selected` : "Select branches..."}
                       <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0"> <Command> <CommandInput placeholder="Search branch filter..." /> <CommandList><CommandEmpty>No branch found.</CommandEmpty><CommandGroup> {uniqueBranchesInResults.map((branch) => ( <CommandItem key={`filter-branch-${branch}`} value={branch} onSelect={() => handleFilterBranchSelect(branch)}> <Check className={cn("mr-2 h-4 w-4", (selectedFilterBranches || []).includes(branch) ? "opacity-100" : "opacity-0")} />{branch} </CommandItem> ))} </CommandGroup></CommandList> </Command> </PopoverContent>
                 </Popover>
              </div>

              {displayedFilteredResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"> Showing {displayedFilteredResults.length} of {filteredResults.length} matching colleges for {displayedCounseling}. (Max {resultLimit} displayed) </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedFilteredResults.map((result, index) => ( <ResultCard key={`${displayedCounseling}-result-${result._id || index}`} result={result} /> ))}
                  </div>
                </>
              ) : (
                 <Alert className="mt-6"> <Info className="h-4 w-4" /> <AlertTitle>No Matching Colleges Found</AlertTitle> <AlertDescription>No colleges matched your current filters for {displayedCounseling}. Try resetting filters.</AlertDescription> </Alert>
               )}
              <Card className="mt-12 p-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900"> <CardTitle className="text-xl mb-2">Want personalized guidance?</CardTitle> <CardDescription className="mb-4">Upgrade to premium for mentorship and AI counseling.</CardDescription> <Link to="/pricing"><Button className="bg-primary-blue hover:bg-blue-700 text-white">Unlock Premium</Button></Link> </Card>
            </>
          ) : (
            !error && ( <Alert className="mt-12"> <Info className="h-4 w-4" /> <AlertTitle>No Results Found</AlertTitle> <AlertDescription>No colleges matched your criteria for the selected counseling types.</AlertDescription> </Alert> )
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react' // <-- Import useEffect
import axios from 'axios'
import { Button } from "@/components/ui/button.jsx"
import { Input } from "@/components/ui/input.jsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx"
import { Card, CardContent } from "@/components/ui/card.jsx"
import { ResultCard } from '@/components/ResultCard.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx"
import { Loader2, Search, AlertCircle, CheckCircle2, Info, ChevronsUpDown, Check } from 'lucide-react'

// --- NEW IMPORTS ---
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command.jsx"
import { cn } from "@/lib/utils"

const API_BASE_URL = "http://localhost:4000"

export default function JeeAdvanced() {
  const [formData, setFormData] = useState({
    gender: 'Male',
    branch: [], // <-- This will now be populated
  });

  const [allBranches, setAllBranches] = useState([]); // <-- NEW: State for all branches
  const [openPopover, setOpenPopover] = useState(false); // <-- NEW: State for popover

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- NEW: Fetch branches when component loads ---
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/branches`);
        setAllBranches(response.data);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    fetchBranches();
  }, []); // Empty array means this runs once on mount

  const categories = ["OPEN", "EWS", "OBC-NCL", "SC", "ST"];
  const genders = ["Male", "Female"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : Number(value),
    }));
  };

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBranchSelect = (branch) => {
    setFormData(prev => {
      const currentBranches = prev.branch || [];
      const newBranches = currentBranches.includes(branch)
        ? currentBranches.filter(b => b !== branch) // Deselect
        : [...currentBranches, branch]; // Select
      return { ...prev, branch: newBranches };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setIsSubmitted(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/predict/advanced`, formData);
      setResults(response.data);
    } catch (err) {
      setError("Failed to fetch results. Please ensure the backend server is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">🚀 JEE Advanced Predictor</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Enter your rank details to find eligible **IITs**.
      </p>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select name="student_category" onValueChange={handleSelectChange('student_category')} required>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" name="category_rank" placeholder="Category Rank" onChange={handleInputChange} min={1} required />
              <Input type="number" name="crl_rank" placeholder="CRL Rank" onChange={handleInputChange} min={1} required />
            </div>
            
            <Select name="gender" onValueChange={handleSelectChange('gender')} defaultValue="Male" required>
              <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
              <SelectContent>
                {genders.map(gen => <SelectItem key={gen} value={gen}>{gen}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* --- NEW BRANCH MULTI-SELECT --- */}
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover}
                  className="w-full justify-between"
                >
                  {formData.branch.length > 0
                    ? `${formData.branch.length} branch(es) selected`
                    : "Select preferred branches..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search branch..." />
                  <CommandList>
                    <CommandEmpty>No branch found.</CommandEmpty>
                    <CommandGroup>
                      {allBranches.map((branch) => (
                        <CommandItem
                          key={branch}
                          value={branch}
                          onSelect={() => handleBranchSelect(branch)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              (formData.branch || []).includes(branch)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {branch}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Finding IITs..." : "Find Eligible IITs"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Results Section (No changes here) --- */}
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && isSubmitted && results.length > 0 && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Found {results.length > 100 ? "the top 100" : results.length} eligible college seats.</AlertDescription>
          </Alert>
        )}
        {!isLoading && isSubmitted && results.length === 0 && !error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Results Found</AlertTitle>
            <AlertDescription>No IITs matched your criteria with the given rank margins. Try adjusting your inputs.</AlertDescription>
          </Alert>
        )}
        
        {results.map((result, index) => (
          <ResultCard 
            key={`${result.Institute}-${result.Branch}-${index}`} 
            result={result} 
            userRank={(result.Category || '').toUpperCase() === 'OPEN' ? formData.crl_rank : formData.category_rank} 
          />
        ))}
      </div>
    </div>
  )
}
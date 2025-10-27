
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Loader2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { stocksApi } from '@/services/api';

interface NavbarProps {
  className?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region?: string;
  currency?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setShowResults(recentSearches.length > 0);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await stocksApi.searchStocks(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, recentSearches.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query ? results : recentSearches;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < items.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(items[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Add to recent searches
    const updated = [result, ...recentSearches.filter(r => r.symbol !== result.symbol)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    // Navigate to stocks page
    navigate('/stocks');
    
    // Close results
    setShowResults(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const displayResults = query ? results : recentSearches;

  return (
    <header className={cn("bg-background/95 backdrop-blur-sm sticky top-0 z-30 border-b", className)}>
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2 lg:gap-4">
          <h1 className="text-lg font-semibold tracking-tight lg:text-xl">MarketPulse</h1>
          
          <div className="relative hidden md:block">
            <div className="relative flex items-center h-9 rounded-md px-3 text-muted-foreground focus-within:text-foreground bg-muted/50">
              <Search className="h-4 w-4 mr-2" />
              <Input 
                ref={inputRef}
                type="search" 
                placeholder="Search stocks, indices..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  if (results.length > 0 || recentSearches.length > 0) {
                    setShowResults(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on results
                  setTimeout(() => setShowResults(false), 200);
                }}
                onKeyDown={handleKeyDown}
                className="h-9 w-[200px] lg:w-[280px] bg-transparent border-none px-0 py-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </div>
            
            {/* Search results dropdown */}
            {showResults && (displayResults.length > 0 || isLoading) && (
              <div 
                ref={resultsRef}
                className="absolute top-full left-0 mt-1 w-full max-w-[280px] bg-popover border rounded-md shadow-lg max-h-[400px] overflow-y-auto z-50"
              >
                {isLoading && displayResults.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : displayResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <>
                    {!query && (
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                        Recent Searches
                      </div>
                    )}
                    {displayResults.map((result, index) => (
                      <div
                        key={`${result.symbol}-${index}`}
                        onClick={() => handleSelectResult(result)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                          index === selectedIndex && "bg-accent"
                        )}
                      >
                        <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{result.symbol}</span>
                            {result.type && (
                              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {result.type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{result.name}</p>
                          {result.region && (
                            <p className="text-[10px] text-muted-foreground">{result.region}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>
          
          <Avatar className="h-9 w-9 transition-transform duration-200 hover:scale-105">
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

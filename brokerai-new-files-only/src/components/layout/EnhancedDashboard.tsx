
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stocksApi, marketsApi, currenciesApi } from '@/services/api';
import { mockNews, generatePriceHistory } from '@/utils/stocksApi';
import { Navbar } from '@/components/layout/Navbar';
import { EnhancedSidebar } from '@/components/layout/EnhancedSidebar';
import { PortfolioIntelligence } from '@/components/intelligence/PortfolioIntelligence';
import { PredictiveIntelligence } from '@/components/intelligence/PredictiveIntelligence';
import { NewsSentimentAnalyzer } from '@/components/intelligence/NewsSentimentAnalyzer';
import { SmartMoneyTracker } from '@/components/intelligence/SmartMoneyTracker';
import { EnhancedHoldingsTable } from '@/components/portfolio/EnhancedHoldingsTable';
import { StockChart } from '@/components/stocks/StockChart';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export function EnhancedDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Fetch real data from API
  const { data: stocks, isLoading: stocksLoading, error: stocksError } = useQuery({
    queryKey: ['stocks', ['AMD', 'ARLP', 'NVDA', 'PLTR', 'TSLA']],
    queryFn: () => stocksApi.getMultipleQuotes(['AMD', 'ARLP', 'NVDA', 'PLTR', 'TSLA']),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });

  const { data: indices, isLoading: indicesLoading, error: indicesError } = useQuery({
    queryKey: ['market-indices'],
    queryFn: marketsApi.getIndices,
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  // Show loading state
  if (stocksLoading || indicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <div className="text-lg">Loading BrokerAI Intelligence...</div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (stocksError || indicesError) {
    console.error('API Errors:', { stocksError, indicesError });
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <EnhancedSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden fixed top-16 left-4 z-40">
            <Button variant="outline" size="icon" className="rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <EnhancedSidebar isCollapsed={false} onToggle={toggleSidebar} />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 lg:ml-0 overflow-y-auto">
          <div className="container max-w-full p-3 sm:p-4 lg:p-6">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">BROKERAI DASHBOARD</h1>
              <p className="text-muted-foreground">
                Your intelligent market command center
              </p>
            </div>
            
            {/* Hero Section - Portfolio Intelligence Overview */}
            <div className="animate-fade-in">
              <PortfolioIntelligence 
                portfolioValue={247815}
                dailyChange={5947}
                dailyChangePercent={2.4}
                techExposure={68}
                sharpeRatio={1.23}
                beta={1.05}
                dividendYield={1.7}
              />
            </div>
            
            {/* Main Intelligence Feed Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column - News & Sentiment */}
              <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ '--delay': '100ms' } as React.CSSProperties}>
                <NewsSentimentAnalyzer />
              </div>
              
              {/* Right Column - Predictive Intelligence */}
              <div className="lg:col-span-1 animate-slide-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
                <PredictiveIntelligence />
              </div>
            </div>
            
            {/* Holdings Table */}
            <div className="mb-6 animate-slide-up" style={{ '--delay': '300ms' } as React.CSSProperties}>
              <EnhancedHoldingsTable />
            </div>
            
            {/* Bottom Section - Charts and Smart Money */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Chart Section */}
              <div className="lg:col-span-2 animate-slide-up" style={{ '--delay': '400ms' } as React.CSSProperties}>
                <Card>
                  <CardContent className="p-6">
                    <StockChart 
                      symbol="AMD"
                      name="Advanced Micro Devices"
                      currentPrice={262}
                      volatility={2.5}
                    />
                  </CardContent>
                </Card>
              </div>
              
              {/* Smart Money Tracker */}
              <div className="lg:col-span-1 animate-slide-up" style={{ '--delay': '500ms' } as React.CSSProperties}>
                <SmartMoneyTracker />
              </div>
            </div>
            
            {/* Alerts Section */}
            <div className="animate-slide-up" style={{ '--delay': '600ms' } as React.CSSProperties}>
              <Card className="border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-3">Active Alerts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🎯</span>
                            <div>
                              <p className="font-semibold">AMD crossed $280 target</p>
                              <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">💼</span>
                            <div>
                              <p className="font-semibold">3 new insider buys detected for NVDA</p>
                              <p className="text-xs text-muted-foreground">1 hour ago</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Details</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">🏛️</span>
                            <div>
                              <p className="font-semibold">Politicians increased ARLP holdings</p>
                              <p className="text-xs text-muted-foreground">3 hours ago</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">Analyze</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

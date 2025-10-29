
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { stocksApi, marketsApi, currenciesApi } from '@/services/api';
import { mockNews, generatePriceHistory } from '@/utils/stocksApi';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { PortfolioIntelligence } from '@/components/intelligence/PortfolioIntelligence';
import { NewsSentimentAnalyzer } from '@/components/intelligence/NewsSentimentAnalyzer';
import { PredictiveIntelligence } from '@/components/intelligence/PredictiveIntelligence';
import { SmartMoneyTracker } from '@/components/intelligence/SmartMoneyTracker';
import { EnhancedHoldingsTable } from '@/components/portfolio/EnhancedHoldingsTable';
import { MarketOverview } from '@/components/markets/MarketOverview';
import { CurrencyExchange } from '@/components/currencies/CurrencyExchange';
import { NewsCard } from '@/components/news/NewsCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingDown, TrendingUp, Wallet2, Menu, X, Newspaper, TrendingDown as TrendingIcon, LineChart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Fetch real data from API
  const { data: stocks, isLoading: stocksLoading, error: stocksError } = useQuery({
    queryKey: ['stocks', ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']],
    queryFn: () => stocksApi.getMultipleQuotes(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']),
    refetchInterval: 60000, // Refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3,
  });

  const { data: indices, isLoading: indicesLoading, error: indicesError } = useQuery({
    queryKey: ['market-indices'],
    queryFn: marketsApi.getIndices,
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });

  const { data: cryptos, isLoading: cryptosLoading } = useQuery({
    queryKey: ['top-cryptos'],
    queryFn: () => currenciesApi.getTopCryptos(10),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });

  // Set default selected stock
  const [selectedStock, setSelectedStock] = useState<any>(null);
  
  React.useEffect(() => {
    if (stocks && stocks.length > 0) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks]);
  
  // Debug logging
  console.log('Dashboard Data:', { stocks, indices, cryptos, stocksLoading, indicesLoading, stocksError, indicesError });
  
  // Show loading state
  if (stocksLoading || indicesLoading || cryptosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading market data...</div>
      </div>
    );
  }
  
  // Show error state only if there's actually an error
  if (stocksError || indicesError) {
    console.error('API Errors:', { stocksError, indicesError });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">
          Error loading market data. Please check if the backend server is running.
          <br />
          <small className="text-sm text-gray-500">{stocksError?.message || indicesError?.message}</small>
        </div>
      </div>
    );
  }
  
  // Check if we have data (even if empty array is fine)
  if (!stocks || stocks.length === 0) {
    console.warn('No stocks data available');
  }
  
  if (!indices || indices.length === 0) {
    console.warn('No indices data available');
  }
  
  // Use safe defaults for stocks array
  const stocksArray: any[] = Array.isArray(stocks) ? stocks : [];
  const indicesArray: any[] = Array.isArray(indices) ? indices : [];
  const cryptosArray: any[] = Array.isArray(cryptos) ? cryptos : [];
  
  // Generate chart data for the selected stock
  const selectedStockHistory = selectedStock ? generatePriceHistory(30, selectedStock.price, 2) : [];
  
  // Generate chart data for stock cards
  const stocksWithHistory = stocksArray.map((stock: any) => {
    return {
      ...stock,
      priceHistory: generatePriceHistory(30, stock.price || 100, 2)
    };
  });
  
  // Convert crypto data to currency format (handle both cases)
  const currencies = cryptosArray.map((crypto: any) => ({
    symbol: crypto?.symbol || 'UNKNOWN',
    fromCurrency: 'USD',
    toCurrency: crypto?.symbol || 'UNKNOWN',
    rate: crypto?.price || 0,
    change: crypto?.changePercent24h || crypto?.changePercent || 0,
    changePercent: crypto?.changePercent24h || crypto?.changePercent || 0,
    lastUpdated: new Date(),
  }));
  
  // Calculate market statistics with safe defaults
  const gainers = stocksArray.filter((stock: any) => (stock?.changePercent || 0) > 0);
  const losers = stocksArray.filter((stock: any) => (stock?.changePercent || 0) < 0);
  
  // Get top gainer/loser with safety checks
  const topGainer = stocksArray.length > 0 
    ? [...stocksArray].sort((a: any, b: any) => (b?.changePercent || 0) - (a?.changePercent || 0))[0]
    : { symbol: 'N/A', changePercent: 0, name: 'No data' };
    
  const topLoser = stocksArray.length > 0
    ? [...stocksArray].sort((a: any, b: any) => (a?.changePercent || 0) - (b?.changePercent || 0))[0]
    : { symbol: 'N/A', changePercent: 0, name: 'No data' };
  
  const totalMarketCap = stocksArray.reduce((sum: number, stock: any) => sum + (stock?.marketCap || 0), 0);
  const totalVolume = stocksArray.reduce((sum: number, stock: any) => sum + (stock?.volume || 0), 0);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden fixed top-16 left-4 z-40">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar isCollapsed={false} onToggle={toggleSidebar} />
          </SheetContent>
        </Sheet>
        
        <main className="flex-1 transition-all duration-300 lg:ml-0">
          <div className="container max-w-full p-3 sm:p-4 lg:p-6 animate-fade-in">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Market Dashboard</h1>
            
            {/* Intelligence Navigation Cards (monochrome) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up" style={{ '--delay': '50ms' } as React.CSSProperties}>
              {/* News Sentiment Card */}
              <Link to="/news-sentiment" className="group">
                <Card className="h-full transition-all duration-300 hover:bg-accent/50 cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-muted">
                        <Newspaper className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">
                          News & Sentiment
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Real-time market sentiment
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Smart Money Card */}
              <Link to="/smart-money" className="group">
                <Card className="h-full transition-all duration-300 hover:bg-accent/50 cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-muted">
                        <Wallet2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">
                          Smart Money Tracker
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Track institutional moves
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Predictive Intelligence Card */}
              <Link to="/predictions" className="group">
                <Card className="h-full transition-all duration-300 hover:bg-accent/50 cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 rounded-lg bg-muted">
                        <LineChart className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">
                          Predictive Intelligence
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          AI-powered predictions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Portfolio Intelligence Hero (monochrome) */}
            <div className="mb-6 animate-slide-up" style={{ '--delay': '80ms' } as React.CSSProperties}>
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
            
            {/* Two-column main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left 2/3: Intelligence sections */}
              <div className="lg:col-span-2 space-y-4">
                <NewsSentimentAnalyzer />
                <SmartMoneyTracker />
                <PredictiveIntelligence />
              </div>

              {/* Right 1/3: Portfolio + stats + watchlist + global */}
              <div className="lg:col-span-1 space-y-4">
                <PortfolioIntelligence 
                  portfolioValue={247815}
                  dailyChange={5947}
                  dailyChangePercent={2.4}
                  techExposure={68}
                  sharpeRatio={1.23}
                  beta={1.05}
                  dividendYield={1.7}
                />

                <div className="grid grid-cols-1 gap-3">
                  <StatsCard 
                    title="Market Cap" 
                    value="$13,420,000,000,000.00"
                    icon={<Wallet2 />}
                  />
                  <StatsCard 
                    title="Trading Volume" 
                    value="487,320,000"
                    description="Today's volume"
                    icon={<BarChart3 />}
                  />
                  <StatsCard 
                    title="Top Gainer" 
                    value={topGainer?.symbol || 'N/A'}
                    trend={undefined}
                    trendLabel={topGainer?.name || 'No data'}
                    icon={<TrendingUp />}
                  />
                  <StatsCard 
                    title="Top Loser" 
                    value={topLoser?.symbol || 'N/A'}
                    trend={undefined}
                    trendLabel={topLoser?.name || 'No data'}
                    icon={<TrendingDown />}
                  />
                </div>

                {/* Watchlist */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Watchlist</h2>
                  <div className="space-y-3">
                    {stocksWithHistory.slice(0, 5).map((stock) => (
                      <StockCard 
                        key={stock?.symbol || 'unknown'} 
                        stock={stock} 
                        priceHistory={stock?.priceHistory || []}
                        onClick={() => setSelectedStock(stock)}
                        className={selectedStock?.symbol === stock?.symbol ? "ring-1 ring-muted-foreground/40" : ""}
                      />
                    ))}
                  </div>
                </div>

                {/* Global Markets */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Global Markets</h2>
                  <MarketOverview indices={indicesArray} />
                </div>
              </div>
            </div>
            
            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Left column - Stock list */}
              <div className="lg:col-span-1 space-y-3 sm:space-y-4 animate-slide-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
                <h2 className="text-lg sm:text-xl font-semibold">Watchlist</h2>
                <div className="space-y-3 sm:space-y-4">
                  {stocksWithHistory.slice(0, 5).map((stock) => (
                    <StockCard 
                      key={stock?.symbol || 'unknown'} 
                      stock={stock} 
                      priceHistory={stock?.priceHistory || []}
                      onClick={() => setSelectedStock(stock)}
                      className={selectedStock?.symbol === stock?.symbol ? "ring-2 ring-primary" : ""}
                    />
                  ))}
                </div>
              </div>
              
              {/* Middle column - Chart and Intelligence */}
              <div className="lg:col-span-2 space-y-4 animate-slide-up" style={{ '--delay': '300ms' } as React.CSSProperties}>
                {selectedStock && (
                  <StockChart 
                    symbol={selectedStock?.symbol || 'N/A'} 
                    name={selectedStock?.name || 'Unknown'} 
                    currentPrice={selectedStock?.price || 0}
                    volatility={2.5}
                  />
                )}
                <NewsSentimentAnalyzer />
                <PredictiveIntelligence />
              </div>
              
              {/* Right column - Markets, Smart Money, Holdings */}
              <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{ '--delay': '400ms' } as React.CSSProperties}>
                <MarketOverview indices={indicesArray} />
                <CurrencyExchange currencies={currencies} />
                <SmartMoneyTracker />
                <EnhancedHoldingsTable />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { stocksApi } from '@/services/api';
import { generatePriceHistory } from '@/utils/stocksApi';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { LivePriceDisplay } from '@/components/ui/LivePriceDisplay';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Stocks = () => {
  const previousStocksRef = useRef<any[]>([]);
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'TSLA', 'META', 'V'];
  
  const { data: stocks, isLoading, error, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['stocks', symbols],
    queryFn: () => stocksApi.getMultipleQuotes(symbols),
    refetchInterval: 15000, // 15 seconds
    staleTime: 10000, // Consider data stale after 10s
    retry: 3,
  });

  // Track previous prices for animation
  React.useEffect(() => {
    if (stocks && stocks.length > 0) {
      previousStocksRef.current = stocks;
    }
  }, [stocks]);
  
  const [selectedStock, setSelectedStock] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (stocks && stocks.length > 0) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks]);
  
  if (isLoading) {
    return (
      <PageLayout title="Stocks">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg">Loading stock data...</div>
        </div>
      </PageLayout>
    );
  }
  
  if (error) {
    return (
      <PageLayout title="Stocks">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-red-500">Error loading stock data. Please check if the backend server is running.</div>
        </div>
      </PageLayout>
    );
  }
  
  if (!stocks) {
    return null;
  }
  
  const stocksWithHistory = stocks.map((stock: any) => {
    return {
      ...stock,
      priceHistory: generatePriceHistory(30, stock.price, 2)
    };
  });
  
  const getLastUpdatedText = () => {
    if (!dataUpdatedAt) return '';
    const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <PageLayout title="Stocks">
      <div className="space-y-4 sm:space-y-6">
        {/* Live status header */}
        <div className="flex items-center justify-between px-2 sm:px-0">
          <div className="flex items-center gap-2">
            {isFetching ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Updating...</span>
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium">Live</span>
              </>
            )}
            {dataUpdatedAt && (
              <span className="text-xs text-muted-foreground">
                • Last updated {getLastUpdatedText()}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold px-2 sm:px-0">All Stocks</h2>
            <div className="space-y-3 sm:space-y-4">
              {stocksWithHistory.map((stock: any) => {
                const previousStock = previousStocksRef.current.find((s: any) => s.symbol === stock.symbol);
                return (
                  <div key={stock.symbol} className="relative">
                    <StockCard 
                      stock={stock} 
                      priceHistory={stock.priceHistory}
                      onClick={() => setSelectedStock(stock)}
                      className={selectedStock?.symbol === stock.symbol ? "ring-2 ring-primary" : ""}
                    />
                    {/* Live price overlay indicator */}
                    {isFetching && selectedStock?.symbol === stock.symbol && (
                      <div className="absolute top-2 right-2 bg-primary/10 backdrop-blur-sm rounded-full p-1">
                        <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-4">
          {selectedStock && (
            <>
              {/* Live price display */}
              <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-2">{selectedStock.name}</h3>
                    <LivePriceDisplay
                      price={selectedStock.price}
                      previousPrice={previousStocksRef.current.find((s: any) => s.symbol === selectedStock.symbol)?.price}
                      change={selectedStock.change}
                      changePercent={selectedStock.changePercent}
                      isLive={!isFetching}
                      lastUpdated={selectedStock.lastUpdated ? new Date(selectedStock.lastUpdated) : undefined}
                      size="lg"
                    />
                  </div>
                </div>
              </div>
              
              <StockChart 
                symbol={selectedStock.symbol} 
                name={selectedStock.name} 
                currentPrice={selectedStock.price}
                volatility={2.5}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-card rounded-lg p-3 sm:p-4 shadow">
                  <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Market Cap</h3>
                  <p className="text-lg sm:text-xl font-semibold mt-1 truncate">
                    ${(selectedStock.marketCap / 1000000000).toFixed(2)}B
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 sm:p-4 shadow">
                  <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">Volume</h3>
                  <p className="text-lg sm:text-xl font-semibold mt-1 truncate">
                    {(selectedStock.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 sm:p-4 shadow">
                  <h3 className="font-medium text-xs sm:text-sm text-muted-foreground">52W Range</h3>
                  <p className="text-sm sm:text-lg font-semibold mt-1 truncate">
                    ${(selectedStock.price * 0.8).toFixed(2)} - ${(selectedStock.price * 1.2).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Stocks;

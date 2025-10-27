
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { stocksApi } from '@/services/api';
import { generatePriceHistory } from '@/utils/stocksApi';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';

const Stocks = () => {
  const { data: stocks, isLoading, error } = useQuery({
    queryKey: ['stocks', ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'TSLA', 'META', 'V']],
    queryFn: () => stocksApi.getMultipleQuotes(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'NVDA', 'TSLA', 'META', 'V']),
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  });
  
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
  
  return (
    <PageLayout title="Stocks">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold px-2 sm:px-0">All Stocks</h2>
          <div className="space-y-3 sm:space-y-4">
            {stocksWithHistory.map((stock: any) => (
              <StockCard 
                key={stock.symbol} 
                stock={stock} 
                priceHistory={stock.priceHistory}
                onClick={() => setSelectedStock(stock)}
                className={selectedStock?.symbol === stock.symbol ? "ring-2 ring-primary" : ""}
              />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          {selectedStock && (
            <>
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
    </PageLayout>
  );
};

export default Stocks;

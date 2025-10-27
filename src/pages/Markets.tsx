
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { MarketOverview } from '@/components/markets/MarketOverview';
import { useMarketIndices, mockIndices } from '@/utils/stocksApi';

const Markets = () => {
  const indices = useMarketIndices(mockIndices);
  
  return (
    <PageLayout title="Markets Overview">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <MarketOverview indices={indices} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
          {indices.map((index) => (
            <div key={index.symbol} className="bg-card rounded-lg p-4 sm:p-6 shadow">
              <div className="flex justify-between items-center">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{index.name}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm truncate">{index.region}</p>
                </div>
                <div className={`text-sm sm:text-lg font-bold shrink-0 ${index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="text-xl sm:text-2xl font-bold">{index.value.toFixed(2)}</span>
                <span className={`ml-2 text-sm sm:text-base ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                Last updated: {new Date(index.lastUpdated).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Markets;

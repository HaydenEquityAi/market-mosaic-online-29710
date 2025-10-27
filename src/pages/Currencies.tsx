
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CurrencyExchange } from '@/components/currencies/CurrencyExchange';
import { useCurrencyPairs, mockCurrencies } from '@/utils/stocksApi';

const Currencies = () => {
  const currencies = useCurrencyPairs(mockCurrencies);
  
  return (
    <PageLayout title="Currency Exchange">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <CurrencyExchange currencies={currencies} />
        
        <div className="bg-card rounded-lg p-4 sm:p-6 shadow mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Currency Converter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">From</label>
                <select className="w-full px-3 py-3 border rounded-md h-11 sm:h-10">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Amount</label>
                <input 
                  type="number" 
                  defaultValue="1000" 
                  className="w-full px-3 py-3 border rounded-md h-11 sm:h-10" 
                />
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">To</label>
                <select className="w-full px-3 py-3 border rounded-md h-11 sm:h-10">
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Converted Amount</label>
                <div className="w-full px-3 py-3 border rounded-md bg-gray-50 h-11 sm:h-10 flex items-center">
                  €1,083.40
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Currencies;

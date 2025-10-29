import axios from 'axios';

// Hardcoded production API base URL
const API_BASE_URL = 'https://api.brokerai.ai/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stocks API
export const stocksApi = {
  getQuote: async (symbol: string) => {
    const response = await api.get(`/stocks/quote/${symbol}`);
    console.log('API Response - getQuote:', response.data);
    return response.data.data;
  },
  
  getMultipleQuotes: async (symbols: string[]) => {
    const response = await api.get(`/stocks/quotes?symbols=${symbols.join(',')}`);
    console.log('API Response - getMultipleQuotes:', response.data);
    return response.data.data;
  },
  
  getHistoricalData: async (symbol: string) => {
    const response = await api.get(`/stocks/historical/${symbol}`);
    return response.data.data;
  },
  
  searchStocks: async (keywords: string) => {
    const response = await api.get(`/stocks/search?keywords=${keywords}`);
    return response.data.data;
  },
};

// Markets API (maps to stocks endpoint)
export const marketsApi = {
  getIndices: async () => {
    const response = await api.get('/stocks/indices');
    console.log('API Response - getIndices:', response.data);
    return response.data.data;
  },
  
  getNews: async (category: string = 'general') => {
    // News endpoint not implemented in backend yet
    throw new Error('News endpoint not implemented in backend');
  },
  
  getCompanyNews: async (symbol: string, from: string, to: string) => {
    // Company news endpoint not implemented in backend yet
    throw new Error('Company news endpoint not implemented in backend');
  },
};

// Currencies API (maps to currency and crypto endpoints)
export const currenciesApi = {
  getForexRate: async (from: string, to: string) => {
    const response = await api.get(`/currencies/rate/${from}/${to}`);
    return response.data.data;
  },
  
  getTopCryptos: async (limit: number = 10) => {
    const response = await api.get(`/crypto/top?limit=${limit}`);
    console.log('API Response - getTopCryptos:', response.data);
    return response.data.data;
  },
  
  getCryptoHistory: async (id: string, days: number = 30) => {
    const response = await api.get(`/crypto/${id}/history?days=${days}`);
    return response.data.data;
  },
};

// Portfolio API (NOTE: Requires authentication and database)
export const portfolioApi = {
  getAll: async () => {
    const response = await api.get('/portfolios');
    return response.data.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/portfolios/${id}`);
    return response.data.data;
  },
  
  create: async (name: string) => {
    const response = await api.post('/portfolios', { name });
    return response.data.data;
  },
  
  addHolding: async (portfolioId: string, symbol: string, quantity: number, averageCost: number) => {
    const response = await api.post(`/portfolios/${portfolioId}/holdings`, {
      symbol,
      assetType: 'stock',
      quantity,
      price: averageCost,
    });
    return response.data.data;
  },
  
  removeHolding: async (portfolioId: string, holdingId: string) => {
    const response = await api.delete(`/portfolios/${portfolioId}/holdings/${holdingId}`);
    return response.data.data;
  },
  
  getHoldings: async (portfolioId: string) => {
    const response = await api.get(`/portfolios/${portfolioId}/holdings`);
    return response.data.data;
  },
  
  getValue: async (portfolioId: string) => {
    const response = await api.get(`/portfolios/${portfolioId}/value`);
    return response.data.data;
  },
};

// Re-export new services
export { newsApi } from './newsApi';
export { smartMoneyApi } from './smartMoneyApi';

// Analysis API (NOTE: Not implemented in backend yet)
export const analysisApi = {
  getSectors: async () => {
    throw new Error('Analysis endpoints not implemented in backend yet');
  },
  
  getTrends: async (symbols: string[]) => {
    throw new Error('Analysis endpoints not implemented in backend yet');
  },
  
  getCryptoAnalysis: async () => {
    throw new Error('Analysis endpoints not implemented in backend yet');
  },
  
  compareStocks: async (symbols: string[]) => {
    throw new Error('Analysis endpoints not implemented in backend yet');
  },
  
  getIndicators: async (symbol: string) => {
    throw new Error('Analysis endpoints not implemented in backend yet');
  },
};

// Performance API (NOTE: Not implemented in backend yet)
export const performanceApi = {
  getHistory: async (portfolioId: string, period: string = 'month') => {
    throw new Error('Performance endpoints not implemented in backend yet');
  },
  
  getStats: async (portfolioId: string) => {
    throw new Error('Performance endpoints not implemented in backend yet');
  },
  
  getBenchmark: async (portfolioId: string, period: string = 'year') => {
    throw new Error('Performance endpoints not implemented in backend yet');
  },
  
  getRiskMetrics: async (portfolioId: string) => {
    throw new Error('Performance endpoints not implemented in backend yet');
  },
};

export default api;

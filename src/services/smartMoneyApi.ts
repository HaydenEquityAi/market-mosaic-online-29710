import axios from 'axios';

// Hardcoded production API base URL
const API_BASE_URL = 'https://api.brokerai.ai/api';

export interface CongressTrade {
  id: string;
  politician: string;
  office: 'House' | 'Senate';
  party: 'R' | 'D' | 'I';
  ticker: string;
  action: 'buy' | 'sell';
  amount: string;
  transactionDate: string;
  disclosureDate: string;
  description?: string;
}

export interface HedgeFundActivity {
  id: string;
  fundName: string;
  ticker: string;
  action: 'increased' | 'decreased' | 'new' | 'closed';
  sharesChange: number;
  percentChange: number;
  quarter: string;
  filingDate: string;
  currentValue?: number;
}

export interface InsiderTrade {
  id: string;
  company: string;
  ticker: string;
  insiderName: string;
  insiderTitle: string;
  action: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  transactionDate: string;
  filingDate: string;
}

export const smartMoneyApi = {
  /**
   * Get recent congressional trades
   */
  async getCongressTrades(days: number = 7) {
    const response = await axios.get(`${API_BASE_URL}/smartmoney/congress/trades?days=${days}`);
    return response.data.data as CongressTrade[];
  },

  /**
   * Get hedge fund activity
   */
  async getHedgeFundActivity(quarter?: string) {
    const quarterParam = quarter ? `?quarter=${quarter}` : '';
    const response = await axios.get(`${API_BASE_URL}/smartmoney/hedgefunds/activity${quarterParam}`);
    return response.data.data as HedgeFundActivity[];
  },

  /**
   * Get insider trades
   */
  async getInsiderTrades(ticker?: string, days: number = 30) {
    const params = new URLSearchParams();
    if (ticker) params.append('ticker', ticker);
    params.append('days', days.toString());
    
    const response = await axios.get(`${API_BASE_URL}/smartmoney/insiders/trades?${params.toString()}`);
    return response.data.data as InsiderTrade[];
  },

  /**
   * Get insider trades for multiple tickers
   */
  async getInsiderTradesForTickers(tickers: string[]) {
    const response = await axios.get(`${API_BASE_URL}/smartmoney/insiders/tickers?tickers=${tickers.join(',')}`);
    return response.data.data as Record<string, InsiderTrade[]>;
  }
};

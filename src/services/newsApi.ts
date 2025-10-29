import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3010/api';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  ticker?: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
  impact?: 'high' | 'medium' | 'low';
  imageUrl?: string;
}

export interface SentimentData {
  ticker: string;
  positivePercent: number;
  negativePercent: number;
  neutralPercent: number;
  totalMentions: number;
  trendingScore: number;
  change24h: number;
}

export const newsApi = {
  /**
   * Get latest market news
   */
  async getLatestNews(limit: number = 20, tickers?: string[]) {
    const tickersParam = tickers && tickers.length > 0 ? `&tickers=${tickers.join(',')}` : '';
    const response = await axios.get(`${API_BASE_URL}/news/latest?limit=${limit}${tickersParam}`);
    return response.data.data as NewsArticle[];
  },

  /**
   * Get news for specific ticker
   */
  async getTickerNews(ticker: string, limit: number = 10) {
    const response = await axios.get(`${API_BASE_URL}/news/ticker/${ticker}?limit=${limit}`);
    return response.data.data as NewsArticle[];
  },

  /**
   * Get social sentiment for tickers
   */
  async getSocialSentiment(tickers: string[]) {
    const response = await axios.get(`${API_BASE_URL}/news/sentiment/social?tickers=${tickers.join(',')}`);
    return response.data.data as SentimentData[];
  },

  /**
   * Get trending tickers
   */
  async getTrendingTickers() {
    const response = await axios.get(`${API_BASE_URL}/news/sentiment/trending`);
    return response.data.data as string[];
  }
};

import axios from 'axios';

// Hardcoded production API base URL
const API_BASE_URL = 'https://api.brokerai.ai/api';

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
  async getSocialSentiment(symbols: string[]) {
    const response = await axios.get(`${API_BASE_URL}/news/social-sentiment?symbols=${symbols.join(',')}`);
    // Backend does not return neutralPercent/change24h; compute neutral as remainder, set change24h to 0
    const rows = response.data.data as Array<{
      ticker: string;
      totalMentions: number;
      positivePercent: number;
      negativePercent: number;
      trendingScore: number;
    }>;
    return rows.map((r) => ({
      ticker: r.ticker,
      totalMentions: r.totalMentions,
      positivePercent: r.positivePercent,
      negativePercent: r.negativePercent,
      neutralPercent: Math.max(0, 100 - (r.positivePercent + r.negativePercent)),
      trendingScore: r.trendingScore,
      change24h: 0,
    })) as SentimentData[];
  },

  /**
   * Get trending tickers
   */
  async getTrendingTickers() {
    const response = await axios.get(`${API_BASE_URL}/news/sentiment/trending`);
    return response.data.data as string[];
  }
};

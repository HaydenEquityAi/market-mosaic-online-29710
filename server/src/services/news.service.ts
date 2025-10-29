import axios from 'axios';

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const FINNHUB_KEY = process.env.FINNHUB_API_KEY || '';

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

class NewsService {
  /**
   * Get latest market news from Alpha Vantage
   */
  async getLatestNews(limit: number = 20, tickers?: string[]): Promise<NewsArticle[]> {
    try {
      const tickerParam = tickers && tickers.length > 0 ? `&tickers=${tickers.join(',')}` : '';
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&apikey=${ALPHA_VANTAGE_KEY}${tickerParam}&limit=${limit}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !response.data.feed) {
        console.warn('No news data from Alpha Vantage');
        return [];
      }

      return response.data.feed.map((item: any) => ({
        id: item.url,
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        ticker: item.ticker_sentiment?.[0]?.ticker || null,
        publishedAt: item.time_published,
        sentiment: this.calculateSentiment(item.overall_sentiment_score),
        sentimentScore: parseFloat(item.overall_sentiment_score || 0),
        impact: this.calculateImpact(item.overall_sentiment_score, item.ticker_sentiment),
        imageUrl: item.banner_image
      }));
    } catch (error) {
      console.error('Error fetching news from Alpha Vantage:', error);
      return this.getFinnhubNews(limit, tickers);
    }
  }

  /**
   * Get news from Finnhub (fallback)
   */
  async getFinnhubNews(limit: number = 20, tickers?: string[]): Promise<NewsArticle[]> {
    try {
      const ticker = tickers && tickers.length > 0 ? tickers[0] : '';
      const url = ticker 
        ? `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${this.getDateDaysAgo(7)}&to=${this.getToday()}&token=${FINNHUB_KEY}`
        : `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`;
      
      const response = await axios.get(url);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('No news data from Finnhub');
        return [];
      }

      return response.data.slice(0, limit).map((item: any) => ({
        id: item.id?.toString() || item.url,
        title: item.headline,
        summary: item.summary || item.headline,
        url: item.url,
        source: item.source,
        ticker: ticker || null,
        publishedAt: new Date(item.datetime * 1000).toISOString(),
        sentiment: 'neutral' as const,
        sentimentScore: 0,
        impact: 'medium' as const,
        imageUrl: item.image
      }));
    } catch (error) {
      console.error('Error fetching news from Finnhub:', error);
      return [];
    }
  }

  /**
   * Get news for specific ticker
   */
  async getTickerNews(ticker: string, limit: number = 10): Promise<NewsArticle[]> {
    return this.getLatestNews(limit, [ticker]);
  }

  /**
   * Get social sentiment from multiple sources
   */
  async getSocialSentiment(tickers: string[]): Promise<SentimentData[]> {
    try {
      // Use StockTwits API (free, no key needed for public data)
      const sentimentPromises = tickers.map(ticker => this.getStockTwitsSentiment(ticker));
      const results = await Promise.all(sentimentPromises);
      return results.filter(r => r !== null) as SentimentData[];
    } catch (error) {
      console.error('Error fetching social sentiment:', error);
      return [];
    }
  }

  /**
   * Get sentiment from StockTwits
   */
  private async getStockTwitsSentiment(ticker: string): Promise<SentimentData | null> {
    try {
      const url = `https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`;
      const response = await axios.get(url);
      
      if (!response.data || !response.data.messages) {
        return null;
      }

      const messages = response.data.messages;
      let bullish = 0;
      let bearish = 0;
      
      messages.forEach((msg: any) => {
        if (msg.entities?.sentiment) {
          if (msg.entities.sentiment.basic === 'Bullish') bullish++;
          if (msg.entities.sentiment.basic === 'Bearish') bearish++;
        }
      });

      const total = bullish + bearish;
      const positivePercent = total > 0 ? (bullish / total) * 100 : 50;
      const negativePercent = total > 0 ? (bearish / total) * 100 : 50;

      return {
        ticker,
        positivePercent: Math.round(positivePercent),
        negativePercent: Math.round(negativePercent),
        neutralPercent: 0,
        totalMentions: messages.length,
        trendingScore: Math.min(messages.length * 2, 100),
        change24h: 0 // Would need historical data to calculate
      };
    } catch (error) {
      console.error(`Error fetching StockTwits sentiment for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get trending tickers
   */
  async getTrendingTickers(): Promise<string[]> {
    try {
      const url = 'https://api.stocktwits.com/api/2/trending/symbols.json';
      const response = await axios.get(url);
      
      if (!response.data || !response.data.symbols) {
        return ['NVDA', 'AMD', 'TSLA', 'AAPL', 'MSFT']; // Fallback
      }

      return response.data.symbols.slice(0, 10).map((s: any) => s.symbol);
    } catch (error) {
      console.error('Error fetching trending tickers:', error);
      return ['NVDA', 'AMD', 'TSLA', 'AAPL', 'MSFT'];
    }
  }

  /**
   * Calculate sentiment from score
   */
  private calculateSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score >= 0.15) return 'positive';
    if (score <= -0.15) return 'negative';
    return 'neutral';
  }

  /**
   * Calculate impact level
   */
  private calculateImpact(sentimentScore: number, tickerSentiment: any[]): 'high' | 'medium' | 'low' {
    const absScore = Math.abs(sentimentScore);
    const relevance = tickerSentiment?.[0]?.relevance_score || 0;

    if (absScore > 0.3 && relevance > 0.7) return 'high';
    if (absScore > 0.15 || relevance > 0.4) return 'medium';
    return 'low';
  }

  /**
   * Helper: Get date N days ago
   */
  private getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Helper: Get today's date
   */
  private getToday(): string {
    return new Date().toISOString().split('T')[0];
  }
}

export const newsService = new NewsService();

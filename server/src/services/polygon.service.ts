import axios from 'axios';
import { getFromCache, setToCache } from '../config/redis';

interface PolygonTicker {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
}

interface PolygonQuote {
  results: Array<{
    o: number; // open
    h: number; // high
    l: number; // low
    c: number; // close
    v: number; // volume
    t: number; // timestamp
  }>;
}

class PolygonService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || '';
  }

  // Search for stocks
  async searchStocks(query: string): Promise<any[]> {
    const cacheKey = `polygon:search:${query}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Using Polygon API for search: ${query}`);
      const response = await axios.get('https://api.polygon.io/v3/reference/tickers', {
        params: {
          search: query,
          active: true,
          limit: 50,
          apiKey: this.apiKey,
        },
      });

      const results = response.data.results || [];
      const formatted = results.map((ticker: PolygonTicker) => ({
        symbol: ticker.ticker,
        name: ticker.name,
        type: ticker.type,
        region: ticker.locale === 'us' ? 'United States' : ticker.locale,
        market: ticker.market,
        primary_exchange: ticker.primary_exchange,
        currency: ticker.currency_name,
        matchScore: 1.0, // Polygon doesn't provide match score
      }));

      await setToCache(cacheKey, formatted, 3600); // Cache for 1 hour
      return formatted;
    } catch (error) {
      console.error('Polygon search error:', error);
      throw error;
    }
  }

  // Get stock quote
  async getStockQuote(symbol: string): Promise<any> {
    const cacheKey = `polygon:quote:${symbol}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Using Polygon API for quote: ${symbol}`);
      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev`, {
        params: {
          adjusted: true,
          apiKey: this.apiKey,
        },
      });

      const result = response.data.results?.[0];
      if (!result) {
        return null;
      }

      const quote = {
        symbol: symbol,
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        volume: result.v,
        high: result.h,
        low: result.l,
        open: result.o,
        close: result.c,
        timestamp: result.t,
        lastUpdated: new Date(),
      };

      await setToCache(cacheKey, quote, 60); // Cache for 60 seconds
      return quote;
    } catch (error) {
      console.error('Polygon quote error:', error);
      throw error;
    }
  }

  // Get historical data
  async getHistoricalData(symbol: string, from: string, to: string): Promise<any> {
    const cacheKey = `polygon:history:${symbol}:${from}:${to}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Using Polygon API for history: ${symbol}`);
      const response = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`,
        {
          params: {
            adjusted: true,
            sort: 'asc',
            apiKey: this.apiKey,
          },
        }
      );

      const results = response.data.results || [];
      const formatted = results.map((bar: any) => ({
        date: new Date(bar.t),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
      }));

      await setToCache(cacheKey, formatted, 300); // Cache for 5 minutes
      return formatted;
    } catch (error) {
      console.error('Polygon history error:', error);
      throw error;
    }
  }

  // Get company details
  async getCompanyDetails(symbol: string): Promise<any> {
    const cacheKey = `polygon:details:${symbol}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Using Polygon API for details: ${symbol}`);
      const response = await axios.get(`https://api.polygon.io/v3/reference/tickers/${symbol}`, {
        params: {
          apiKey: this.apiKey,
        },
      });

      const result = response.data.results;
      if (!result) {
        return null;
      }

      await setToCache(cacheKey, result, 86400); // Cache for 24 hours
      return result;
    } catch (error) {
      console.error('Polygon details error:', error);
      throw error;
    }
  }

  // Get multiple quotes
  async getMultipleQuotes(symbols: string[]): Promise<any[]> {
    console.log(`Using Polygon API for multiple quotes: ${symbols.join(',')}`);
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          return await this.getStockQuote(symbol);
        } catch (error) {
          console.error(`Error fetching quote for ${symbol}:`, error);
          return null;
        }
      })
    );

    return quotes.filter((quote) => quote !== null);
  }
}

export default new PolygonService();


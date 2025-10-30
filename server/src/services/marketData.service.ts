import axios from 'axios';
import { Stock, MarketIndex, PriceHistory, PricePoint } from '../types';
import { getFromCache, setToCache } from '../config/redis';

class MarketDataService {
  private alphaVantageKey: string;
  private finnhubKey: string;
  private polygonKey: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
    this.finnhubKey = process.env.FINNHUB_API_KEY || '';
    this.polygonKey = process.env.POLYGON_API_KEY || '';
  }

  // Get stock quote (real-time price)
  async getStockQuote(symbol: string): Promise<Stock | null> {
    const cacheKey = `stock:quote:${symbol}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Using Alpha Vantage as primary source
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        return null;
      }

      const stock: Stock = {
        symbol: symbol,
        name: symbol, // Would need another API call for full name
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        marketCap: 0, // Would need another API call
        lastUpdated: new Date(), // Use current timestamp for real-time feel
      };

      await setToCache(cacheKey, stock, 10); // Cache for 10 seconds (was 60)
      return stock;
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error);
      return null;
    }
  }

  // Get multiple stock quotes
  async getStockQuotes(symbols: string[]): Promise<Stock[]> {
    const promises = symbols.map((symbol) => this.getStockQuote(symbol));
    const results = await Promise.all(promises);
    return results.filter((stock) => stock !== null) as Stock[];
  }

  // Get historical price data
  async getHistoricalData(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M' = '1d',
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<PriceHistory | null> {
    const cacheKey = `stock:history:${symbol}:${interval}:${outputSize}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const functionMap: { [key: string]: string } = {
        '1m': 'TIME_SERIES_INTRADAY',
        '5m': 'TIME_SERIES_INTRADAY',
        '15m': 'TIME_SERIES_INTRADAY',
        '1h': 'TIME_SERIES_INTRADAY',
        '1d': 'TIME_SERIES_DAILY',
        '1w': 'TIME_SERIES_WEEKLY',
        '1M': 'TIME_SERIES_MONTHLY',
      };

      const func = functionMap[interval];
      let url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&apikey=${this.alphaVantageKey}&outputsize=${outputSize}`;

      if (['1m', '5m', '15m', '1h'].includes(interval)) {
        url += `&interval=${interval}`;
      }

      const response = await axios.get(url);

      const timeSeriesKey = Object.keys(response.data).find((key) =>
        key.includes('Time Series')
      );

      if (!timeSeriesKey) {
        return null;
      }

      const timeSeries = response.data[timeSeriesKey];
      const data: PricePoint[] = Object.entries(timeSeries).map(
        ([timestamp, values]: [string, any]) => ({
          timestamp: new Date(timestamp),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        })
      );

      const priceHistory: PriceHistory = {
        symbol,
        interval,
        data: data.reverse(), // Oldest to newest
      };

      await setToCache(cacheKey, priceHistory, 300); // Cache historical data for 5 minutes
      return priceHistory;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return null;
    }
  }

  // Get market indices
  async getMarketIndices(): Promise<MarketIndex[]> {
    const cacheKey = 'market:indices';
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    // Use Alpha Vantage for major indices since it supports index symbols
    const indices = [
      { symbol: 'GSPC', name: 'S&P 500', region: 'United States' },
      { symbol: 'DJI', name: 'Dow Jones', region: 'United States' },
      { symbol: 'IXIC', name: 'NASDAQ', region: 'United States' },
    ];

    try {
      const promises = indices.map(async (index) => {
        try {
          // Use Alpha Vantage GLOBAL_QUOTE endpoint for indices
          const response = await axios.get(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${this.alphaVantageKey}`
          );

          const quote = response.data['Global Quote'];
          
          if (quote && quote['05. price']) {
            const currentPrice = parseFloat(quote['05. price']);
            const previousClose = parseFloat(quote['08. previous close']);
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

            return {
              symbol: index.symbol,
              name: index.name,
              value: currentPrice,
              change: change,
              changePercent: changePercent,
              region: index.region,
              lastUpdated: new Date(), // Current timestamp
            };
          }
          
          return null;
        } catch (error) {
          console.error(`Error fetching index ${index.symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validIndices = results.filter(
        (index) => index !== null
      ) as MarketIndex[];

      await setToCache(cacheKey, validIndices, 30); // Cache indices for 30 seconds (was 5 minutes)
      return validIndices;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return [];
    }
  }

  // Search for stocks
  async searchStocks(query: string): Promise<any[]> {
    const cacheKey = `stock:search:${query}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${this.alphaVantageKey}`
      );

      const matches = response.data.bestMatches || [];
      const results = matches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency'],
        matchScore: parseFloat(match['9. matchScore']),
      }));

      await setToCache(cacheKey, results, 3600); // Cache for 1 hour
      return results;
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  // Get company overview
  async getCompanyOverview(symbol: string): Promise<any> {
    const cacheKey = `stock:overview:${symbol}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );

      const overview = response.data;
      await setToCache(cacheKey, overview, 86400); // Cache for 24 hours
      return overview;
    } catch (error) {
      console.error(`Error fetching company overview for ${symbol}:`, error);
      return null;
    }
  }
}

export default new MarketDataService();

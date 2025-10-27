import axios from 'axios';
import { CurrencyPair } from '../types';
import { getFromCache, setToCache } from '../config/redis';

class CurrencyService {
  private alphaVantageKey: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || '';
  }

  // Get exchange rate for a currency pair
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyPair | null> {
    const symbol = `${fromCurrency}/${toCurrency}`;
    const cacheKey = `currency:${fromCurrency}:${toCurrency}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${this.alphaVantageKey}`
      );

      const data = response.data['Realtime Currency Exchange Rate'];
      if (!data) return null;

      const rate = parseFloat(data['5. Exchange Rate']);
      const previousRate = rate / (1 + parseFloat(data['9. Change Percent']) / 100);
      const change = rate - previousRate;

      const currencyPair: CurrencyPair = {
        symbol,
        fromCurrency,
        toCurrency,
        rate,
        change,
        changePercent: parseFloat(data['9. Change Percent']),
        lastUpdated: new Date(data['6. Last Refreshed']),
      };

      await setToCache(cacheKey, currencyPair, 300); // Cache for 5 minutes
      return currencyPair;
    } catch (error) {
      console.error(
        `Error fetching exchange rate for ${fromCurrency}/${toCurrency}:`,
        error
      );
      return null;
    }
  }

  // Get multiple currency pairs
  async getMultiplePairs(pairs: { from: string; to: string }[]): Promise<CurrencyPair[]> {
    const promises = pairs.map((pair) =>
      this.getExchangeRate(pair.from, pair.to)
    );
    const results = await Promise.all(promises);
    return results.filter((pair) => pair !== null) as CurrencyPair[];
  }

  // Get major currency pairs
  async getMajorPairs(): Promise<CurrencyPair[]> {
    const majorPairs = [
      { from: 'EUR', to: 'USD' },
      { from: 'GBP', to: 'USD' },
      { from: 'USD', to: 'JPY' },
      { from: 'USD', to: 'CHF' },
      { from: 'USD', to: 'CAD' },
      { from: 'AUD', to: 'USD' },
      { from: 'NZD', to: 'USD' },
    ];

    return this.getMultiplePairs(majorPairs);
  }

  // Get historical exchange rates
  async getHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    outputSize: 'compact' | 'full' = 'compact'
  ): Promise<any> {
    const cacheKey = `currency:history:${fromCurrency}:${toCurrency}:${outputSize}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&outputsize=${outputSize}&apikey=${this.alphaVantageKey}`
      );

      const timeSeries = response.data['Time Series FX (Daily)'];
      if (!timeSeries) return null;

      const data = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
        date: new Date(date),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
      }));

      const result = {
        fromCurrency,
        toCurrency,
        data: data.reverse(),
      };

      await setToCache(cacheKey, result, 3600); // Cache for 1 hour
      return result;
    } catch (error) {
      console.error(
        `Error fetching historical rates for ${fromCurrency}/${toCurrency}:`,
        error
      );
      return null;
    }
  }

  // Get intraday exchange rates
  async getIntradayRates(
    fromCurrency: string,
    toCurrency: string,
    interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'
  ): Promise<any> {
    const cacheKey = `currency:intraday:${fromCurrency}:${toCurrency}:${interval}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=${interval}&apikey=${this.alphaVantageKey}`
      );

      const timeSeriesKey = Object.keys(response.data).find((key) =>
        key.includes('Time Series FX')
      );

      if (!timeSeriesKey) return null;

      const timeSeries = response.data[timeSeriesKey];
      const data = Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
        timestamp: new Date(timestamp),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
      }));

      const result = {
        fromCurrency,
        toCurrency,
        interval,
        data: data.reverse(),
      };

      await setToCache(cacheKey, result, 60); // Cache for 1 minute
      return result;
    } catch (error) {
      console.error(
        `Error fetching intraday rates for ${fromCurrency}/${toCurrency}:`,
        error
      );
      return null;
    }
  }
}

export default new CurrencyService();

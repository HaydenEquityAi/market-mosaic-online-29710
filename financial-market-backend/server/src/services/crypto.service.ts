import axios from 'axios';
import { Cryptocurrency } from '../types';
import { getFromCache, setToCache } from '../config/redis';

class CryptoService {
  private coingeckoBaseUrl = 'https://api.coingecko.com/api/v3';

  // Get top cryptocurrencies
  async getTopCryptos(limit: number = 50): Promise<Cryptocurrency[]> {
    const cacheKey = `crypto:top:${limit}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );

      const cryptos: Cryptocurrency[] = response.data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
        supply: coin.circulating_supply,
        lastUpdated: new Date(coin.last_updated),
      }));

      await setToCache(cacheKey, cryptos, 60); // Cache for 1 minute
      return cryptos;
    } catch (error) {
      console.error('Error fetching top cryptos:', error);
      return [];
    }
  }

  // Get specific cryptocurrency
  async getCrypto(id: string): Promise<any> {
    const cacheKey = `crypto:${id}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
      );

      const data = response.data;
      const crypto = {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        price: data.market_data.current_price.usd,
        change: data.market_data.price_change_24h,
        changePercent: data.market_data.price_change_percentage_24h,
        marketCap: data.market_data.market_cap.usd,
        volume: data.market_data.total_volume.usd,
        supply: data.market_data.circulating_supply,
        ath: data.market_data.ath.usd,
        athDate: new Date(data.market_data.ath_date.usd),
        atl: data.market_data.atl.usd,
        atlDate: new Date(data.market_data.atl_date.usd),
        lastUpdated: new Date(data.last_updated),
      };

      await setToCache(cacheKey, crypto, 60);
      return crypto;
    } catch (error) {
      console.error(`Error fetching crypto ${id}:`, error);
      return null;
    }
  }

  // Get historical data
  async getHistoricalData(id: string, days: number = 30): Promise<any> {
    const cacheKey = `crypto:history:${id}:${days}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
      );

      const data = {
        prices: response.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp: new Date(timestamp),
          price,
        })),
        marketCaps: response.data.market_caps.map(([timestamp, cap]: [number, number]) => ({
          timestamp: new Date(timestamp),
          marketCap: cap,
        })),
        volumes: response.data.total_volumes.map(([timestamp, volume]: [number, number]) => ({
          timestamp: new Date(timestamp),
          volume,
        })),
      };

      await setToCache(cacheKey, data, 300);
      return data;
    } catch (error) {
      console.error(`Error fetching crypto historical data for ${id}:`, error);
      return null;
    }
  }

  // Search cryptocurrencies
  async searchCrypto(query: string): Promise<any[]> {
    const cacheKey = `crypto:search:${query}`;
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.coingeckoBaseUrl}/search?query=${query}`
      );

      const results = response.data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        marketCapRank: coin.market_cap_rank,
        thumb: coin.thumb,
      }));

      await setToCache(cacheKey, results, 3600);
      return results;
    } catch (error) {
      console.error('Error searching cryptos:', error);
      return [];
    }
  }

  // Get global crypto market data
  async getGlobalData(): Promise<any> {
    const cacheKey = 'crypto:global';
    const cached = await getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.coingeckoBaseUrl}/global`);
      const data = response.data.data;

      const globalData = {
        totalMarketCap: data.total_market_cap.usd,
        totalVolume: data.total_volume.usd,
        marketCapPercentage: data.market_cap_percentage,
        marketCapChangePercentage24h: data.market_cap_change_percentage_24h_usd,
        activeCryptocurrencies: data.active_cryptocurrencies,
        markets: data.markets,
        updatedAt: new Date(data.updated_at * 1000),
      };

      await setToCache(cacheKey, globalData, 300);
      return globalData;
    } catch (error) {
      console.error('Error fetching global crypto data:', error);
      return null;
    }
  }
}

export default new CryptoService();

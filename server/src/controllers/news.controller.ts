import axios from 'axios';
import type { Request, Response } from 'express';
import { newsService } from '../services/news.service';

// Simple in-memory cache for 5 minutes per symbols key
const socialSentimentCache: Map<string, { data: any; expiresAt: number }> = new Map();

export class NewsController {
  /**
   * GET /api/news/latest
   * Get latest market news
   */
  async getLatestNews(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tickers = req.query.tickers 
        ? (req.query.tickers as string).split(',').map(t => t.trim().toUpperCase())
        : undefined;

      const news = await newsService.getLatestNews(limit, tickers);
      
      res.json({
        success: true,
        count: news.length,
        data: news
      });
    } catch (error) {
      console.error('Error in getLatestNews:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch news'
      });
    }
  }

  /**
   * GET /api/news/ticker/:symbol
   * Get news for specific ticker
   */
  async getTickerNews(req: Request, res: Response) {
    try {
      const { symbol } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const news = await newsService.getTickerNews(symbol.toUpperCase(), limit);
      
      res.json({
        success: true,
        ticker: symbol.toUpperCase(),
        count: news.length,
        data: news
      });
    } catch (error) {
      console.error('Error in getTickerNews:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ticker news'
      });
    }
  }

  /**
   * GET /api/sentiment/social
   * Get social sentiment for tickers
   */
  async getSocialSentiment(req: Request, res: Response) {
    try {
      const tickers = req.query.tickers 
        ? (req.query.tickers as string).split(',').map(t => t.trim().toUpperCase())
        : ['AMD', 'NVDA', 'AAPL', 'MSFT', 'TSLA'];

      const sentiment = await newsService.getSocialSentiment(tickers);
      
      res.json({
        success: true,
        count: sentiment.length,
        data: sentiment
      });
    } catch (error) {
      console.error('Error in getSocialSentiment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch social sentiment'
      });
    }
  }

  /**
   * GET /api/sentiment/trending
   * Get trending tickers
   */
  async getTrendingTickers(req: Request, res: Response) {
    try {
      const trending = await newsService.getTrendingTickers();
      
      res.json({
        success: true,
        data: trending
      });
    } catch (error) {
      console.error('Error in getTrendingTickers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending tickers'
      });
    }
  }

  /**
   * GET /api/news/social-sentiment?symbols=AAPL,NVDA
   * Fetch community sentiment from Finnhub and cache for 5 minutes
   */
  async getFinnhubSocialSentiment(req: Request, res: Response) {
    try {
      const symbolsParam = (req.query.symbols as string) || '';
      const symbols = symbolsParam
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (symbols.length === 0) {
        return res.json({ data: [] });
      }

      const cacheKey = symbols.sort().join(',');
      const cached = socialSentimentCache.get(cacheKey);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        return res.json({ data: cached.data });
      }

      const token = process.env.FINNHUB_API_KEY || 'd3vemf9r01qt2ctpeh90d3vemf9r01qt2ctpeh9g';
      const baseUrl = 'https://finnhub.io/api/v1/stock/social-sentiment';

      const results: any[] = [];
      for (const symbol of symbols) {
        const url = `${baseUrl}?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
        const resp = await axios.get(url, { timeout: 8000 });
        const reddit = resp.data?.reddit || {};
        const twitter = resp.data?.twitter || {};

        const totalMentions = (reddit.mention || 0) + (twitter.mention || 0);
        const positive = (reddit.positiveMention || 0) + (twitter.positiveMention || 0);
        const negative = (reddit.negativeMention || 0) + (twitter.negativeMention || 0);
        const positivePercent = totalMentions > 0 ? (positive / totalMentions) * 100 : 0;
        const negativePercent = totalMentions > 0 ? (negative / totalMentions) * 100 : 0;
        const trendingScore = Math.round(((reddit.score || 0) + (twitter.score || 0)) / 2 * 100);

        results.push({
          ticker: symbol,
          totalMentions,
          positivePercent,
          negativePercent,
          reddit: {
            mention: reddit.mention || 0,
            positiveMention: reddit.positiveMention || 0,
            negativeMention: reddit.negativeMention || 0,
            score: reddit.score || 0,
          },
          twitter: {
            mention: twitter.mention || 0,
            positiveMention: twitter.positiveMention || 0,
            negativeMention: twitter.negativeMention || 0,
            score: twitter.score || 0,
          },
          trendingScore,
        });
      }

      socialSentimentCache.set(cacheKey, { data: results, expiresAt: now + 5 * 60 * 1000 });
      return res.json({ data: results });
    } catch (error) {
      console.error('Error in getFinnhubSocialSentiment:', error);
      return res.status(500).json({ error: 'Failed to fetch social sentiment' });
    }
  }
}

export const newsController = new NewsController();

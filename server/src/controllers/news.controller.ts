import { Request, Response } from 'express';
import { newsService } from '../services/news.service';

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
}

export const newsController = new NewsController();

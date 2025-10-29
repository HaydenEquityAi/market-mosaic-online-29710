import { Request, Response } from 'express';
import { smartMoneyService } from '../services/smartMoney.service';

class SmartMoneyController {
  async getCongressTrades(req: Request, res: Response) {
    try {
      const { days } = req.query as { days?: string };
      const parsedDays = days ? parseInt(days, 10) : 7;
      const data = await smartMoneyService.getCongressTrades(parsedDays);
      res.json({ data });
    } catch (error) {
      console.error('getCongressTrades error:', error);
      res.json({ data: [] });
    }
  }

  async getHedgeFundActivity(req: Request, res: Response) {
    try {
      const { quarter } = req.query as { quarter?: string };
      const data = await smartMoneyService.getHedgeFundActivity(quarter);
      res.json({ data });
    } catch (error) {
      console.error('getHedgeFundActivity error:', error);
      res.json({ data: [] });
    }
  }

  async getInsiderTrades(req: Request, res: Response) {
    try {
      const { ticker, days } = req.query as { ticker?: string; days?: string };
      const parsedDays = days ? parseInt(days, 10) : 30;
      const data = await smartMoneyService.getInsiderTrades(ticker?.toUpperCase(), parsedDays);
      res.json({ data });
    } catch (error) {
      console.error('getInsiderTrades error:', error);
      res.json({ data: [] });
    }
  }

  async getInsiderTradesForTickers(req: Request, res: Response) {
    try {
      const { tickers } = req.query as { tickers?: string };
      const tickersList = tickers ? tickers.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean) : [];

      if (tickersList.length === 0) {
        return res.json({ data: {} });
      }

      const resultMap = await smartMoneyService.getInsiderTradesForTickers(tickersList);
      const data: Record<string, any> = {};
      resultMap.forEach((value, key) => {
        data[key] = value;
      });

      res.json({ data });
    } catch (error) {
      console.error('getInsiderTradesForTickers error:', error);
      res.json({ data: {} });
    }
  }
}

export const smartMoneyController = new SmartMoneyController();

import { Request, Response } from 'express';
import { smartMoneyService } from '../services/smartMoney.service';

export class SmartMoneyController {
  /**
   * GET /api/congress/trades
   * Get recent congressional trades
   */
  async getCongressTrades(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      
      const trades = await smartMoneyService.getCongressTrades(days);
      
      res.json({
        success: true,
        count: trades.length,
        days,
        data: trades
      });
    } catch (error) {
      console.error('Error in getCongressTrades:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch congressional trades'
      });
    }
  }

  /**
   * GET /api/hedgefunds/activity
   * Get hedge fund 13F activity
   */
  async getHedgeFundActivity(req: Request, res: Response) {
    try {
      const quarter = req.query.quarter as string;
      
      const activity = await smartMoneyService.getHedgeFundActivity(quarter);
      
      res.json({
        success: true,
        count: activity.length,
        quarter: quarter || 'latest',
        data: activity
      });
    } catch (error) {
      console.error('Error in getHedgeFundActivity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hedge fund activity'
      });
    }
  }

  /**
   * GET /api/insiders/trades
   * Get insider trading activity
   */
  async getInsiderTrades(req: Request, res: Response) {
    try {
      const ticker = req.query.ticker as string;
      const days = parseInt(req.query.days as string) || 30;
      
      const trades = await smartMoneyService.getInsiderTrades(ticker, days);
      
      res.json({
        success: true,
        count: trades.length,
        ticker: ticker || 'all',
        days,
        data: trades
      });
    } catch (error) {
      console.error('Error in getInsiderTrades:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insider trades'
      });
    }
  }

  /**
   * GET /api/insiders/tickers
   * Get insider trades for multiple tickers
   */
  async getInsiderTradesForTickers(req: Request, res: Response) {
    try {
      const tickers = req.query.tickers 
        ? (req.query.tickers as string).split(',').map(t => t.trim().toUpperCase())
        : ['AMD', 'NVDA', 'AAPL'];

      const tradesMap = await smartMoneyService.getInsiderTradesForTickers(tickers);
      
      // Convert Map to object for JSON response
      const result: any = {};
      tradesMap.forEach((trades, ticker) => {
        result[ticker] = trades;
      });
      
      res.json({
        success: true,
        tickers,
        data: result
      });
    } catch (error) {
      console.error('Error in getInsiderTradesForTickers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch insider trades for tickers'
      });
    }
  }
}

export const smartMoneyController = new SmartMoneyController();

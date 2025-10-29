import { Request, Response } from 'express';
import { smartMoneyService } from '../services/smartMoney.service';

class SmartMoneyController {
  async getCongressTrades(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query as { days?: string };
      const parsedDays = days ? parseInt(days, 10) : 7;
      const data = await smartMoneyService.getCongressTrades(parsedDays);
      return res.json({ data });
    } catch (error) {
      console.error('getCongressTrades error:', error);
      return res.json({ data: [] });
    }
  }

  async getHedgeFundActivity(req: Request, res: Response): Promise<void> {
    try {
      const { quarter } = req.query as { quarter?: string };
      const data = await smartMoneyService.getHedgeFundActivity(quarter);
      return res.json({ data });
    } catch (error) {
      console.error('getHedgeFundActivity error:', error);
      return res.json({ data: [] });
    }
  }

  async getInsiderTrades(req: Request, res: Response): Promise<void> {
    try {
      const { ticker, days } = req.query as { ticker?: string; days?: string };
      const parsedDays = days ? parseInt(days, 10) : 30;
      const data = await smartMoneyService.getInsiderTrades(ticker?.toUpperCase(), parsedDays);
      return res.json({ data });
    } catch (error) {
      console.error('getInsiderTrades error:', error);
      return res.json({ data: [] });
    }
  }

  async getInsiderTradesForTickers(req: Request, res: Response): Promise<void> {
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

      return res.json({ data });
    } catch (error) {
      console.error('getInsiderTradesForTickers error:', error);
      return res.json({ data: {} });
    }
  }
}

export const smartMoneyController = new SmartMoneyController();

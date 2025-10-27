import { Request, Response } from 'express';
import marketDataService from '../services/marketData.service';
import { AppError } from '../middleware/errorHandler';

export const getStockQuote = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  const quote = await marketDataService.getStockQuote(symbol.toUpperCase());

  if (!quote) {
    throw new AppError('Stock not found', 404);
  }

  res.json({ data: quote });
};

export const getMultipleQuotes = async (req: Request, res: Response) => {
  const { symbols } = req.query;

  if (!symbols || typeof symbols !== 'string') {
    throw new AppError('Symbols query parameter is required', 400);
  }

  const symbolArray = symbols.split(',').map((s) => s.trim().toUpperCase());

  const quotes = await marketDataService.getStockQuotes(symbolArray);

  res.json({ data: quotes });
};

export const getHistoricalData = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { interval, outputSize } = req.query;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  const validIntervals = ['1m', '5m', '15m', '1h', '1d', '1w', '1M'];
  const selectedInterval = interval && validIntervals.includes(interval as string)
    ? (interval as any)
    : '1d';

  const selectedOutputSize = outputSize === 'full' ? 'full' : 'compact';

  const data = await marketDataService.getHistoricalData(
    symbol.toUpperCase(),
    selectedInterval,
    selectedOutputSize
  );

  if (!data) {
    throw new AppError('Historical data not found', 404);
  }

  res.json({ data });
};

export const searchStocks = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400);
  }

  const results = await marketDataService.searchStocks(q);

  res.json({ data: results });
};

export const getCompanyOverview = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  const overview = await marketDataService.getCompanyOverview(symbol.toUpperCase());

  if (!overview) {
    throw new AppError('Company overview not found', 404);
  }

  res.json({ data: overview });
};

export const getMarketIndices = async (req: Request, res: Response) => {
  const indices = await marketDataService.getMarketIndices();

  res.json({ data: indices });
};

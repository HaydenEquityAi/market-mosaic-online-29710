import { Request, Response } from 'express';
import currencyService from '../services/currency.service';
import { AppError } from '../middleware/errorHandler';

export const getExchangeRate = async (req: Request, res: Response) => {
  const { from, to } = req.params;

  if (!from || !to) {
    throw new AppError('From and to currencies are required', 400);
  }

  const rate = await currencyService.getExchangeRate(
    from.toUpperCase(),
    to.toUpperCase()
  );

  if (!rate) {
    throw new AppError('Exchange rate not found', 404);
  }

  res.json({ data: rate });
};

export const getMajorPairs = async (req: Request, res: Response) => {
  const pairs = await currencyService.getMajorPairs();

  res.json({ data: pairs });
};

export const getHistoricalRates = async (req: Request, res: Response) => {
  const { from, to } = req.params;
  const { outputSize } = req.query;

  if (!from || !to) {
    throw new AppError('From and to currencies are required', 400);
  }

  const selectedOutputSize = outputSize === 'full' ? 'full' : 'compact';

  const data = await currencyService.getHistoricalRates(
    from.toUpperCase(),
    to.toUpperCase(),
    selectedOutputSize
  );

  if (!data) {
    throw new AppError('Historical data not found', 404);
  }

  res.json({ data });
};

export const getIntradayRates = async (req: Request, res: Response) => {
  const { from, to } = req.params;
  const { interval } = req.query;

  if (!from || !to) {
    throw new AppError('From and to currencies are required', 400);
  }

  const validIntervals = ['1min', '5min', '15min', '30min', '60min'];
  const selectedInterval = interval && validIntervals.includes(interval as string)
    ? (interval as any)
    : '5min';

  const data = await currencyService.getIntradayRates(
    from.toUpperCase(),
    to.toUpperCase(),
    selectedInterval
  );

  if (!data) {
    throw new AppError('Intraday data not found', 404);
  }

  res.json({ data });
};

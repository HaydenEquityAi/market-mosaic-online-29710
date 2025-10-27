import { Request, Response } from 'express';
import cryptoService from '../services/crypto.service';
import { AppError } from '../middleware/errorHandler';

export const getTopCryptos = async (req: Request, res: Response) => {
  const { limit = 50 } = req.query;

  const cryptos = await cryptoService.getTopCryptos(parseInt(limit as string));

  res.json({ data: cryptos });
};

export const getCrypto = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Crypto ID is required', 400);
  }

  const crypto = await cryptoService.getCrypto(id.toLowerCase());

  if (!crypto) {
    throw new AppError('Cryptocurrency not found', 404);
  }

  res.json({ data: crypto });
};

export const getCryptoHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { days = 30 } = req.query;

  if (!id) {
    throw new AppError('Crypto ID is required', 400);
  }

  const history = await cryptoService.getHistoricalData(
    id.toLowerCase(),
    parseInt(days as string)
  );

  if (!history) {
    throw new AppError('Historical data not found', 404);
  }

  res.json({ data: history });
};

export const searchCrypto = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    throw new AppError('Search query is required', 400);
  }

  const results = await cryptoService.searchCrypto(q);

  res.json({ data: results });
};

export const getGlobalData = async (req: Request, res: Response) => {
  const globalData = await cryptoService.getGlobalData();

  if (!globalData) {
    throw new AppError('Global data not available', 503);
  }

  res.json({ data: globalData });
};

import { Router } from 'express';
import * as stockController from '../controllers/stock.controller';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All stock routes are public or optionally authenticated
router.get('/quote/:symbol', optionalAuth, asyncHandler(stockController.getStockQuote));
router.get('/quotes', optionalAuth, asyncHandler(stockController.getMultipleQuotes));
router.get('/history/:symbol', optionalAuth, asyncHandler(stockController.getHistoricalData));
router.get('/search', optionalAuth, asyncHandler(stockController.searchStocks));
router.get('/overview/:symbol', optionalAuth, asyncHandler(stockController.getCompanyOverview));
router.get('/indices', optionalAuth, asyncHandler(stockController.getMarketIndices));

export default router;

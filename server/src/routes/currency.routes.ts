import { Router } from 'express';
import * as currencyController from '../controllers/currency.controller';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/major-pairs', optionalAuth, asyncHandler(currencyController.getMajorPairs));
router.get('/rate/:from/:to', optionalAuth, asyncHandler(currencyController.getExchangeRate));
router.get('/history/:from/:to', optionalAuth, asyncHandler(currencyController.getHistoricalRates));
router.get('/intraday/:from/:to', optionalAuth, asyncHandler(currencyController.getIntradayRates));

export default router;

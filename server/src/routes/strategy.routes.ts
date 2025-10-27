import { Router } from 'express';
import * as strategyController from '../controllers/strategy.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All strategy routes require authentication
router.use(authMiddleware);

router.get('/', asyncHandler(strategyController.getStrategies));
router.post('/', asyncHandler(strategyController.createStrategy));
router.get('/:id', asyncHandler(strategyController.getStrategy));
router.put('/:id', asyncHandler(strategyController.updateStrategy));
router.delete('/:id', asyncHandler(strategyController.deleteStrategy));

// Backtesting
router.post('/:id/backtest', asyncHandler(strategyController.runBacktest));
router.get('/:id/backtest-results', asyncHandler(strategyController.getBacktestResults));

export default router;

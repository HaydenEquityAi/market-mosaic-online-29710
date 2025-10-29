import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All portfolio routes use optional auth (works without login for testing)
router.use(optionalAuth);

// Guest-friendly routes (no :id required)
router.get('/holdings', asyncHandler(portfolioController.getDefaultHoldings));
router.post('/holdings', asyncHandler(portfolioController.addDefaultHolding));
router.delete('/holdings/:holdingId', asyncHandler(portfolioController.removeDefaultHolding));

router.get('/', asyncHandler(portfolioController.getPortfolios));
router.post('/', asyncHandler(portfolioController.createPortfolio));
router.get('/:id', asyncHandler(portfolioController.getPortfolio));
router.put('/:id', asyncHandler(portfolioController.updatePortfolio));
router.delete('/:id', asyncHandler(portfolioController.deletePortfolio));

// Holdings
router.get('/:id/holdings', asyncHandler(portfolioController.getPortfolioHoldings));
router.post('/:id/holdings', asyncHandler(portfolioController.addHolding));
router.delete('/:id/holdings/:holdingId', asyncHandler(portfolioController.removeHolding));

// Transactions
router.get('/:id/transactions', asyncHandler(portfolioController.getPortfolioTransactions));

export default router;

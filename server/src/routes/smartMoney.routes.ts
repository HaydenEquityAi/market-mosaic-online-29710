import { Router } from 'express';
import { smartMoneyController } from '../controllers/smartMoney.controller';

const router = Router();

// Congressional trades
router.get('/congress/trades', smartMoneyController.getCongressTrades.bind(smartMoneyController));

// Hedge fund activity
router.get('/hedgefunds/activity', smartMoneyController.getHedgeFundActivity.bind(smartMoneyController));

// Insider trades
router.get('/insiders/trades', smartMoneyController.getInsiderTrades.bind(smartMoneyController));
router.get('/insiders/tickers', smartMoneyController.getInsiderTradesForTickers.bind(smartMoneyController));

export default router;

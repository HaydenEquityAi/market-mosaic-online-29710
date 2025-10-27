import { Router } from 'express';
import * as cryptoController from '../controllers/crypto.controller';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/top', optionalAuth, asyncHandler(cryptoController.getTopCryptos));
router.get('/global', optionalAuth, asyncHandler(cryptoController.getGlobalData));
router.get('/search', optionalAuth, asyncHandler(cryptoController.searchCrypto));
router.get('/:id', optionalAuth, asyncHandler(cryptoController.getCrypto));
router.get('/:id/history', optionalAuth, asyncHandler(cryptoController.getCryptoHistory));

export default router;

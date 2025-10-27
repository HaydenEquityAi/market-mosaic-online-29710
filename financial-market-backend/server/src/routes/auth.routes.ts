import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.get('/profile', authMiddleware, asyncHandler(authController.getProfile));
router.put('/profile', authMiddleware, asyncHandler(authController.updateProfile));
router.post('/change-password', authMiddleware, asyncHandler(authController.changePassword));

export default router;

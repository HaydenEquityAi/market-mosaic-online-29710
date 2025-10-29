import { Router } from 'express';
import { newsController } from '../controllers/news.controller';

const router = Router();

// News endpoints
router.get('/latest', newsController.getLatestNews.bind(newsController));
router.get('/ticker/:symbol', newsController.getTickerNews.bind(newsController));

// Sentiment endpoints
router.get('/sentiment/social', newsController.getSocialSentiment.bind(newsController));
router.get('/sentiment/trending', newsController.getTrendingTickers.bind(newsController));
router.get('/social-sentiment', newsController.getFinnhubSocialSentiment.bind(newsController));

// Compatibility alias: /api/news/:symbol → ticker news
router.get('/:symbol', newsController.getTickerNews.bind(newsController));

export default router;

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectRedis } from './config/redis';
import { errorHandler, notFound } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import stockRoutes from './routes/stock.routes';
import portfolioRoutes from './routes/portfolio.routes';
import cryptoRoutes from './routes/crypto.routes';
import currencyRoutes from './routes/currency.routes';
import strategyRoutes from './routes/strategy.routes';
import newsRoutes from './routes/news.routes';
import smartMoneyRoutes from './routes/smartMoney.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration with pattern matching for Vercel preview deployments
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:5173',
  'https://market-mosaic-online-29710.vercel.app',
];

// Add environment-specific origins if provided
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);
  allowedOrigins.push(...envOrigins);
}

// CORS with origin validation
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    // Check if origin matches Vercel preview URL pattern
    // Pattern: https://market-mosaic-online-29710-{segment1}-{segment2}-{segment3}.vercel.app
    // Matches patterns like: market-mosaic-online-29710-git-main-hayden-5176s-projects
    const vercelPattern = /^https:\/\/market-mosaic-online-29710-[a-z0-9-]+\.vercel\.app$/;
    if (vercelPattern.test(origin)) {
      console.log(`✅ CORS allowed for Vercel preview: ${origin}`);
      return callback(null, origin);
    }

    console.log(`⚠️  Blocked CORS request from: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan('combined')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/smartmoney', smartMoneyRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional)
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (redisError) {
      console.log('⚠️  Redis connection skipped (not available)');
      console.log('💡 Server will run without Redis cache. API calls will be slightly slower.');
    }

    // Test database connection (optional)
    try {
      const { query } = await import('./config/database');
      await query('SELECT NOW()');
      console.log('✅ Database connected');
    } catch (dbError) {
      console.log('⚠️  Database connection skipped (not configured or not available)');
      console.log('💡 Server will run without database. All data comes from external APIs.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;

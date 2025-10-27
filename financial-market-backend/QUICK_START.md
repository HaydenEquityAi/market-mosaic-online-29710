# 🚀 Quick Start Guide - Financial Market Software Backend

Get your backend up and running in minutes!

## Prerequisites Checklist

Before you begin, ensure you have:

- ✅ Node.js v18+ installed
- ✅ PostgreSQL v13+ installed and running
- ✅ Redis v6+ installed and running
- ✅ API keys from:
  - [Alpha Vantage](https://www.alphavantage.co/support/#api-key) - Free
  - [Finnhub](https://finnhub.io/register) - Free
  - CoinGecko - No API key needed for basic usage

## Option 1: Quick Setup with Docker (Recommended)

This is the fastest way to get started!

### 1. Copy the server folder to your project

```bash
# The server folder is ready to use in /mnt/user-data/outputs/server
```

### 2. Navigate to server directory

```bash
cd server
```

### 3. Create .env file

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
ALPHA_VANTAGE_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
JWT_SECRET=change-this-to-a-secure-random-string
```

### 4. Start everything with Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- API server (port 3001)

### 5. Test the API

```bash
curl http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1.234
}
```

### 6. Test a stock quote

```bash
curl http://localhost:3001/api/stocks/quote/AAPL
```

**That's it! Your backend is running! 🎉**

---

## Option 2: Manual Setup

If you prefer not to use Docker:

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Start PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows (WSL)
sudo service postgresql start
```

### 3. Create database

```bash
createdb financial_market_db
psql -d financial_market_db -f src/config/schema.sql
```

### 4. Start Redis

```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows (WSL)
sudo service redis-server start
```

### 5. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 6. Start the server

```bash
npm run dev
```

---

## Testing Your Backend

### 1. Register a user

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Save the `token` from the response!

### 2. Get stock quote

```bash
curl http://localhost:3001/api/stocks/quote/AAPL
```

### 3. Create a portfolio (requires auth)

```bash
curl -X POST http://localhost:3001/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My First Portfolio",
    "description": "Testing the API"
  }'
```

### 4. Get market data

```bash
# Market indices
curl http://localhost:3001/api/stocks/indices

# Top cryptocurrencies
curl http://localhost:3001/api/crypto/top?limit=10

# Currency pairs
curl http://localhost:3001/api/currencies/major-pairs
```

---

## Connecting Your Frontend

### Update your frontend to use the real API:

1. **Install axios** (if not already installed):
```bash
npm install axios
```

2. **Create API client** (`src/utils/api.ts`):
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. **Update stocksApi.ts** to use real API:
```typescript
import { api } from './api';

export const fetchStocks = async (symbols: string[]) => {
  const response = await api.get(`/stocks/quotes?symbols=${symbols.join(',')}`);
  return response.data.data;
};
```

4. **See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for complete integration guide**

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (auth required)

### Market Data
- `GET /api/stocks/quote/:symbol` - Stock quote
- `GET /api/stocks/quotes?symbols=...` - Multiple quotes
- `GET /api/stocks/history/:symbol` - Historical data
- `GET /api/stocks/indices` - Market indices
- `GET /api/crypto/top` - Top cryptocurrencies
- `GET /api/currencies/major-pairs` - Forex rates

### Portfolio Management (auth required)
- `GET /api/portfolios` - List portfolios
- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios/:id/holdings` - Get holdings
- `POST /api/portfolios/:id/holdings` - Add holding

### Strategies (auth required)
- `GET /api/strategies` - List strategies
- `POST /api/strategies` - Create strategy
- `POST /api/strategies/:id/backtest` - Run backtest

**See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference**

---

## Common Issues & Solutions

### ❌ "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux
```

### ❌ "Cannot connect to Redis"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
# If not, start it
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### ❌ "API rate limit exceeded"

**Solution:**
- Free API keys have limited requests per day
- Implement caching (already included!)
- Upgrade to paid API plans for production

### ❌ "CORS error in frontend"

**Solution:**
Make sure your backend `.env` has:
```env
CORS_ORIGIN=http://localhost:8080
```

---

## Next Steps

1. ✅ Backend is running
2. ✅ Test endpoints with curl
3. 📱 Connect your frontend (see FRONTEND_INTEGRATION.md)
4. 🎨 Build awesome features!
5. 🚀 Deploy to production (see deployment guide below)

---

## Production Deployment

### Option 1: Docker

```bash
# Build production image
docker build -t financial-market-api .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Traditional Hosting

1. Build the TypeScript:
```bash
npm run build
```

2. Set environment to production:
```env
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

### Recommended Services:
- **API Hosting:** Railway, Render, or AWS EC2
- **Database:** AWS RDS or DigitalOcean Managed PostgreSQL
- **Redis:** Redis Cloud or AWS ElastiCache
- **Monitoring:** Sentry, DataDog, or New Relic

---

## Resources

- 📖 [Complete API Documentation](API_DOCUMENTATION.md)
- 🔌 [Frontend Integration Guide](FRONTEND_INTEGRATION.md)
- 📚 [Full README](server/README.md)
- 💬 Need help? Create an issue on GitHub

---

## Performance Tips

1. **Enable Redis caching** - Already configured! ✅
2. **Use connection pooling** - Already configured! ✅
3. **Add database indexes** - Already in schema! ✅
4. **Monitor API rate limits** - Use free tiers wisely
5. **Optimize queries** - Use pagination for large datasets

---

## Security Checklist

- ✅ JWT authentication implemented
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting configured
- ✅ Helmet.js security headers
- ⚠️ Change JWT_SECRET in production
- ⚠️ Use HTTPS in production
- ⚠️ Implement refresh tokens for long sessions

---

**Congratulations! You now have a production-ready financial market backend! 🎉**

Happy coding! 💻✨

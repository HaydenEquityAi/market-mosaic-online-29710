# Project Setup Guide - What's Missing and What You Need

## ✅ Already Completed

1. **Database is now optional** - Server runs without PostgreSQL
2. **Redis is now optional** - Server runs without Redis
3. **Frontend API service created** - `src/services/api.ts` with all endpoints
4. **API routes fixed** - Frontend now calls correct backend endpoints
5. **React Query integrated** - For data fetching with caching

## ⚠️ What's Missing / What You Need to Do

### 1. **Backend Server Setup** (REQUIRED)

The backend must be running for the frontend to work.

```bash
cd server
npm install
npm run dev
```

**Environment Variables Needed:**
- `ALPHA_VANTAGE_API_KEY` - Required for stock data (you have: 17EEI41BQ1CEWK61)
- `FINNHUB_API_KEY` - Required for market indices (NOT SET - need to get one)
- `COINGECKO_API_KEY` - For crypto data (optional, uses free tier by default)

**To get Finnhub API key:**
1. Go to https://finnhub.io/
2. Sign up for free account
3. Get your API key from dashboard
4. Add to `env` file: `FINNHUB_API_KEY=your_key_here`

### 2. **CORS Configuration** (IMPORTANT)

The backend is configured for CORS on `http://localhost:8080` by default, but your frontend likely runs on a different port.

**Check your frontend's port** and update `server/.env`:
```env
CORS_ORIGIN=http://localhost:5173  # or whatever port Vite uses
```

Or update `server/src/index.ts` to allow your frontend's port:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080'], // Add your frontend port
  credentials: true,
}));
```

### 3. **Not Yet Implemented in Backend** (Will show errors)

These features exist in frontend but backend doesn't have them yet:

- ❌ News endpoints (`/markets/news`)
- ❌ Analysis endpoints (`/analysis/*`)
- ❌ Performance endpoints (`/performance/*`)
- ❌ Strategy endpoints require database and authentication

**What WILL work:**
- ✅ Stock quotes (`/api/stocks/quote/:symbol`)
- ✅ Multiple stock quotes (`/api/stocks/quotes`)
- ✅ Historical data (`/api/stocks/history/:symbol`)
- ✅ Market indices (`/api/stocks/indices`)
- ✅ Crypto top list (`/api/crypto/top`)
- ✅ Crypto history (`/api/crypto/:id/history`)
- ✅ Currency rates (`/api/currencies/rate/:from/:to`)

### 4. **Missing API Keys** (BLOCKERS)

You need these API keys for data to work:

#### A. Alpha Vantage (Has it) ✅
```env
ALPHA_VANTAGE_API_KEY=17EEI41BQ1CEWK61  # You already have this
```

#### B. Finnhub (MISSING) ❌
Get it from: https://finnhub.io/
- Free tier: 60 calls/minute
- Add to `env` file

#### C. CoinGecko (Optional) 
- Uses free tier by default
- No API key needed for basic features

### 5. **Environment File Setup**

Create `server/.env` file with these minimum settings:

```env
# Server
PORT=3010
NODE_ENV=development

# API Keys
ALPHA_VANTAGE_API_KEY=17EEI41BQ1CEWK61
FINNHUB_API_KEY=YOUR_FINNHUB_KEY_HERE

# CORS - Change to your frontend port
CORS_ORIGIN=http://localhost:5173

# JWT (for auth features)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRES_IN=7d

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (OPTIONAL - comment out to disable)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=financial_market_db
# DB_USER=postgres
# DB_PASSWORD=your_password_here

# Redis (OPTIONAL - comment out to disable)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 6. **Quick Start Checklist**

To get the project running:

```bash
# 1. Install backend dependencies
cd server
npm install

# 2. Get Finnhub API key (https://finnhub.io/)
# Add it to server/.env

# 3. Start backend server
npm run dev
# Should see: "🚀 Server is running on port 3001"

# 4. In another terminal, start frontend
cd .. # Go back to project root
npm run dev
# Should see Vite dev server URL

# 5. Open your browser to the frontend URL
# Test: http://localhost:3010/health (should return JSON)
```

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Solution:**
- Make sure backend is running on port 3001
- Check if port 3001 is being used: `netstat -ano | findstr :3001` (Windows)
- Try changing PORT in server/.env

### Issue 2: "CORS error"
**Solution:**
- Update `CORS_ORIGIN` in `server/.env` to match your frontend URL
- Or update the CORS config in `server/src/index.ts`

### Issue 3: "API rate limit exceeded"
**Solution:**
- Free tier APIs have limits
- Alpha Vantage free tier: 5 calls/minute, 500 calls/day
- Finnhub free tier: 60 calls/minute
- Add delays between requests or upgrade API keys

### Issue 4: "Failed to fetch" errors
**Solution:**
- Check if backend is running: `curl http://localhost:3010/health`
- Check browser console for CORS errors
- Verify API keys are set correctly

## 📋 Summary - What You Need

1. ✅ Database - OPTIONAL (not required)
2. ✅ Redis - OPTIONAL (not required)
3. ❌ Backend server running - REQUIRED
4. ❌ Finnhub API key - REQUIRED
5. ✅ Alpha Vantage API key - HAVE IT
6. ⚠️ Proper CORS configuration - NEEDS UPDATE

## 🎯 Next Steps

1. **Get Finnhub API key** (takes 2 minutes)
2. **Update CORS config** to match your frontend port
3. **Start backend**: `cd server && npm run dev`
4. **Start frontend**: `npm run dev`
5. **Test**: Open browser and check for data loading

## 📝 Working Endpoints

These endpoints will work immediately:

- `GET /api/stocks/quote/:symbol` - Get stock quote
- `GET /api/stocks/quotes?symbols=AAPL,MSFT` - Get multiple quotes
- `GET /api/stocks/indices` - Get market indices
- `GET /api/crypto/top?limit=10` - Get top cryptos
- `GET /api/currencies/rate/USD/EUR` - Get exchange rate

These will NOT work (not implemented):

- `/api/markets/news` - News not implemented
- `/api/analysis/*` - Analysis not implemented
- `/api/performance/*` - Performance not implemented
- `/api/portfolios/*` - Requires database + auth
- `/api/strategies/*` - Requires database + auth

## 🔧 Testing

Test the backend is working:

```bash
# Health check
curl http://localhost:3010/health

# Get stock quote
curl http://localhost:3010/api/stocks/quote/AAPL

# Get indices
curl http://localhost:3010/api/stocks/indices
```

If these work, backend is configured correctly!


# Financial Market API Documentation

Complete API reference for the Financial Market Backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login

**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Get Profile

**GET** `/auth/profile` 🔒

Get current user's profile.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Stock Endpoints

### Get Stock Quote

**GET** `/stocks/quote/:symbol`

Get real-time quote for a single stock.

**Parameters:**
- `symbol` (path) - Stock symbol (e.g., AAPL)

**Response:** `200 OK`
```json
{
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 187.32,
    "change": 1.28,
    "changePercent": 0.69,
    "volume": 58394210,
    "marketCap": 2920000000000,
    "lastUpdated": "2024-01-01T16:00:00.000Z"
  }
}
```

### Get Multiple Quotes

**GET** `/stocks/quotes?symbols=AAPL,MSFT,GOOGL`

Get quotes for multiple stocks.

**Query Parameters:**
- `symbols` - Comma-separated stock symbols

**Response:** `200 OK`
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 187.32,
      ...
    },
    {
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "price": 402.65,
      ...
    }
  ]
}
```

### Get Historical Data

**GET** `/stocks/history/:symbol`

Get historical price data for a stock.

**Parameters:**
- `symbol` (path) - Stock symbol
- `interval` (query) - Time interval: 1m, 5m, 15m, 1h, 1d, 1w, 1M (default: 1d)
- `outputSize` (query) - compact (100 points) or full (default: compact)

**Response:** `200 OK`
```json
{
  "data": {
    "symbol": "AAPL",
    "interval": "1d",
    "data": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "open": 185.50,
        "high": 188.20,
        "low": 184.90,
        "close": 187.32,
        "volume": 58394210
      },
      ...
    ]
  }
}
```

### Search Stocks

**GET** `/stocks/search?q=apple`

Search for stocks by name or symbol.

**Query Parameters:**
- `q` - Search query

**Response:** `200 OK`
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "type": "Equity",
      "region": "United States",
      "matchScore": 1.0
    },
    ...
  ]
}
```

### Get Company Overview

**GET** `/stocks/overview/:symbol`

Get detailed company information.

**Parameters:**
- `symbol` (path) - Stock symbol

**Response:** `200 OK`
```json
{
  "data": {
    "Symbol": "AAPL",
    "Name": "Apple Inc.",
    "Description": "Apple Inc. designs...",
    "Sector": "Technology",
    "Industry": "Consumer Electronics",
    "MarketCapitalization": "2920000000000",
    "PERatio": "28.5",
    "DividendYield": "0.0050",
    ...
  }
}
```

### Get Market Indices

**GET** `/stocks/indices`

Get current values for major market indices.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "symbol": "^GSPC",
      "name": "S&P 500",
      "value": 5123.41,
      "change": 34.85,
      "changePercent": 0.68,
      "region": "United States",
      "lastUpdated": "2024-01-01T16:00:00.000Z"
    },
    ...
  ]
}
```

---

## Cryptocurrency Endpoints

### Get Top Cryptocurrencies

**GET** `/crypto/top?limit=50`

Get top cryptocurrencies by market cap.

**Query Parameters:**
- `limit` - Number of results (default: 50, max: 250)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 62150.32,
      "change": 1280.45,
      "changePercent": 2.10,
      "marketCap": 1215000000000,
      "volume": 28000000000,
      "supply": 19500000,
      "lastUpdated": "2024-01-01T12:00:00.000Z"
    },
    ...
  ]
}
```

### Get Cryptocurrency Details

**GET** `/crypto/:id`

Get detailed information about a cryptocurrency.

**Parameters:**
- `id` (path) - Cryptocurrency ID (e.g., bitcoin, ethereum)

**Response:** `200 OK`
```json
{
  "data": {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 62150.32,
    "marketCap": 1215000000000,
    "ath": 69000,
    "athDate": "2021-11-10T00:00:00.000Z",
    ...
  }
}
```

### Get Cryptocurrency History

**GET** `/crypto/:id/history?days=30`

Get historical price data for a cryptocurrency.

**Parameters:**
- `id` (path) - Cryptocurrency ID
- `days` (query) - Number of days (1, 7, 14, 30, 90, 180, 365, max)

**Response:** `200 OK`
```json
{
  "data": {
    "prices": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "price": 62150.32
      },
      ...
    ],
    "marketCaps": [...],
    "volumes": [...]
  }
}
```

---

## Currency (Forex) Endpoints

### Get Major Currency Pairs

**GET** `/currencies/major-pairs`

Get current rates for major currency pairs.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "symbol": "EUR/USD",
      "fromCurrency": "EUR",
      "toCurrency": "USD",
      "rate": 1.0834,
      "change": 0.0023,
      "changePercent": 0.21,
      "lastUpdated": "2024-01-01T12:00:00.000Z"
    },
    ...
  ]
}
```

### Get Exchange Rate

**GET** `/currencies/rate/:from/:to`

Get exchange rate for a currency pair.

**Parameters:**
- `from` (path) - Source currency code (e.g., EUR)
- `to` (path) - Target currency code (e.g., USD)

**Response:** `200 OK`
```json
{
  "data": {
    "symbol": "EUR/USD",
    "fromCurrency": "EUR",
    "toCurrency": "USD",
    "rate": 1.0834,
    "change": 0.0023,
    "changePercent": 0.21,
    "lastUpdated": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Portfolio Endpoints

### Get All Portfolios

**GET** `/portfolios` 🔒

Get all portfolios for the authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "My Investment Portfolio",
      "description": "Long-term growth portfolio",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

### Create Portfolio

**POST** `/portfolios` 🔒

Create a new portfolio.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Tech Growth Portfolio",
  "description": "Focused on technology stocks"
}
```

**Response:** `201 Created`
```json
{
  "message": "Portfolio created successfully",
  "data": {
    "id": "uuid",
    "name": "Tech Growth Portfolio",
    "description": "Focused on technology stocks",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Portfolio Holdings

**GET** `/portfolios/:id/holdings` 🔒

Get all holdings in a portfolio with current values.

**Parameters:**
- `id` (path) - Portfolio ID

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "symbol": "AAPL",
      "assetType": "stock",
      "quantity": 15,
      "averagePrice": 150.75,
      "currentPrice": 187.32,
      "currentValue": 2809.80,
      "costBasis": 2261.25,
      "gainLoss": 548.55,
      "gainLossPercent": 24.26,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

### Add Holding

**POST** `/portfolios/:id/holdings` 🔒

Add or update a holding in a portfolio.

**Parameters:**
- `id` (path) - Portfolio ID

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "assetType": "stock",
  "quantity": 10,
  "price": 185.50
}
```

**Response:** `201 Created`
```json
{
  "message": "Holding added successfully",
  "data": {
    "id": "uuid",
    "symbol": "AAPL",
    "assetType": "stock",
    "quantity": 10,
    "averagePrice": 185.50,
    ...
  }
}
```

---

## Strategy & Backtesting Endpoints

### Get All Strategies

**GET** `/strategies` 🔒

Get all strategies for the authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Momentum Strategy",
      "description": "Buy when price > 20-day SMA",
      "type": "momentum",
      "parameters": {
        "lookback": 20,
        "threshold": 1.02
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    ...
  ]
}
```

### Create Strategy

**POST** `/strategies` 🔒

Create a new trading strategy.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "My Momentum Strategy",
  "description": "Buy when price crosses above 20-day SMA",
  "type": "momentum",
  "parameters": {
    "lookback": 20,
    "threshold": 1.0
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Strategy created successfully",
  "data": {
    "id": "uuid",
    "name": "My Momentum Strategy",
    ...
  }
}
```

### Run Backtest

**POST** `/strategies/:id/backtest` 🔒

Run a backtest on a strategy.

**Parameters:**
- `id` (path) - Strategy ID

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "startDate": "2023-01-01",
  "endDate": "2024-01-01",
  "initialCapital": 10000
}
```

**Response:** `200 OK`
```json
{
  "message": "Backtest completed successfully",
  "data": {
    "id": "uuid",
    "strategyId": "uuid",
    "initialCapital": 10000,
    "finalCapital": 12500,
    "totalReturn": 2500,
    "totalReturnPercent": 25.0,
    "sharpeRatio": 1.5,
    "maxDrawdown": 8.5,
    "winRate": 65.5,
    "totalTrades": 45,
    "profitableTrades": 30,
    "averageWin": 125.50,
    "averageLoss": 85.20,
    "largestWin": 450.00,
    "largestLoss": 280.00,
    "trades": [...],
    "equityCurve": [...],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid input parameters"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** Rate limit info is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Caching

The API uses Redis caching for frequently accessed data:

- Stock quotes: 60 seconds
- Historical data: 5 minutes
- Market indices: 5 minutes
- Company overviews: 24 hours
- Search results: 1 hour

---

## WebSocket Support (Coming Soon)

Real-time updates for:
- Stock prices
- Portfolio values
- Trade executions
- Market alerts

---

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@example.com
- Documentation: [docs-url]

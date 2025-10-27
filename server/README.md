# Financial Market Software - Backend API

A comprehensive backend API for a financial market software platform with real-time market data, portfolio management, strategy backtesting, and more.

## Features

- 🔐 **User Authentication** - JWT-based authentication with secure password hashing
- 📊 **Real-time Market Data** - Stock quotes, market indices, cryptocurrencies, and forex
- 💼 **Portfolio Management** - Track investments, holdings, and transactions
- 📈 **Strategy Backtesting** - Test trading strategies with historical data
- 🔍 **Market Analysis** - Technical indicators and market insights
- ⚡ **Redis Caching** - Fast data retrieval with intelligent caching
- 🗄️ **PostgreSQL Database** - Reliable data persistence
- 🛡️ **Security** - Rate limiting, helmet middleware, and best practices

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **JWT** - Authentication
- **External APIs**:
  - Alpha Vantage (stocks, forex)
  - Finnhub (market indices)
  - CoinGecko (cryptocurrencies)

## Prerequisites

Before running this application, make sure you have:

- Node.js (v18 or higher)
- Redis (v6 or higher) - Optional but recommended
- PostgreSQL (v13 or higher) - **OPTIONAL** - Database is not required
- API Keys:
  - [Alpha Vantage](https://www.alphavantage.co/support/#api-key) (Free tier available)
  - [Finnhub](https://finnhub.io/) (Free tier available)
  - [CoinGecko](https://www.coingecko.com/en/api) (Free tier available)

> **Note:** The database is completely optional! The server will run without PostgreSQL. All market data comes from external APIs (Alpha Vantage, Finnhub, CoinGecko). Database is only needed for user features like portfolios and strategies.

## Installation

1. **Clone the repository and navigate to the server directory**

```bash
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up PostgreSQL database (OPTIONAL)**

The database is **optional**. If you want to use user features (portfolios, strategies), set up PostgreSQL:

```bash
# Create database
createdb financial_market_db

# Run the schema
psql -d financial_market_db -f src/config/schema.sql
```

If you skip this step, the server will run without a database and you can still access all market data endpoints.

4. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3010
NODE_ENV=development

# Database Configuration (OPTIONAL - comment out if not using PostgreSQL)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=financial_market_db
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password

# Redis Configuration (OPTIONAL)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Keys (REQUIRED)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
COINGECKO_API_KEY=your_coingecko_key

# CORS
CORS_ORIGIN=http://localhost:8080
```

> **Important:** To run without a database, simply do NOT set DB_USER and DB_PASSWORD in your .env file. The server will start successfully and all market data endpoints will work.

5. **Start Redis (OPTIONAL)**

```bash
# macOS (with Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows (WSL)
sudo service redis-server start
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3010` with hot reloading enabled.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Stocks

- `GET /api/stocks/quote/:symbol` - Get stock quote
- `GET /api/stocks/quotes?symbols=AAPL,MSFT,GOOGL` - Get multiple quotes
- `GET /api/stocks/history/:symbol` - Get historical data
- `GET /api/stocks/search?q=apple` - Search stocks
- `GET /api/stocks/overview/:symbol` - Get company overview
- `GET /api/stocks/indices` - Get market indices

### Cryptocurrencies

- `GET /api/crypto/top?limit=50` - Get top cryptocurrencies
- `GET /api/crypto/:id` - Get specific cryptocurrency
- `GET /api/crypto/:id/history?days=30` - Get historical data
- `GET /api/crypto/search?q=bitcoin` - Search cryptocurrencies
- `GET /api/crypto/global` - Get global crypto market data

### Currencies (Forex)

- `GET /api/currencies/major-pairs` - Get major currency pairs
- `GET /api/currencies/rate/:from/:to` - Get exchange rate
- `GET /api/currencies/history/:from/:to` - Get historical rates
- `GET /api/currencies/intraday/:from/:to` - Get intraday rates

### Portfolios

- `GET /api/portfolios` - Get all portfolios (protected)
- `POST /api/portfolios` - Create portfolio (protected)
- `GET /api/portfolios/:id` - Get portfolio (protected)
- `PUT /api/portfolios/:id` - Update portfolio (protected)
- `DELETE /api/portfolios/:id` - Delete portfolio (protected)
- `GET /api/portfolios/:id/holdings` - Get portfolio holdings (protected)
- `POST /api/portfolios/:id/holdings` - Add holding (protected)
- `DELETE /api/portfolios/:id/holdings/:holdingId` - Remove holding (protected)
- `GET /api/portfolios/:id/transactions` - Get transactions (protected)

### Strategies

- `GET /api/strategies` - Get all strategies (protected)
- `POST /api/strategies` - Create strategy (protected)
- `GET /api/strategies/:id` - Get strategy (protected)
- `PUT /api/strategies/:id` - Update strategy (protected)
- `DELETE /api/strategies/:id` - Delete strategy (protected)
- `POST /api/strategies/:id/backtest` - Run backtest (protected)
- `GET /api/strategies/:id/backtest-results` - Get backtest results (protected)

## API Request Examples

### Register User

```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get Stock Quote

```bash
curl http://localhost:3010/api/stocks/quote/AAPL
```

### Create Portfolio (with auth token)

```bash
curl -X POST http://localhost:3010/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Investment Portfolio",
    "description": "Long-term growth portfolio"
  }'
```

### Run Backtest

```bash
curl -X POST http://localhost:3010/api/strategies/:id/backtest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "symbol": "AAPL",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 10000
  }'
```

## Database Schema

The application uses the following main tables:

- `users` - User accounts
- `portfolios` - User portfolios
- `portfolio_holdings` - Holdings within portfolios
- `transactions` - Buy/sell transactions
- `strategies` - Trading strategies
- `backtest_results` - Backtest results and metrics
- `watchlists` - User watchlists
- `alerts` - Price alerts

See `src/config/schema.sql` for the complete schema.

## Caching Strategy

The application uses Redis for caching with the following TTLs:

- Stock quotes: 60 seconds
- Historical data: 5 minutes
- Market indices: 5 minutes
- Cryptocurrency data: 60 seconds
- Search results: 1 hour
- Company overviews: 24 hours

## Rate Limiting

Default rate limits:
- 100 requests per 15 minutes per IP address
- Configurable via environment variables

## Error Handling

The API uses standardized error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Security Features

- Helmet.js for security headers
- CORS configuration
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- SQL injection prevention with parameterized queries

## Performance Optimization

- Redis caching for frequently accessed data
- Database indexes on commonly queried fields
- Connection pooling for PostgreSQL
- Efficient query patterns

## Monitoring

Health check endpoint: `GET /health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67
}
```

## Troubleshooting

### Cannot connect to PostgreSQL

**Note:** PostgreSQL is **optional**. You don't need it to run the server. Market data endpoints will work without a database.

If you DO want to use PostgreSQL:

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection settings in .env
```

To disable database completely, simply don't set DB_USER and DB_PASSWORD in your .env file.

### Cannot connect to Redis

**Note:** Redis is **optional**. The server will run without it, but caching won't be available.

```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
```

### API rate limits exceeded

- Free tier API keys have limited requests
- Consider upgrading to paid plans for production
- Implement request queuing if needed

## Development

### Project Structure

```
server/
├── src/
│   ├── config/         # Database and Redis configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic and external APIs
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── .env.example        # Environment variables template
├── package.json
└── tsconfig.json
```

### Adding New Features

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add service logic in `src/services/`
4. Register routes in `src/index.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@example.com

## Roadmap

- [ ] WebSocket support for real-time updates
- [ ] More trading strategies
- [ ] Advanced technical indicators
- [ ] News sentiment analysis
- [ ] Machine learning predictions
- [ ] Paper trading mode
- [ ] Mobile app support
- [ ] Multi-user collaboration

---

Built with ❤️ for traders and investors

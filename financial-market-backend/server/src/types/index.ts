export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  region: string;
  lastUpdated: Date;
}

export interface CurrencyPair {
  symbol: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface Cryptocurrency {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  supply: number;
  lastUpdated: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioHolding {
  id: string;
  portfolioId: string;
  symbol: string;
  assetType: 'stock' | 'crypto' | 'currency';
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  assetType: 'stock' | 'crypto' | 'currency';
  transactionType: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  fees?: number;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'custom';
  parameters: Record<string, any>;
  status: 'active' | 'inactive' | 'backtesting';
  createdAt: Date;
  updatedAt: Date;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPercent: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
  createdAt: Date;
}

export interface BacktestTrade {
  date: Date;
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  pnl?: number;
}

export interface EquityPoint {
  date: Date;
  equity: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  relatedSymbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface PriceHistory {
  symbol: string;
  interval: '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M';
  data: PricePoint[];
}

export interface PricePoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  condition: 'above' | 'below' | 'percent_change';
  targetValue: number;
  currentValue?: number;
  isTriggered: boolean;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface MarketAnalysis {
  symbol: string;
  technicalIndicators: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    sma20: number;
    sma50: number;
    sma200: number;
    bollingerBands: { upper: number; middle: number; lower: number };
  };
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  score: number;
}

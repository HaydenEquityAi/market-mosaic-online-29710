# 🚀 Complete Modern Stack Integration Guide

## TradingView Charts + AI SDK + Convex

This guide shows you how to add cutting-edge features to your financial market software.

---

## 📊 Part 1: TradingView Lightweight Charts

### Installation

```bash
npm install lightweight-charts
```

### Basic Usage

```typescript
// src/components/charts/StockChart.tsx
import { TradingViewChart } from './TradingViewChart';
import { useEffect, useState } from 'react';
import { api } from '@/utils/api';

export function StockChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await api.get(`/stocks/history/${symbol}`);
      const chartData = response.data.data.data.map(point => ({
        time: new Date(point.timestamp).getTime() / 1000,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));
      setData(chartData);
    }
    fetchData();
  }, [symbol]);

  return (
    <div className="w-full h-[500px]">
      <TradingViewChart data={data} type="candlestick" />
    </div>
  );
}
```

### Advanced Chart with Indicators

```typescript
// src/components/charts/AdvancedChart.tsx
import { AdvancedTradingViewChart } from './AdvancedTradingViewChart';

export function AdvancedChart({ symbol }: { symbol: string }) {
  const [candlestickData, setCandlestickData] = useState([]);
  const [indicators, setIndicators] = useState({
    sma20: [],
    sma50: [],
    sma200: [],
  });

  // Fetch data and calculate indicators
  useEffect(() => {
    async function fetchData() {
      const response = await api.get(`/stocks/history/${symbol}`);
      const data = response.data.data.data;
      
      // Format candlestick data
      const candles = data.map(point => ({
        time: new Date(point.timestamp).getTime() / 1000,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      }));
      
      // Calculate SMA
      const sma20 = calculateSMA(data, 20);
      const sma50 = calculateSMA(data, 50);
      const sma200 = calculateSMA(data, 200);
      
      setCandlestickData(candles);
      setIndicators({ sma20, sma50, sma200 });
    }
    fetchData();
  }, [symbol]);

  return (
    <AdvancedTradingViewChart
      symbol={symbol}
      candlestickData={candlestickData}
      indicators={indicators}
      height={600}
    />
  );
}

function calculateSMA(data: any[], period: number) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, point) => acc + point.close, 0);
    sma.push({
      time: new Date(data[i].timestamp).getTime() / 1000,
      value: sum / period,
    });
  }
  return sma;
}
```

### Replace Your Existing Charts

Update `src/components/stocks/StockChart.tsx`:

```typescript
import { TradingViewChart } from '../charts/TradingViewChart';

export function StockChart({ symbol, name, currentPrice, volatility }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch data from your API
    async function loadData() {
      const history = await api.get(`/stocks/history/${symbol}`);
      const formatted = history.data.data.data.map(point => ({
        time: new Date(point.timestamp).getTime() / 1000,
        value: point.close,
      }));
      setChartData(formatted);
    }
    loadData();
  }, [symbol]);

  return (
    <div className="bg-card rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">{symbol}</h2>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
        </div>
      </div>
      
      <TradingViewChart 
        data={chartData} 
        type="line"
        height={400}
      />
    </div>
  );
}
```

---

## 🤖 Part 2: AI SDK Integration

### Installation

```bash
npm install openai ai
```

### Backend: Add AI Controller

```typescript
// server/src/controllers/ai.controller.ts
import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const analyzeStock = async (req: AuthRequest, res: Response) => {
  const { symbol } = req.params;

  try {
    // Fetch stock data
    const stockData = await marketDataService.getStockQuote(symbol);
    const historicalData = await marketDataService.getHistoricalData(symbol);

    if (!stockData || !historicalData) {
      throw new AppError('Unable to fetch stock data', 404);
    }

    // Get AI analysis
    const analysis = await aiService.analyzeStock(
      stockData,
      historicalData.data
    );

    res.json({ data: { analysis } });
  } catch (error) {
    throw new AppError('AI analysis failed', 500);
  }
};

export const optimizePortfolio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { portfolioId } = req.params;

  // Get portfolio and holdings
  const portfolio = await query(
    'SELECT * FROM portfolios WHERE id = $1 AND user_id = $2',
    [portfolioId, userId]
  );

  if (portfolio.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  const holdings = await query(
    'SELECT * FROM portfolio_holdings WHERE portfolio_id = $1',
    [portfolioId]
  );

  // Get AI optimization suggestions
  const optimization = await aiService.optimizePortfolio(
    portfolio.rows[0],
    holdings.rows
  );

  res.json({ data: optimization });
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    throw new AppError('Messages array is required', 400);
  }

  const response = await aiService.chatWithAssistant(messages);

  res.json({ data: { message: response } });
};

export const streamAnalysis = async (req: AuthRequest, res: Response) => {
  const { query } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const chunk of aiService.streamAnalysis(query)) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: 'Analysis failed' })}\n\n`);
    res.end();
  }
};
```

### Backend: Add AI Routes

```typescript
// server/src/routes/ai.routes.ts
import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

router.get('/analyze/:symbol', asyncHandler(aiController.analyzeStock));
router.post('/optimize/:portfolioId', asyncHandler(aiController.optimizePortfolio));
router.post('/chat', asyncHandler(aiController.chatWithAI));
router.post('/stream', asyncHandler(aiController.streamAnalysis));

export default router;
```

### Frontend: AI Chat Component

```typescript
// src/components/ai/AIChat.tsx
import { useState } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I can help you analyze stocks, optimize your portfolio, and answer market questions. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        messages: [...messages, userMessage],
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.data.message,
      }]);
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-lg p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-12'
                : 'bg-muted mr-12'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-muted-foreground">AI is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about stocks, portfolios, or strategies..."
        />
        <Button onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
```

### Frontend: Stock Analysis Panel

```typescript
// src/components/ai/StockAnalysis.tsx
import { useState } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';

export function StockAnalysis({ symbol }: { symbol: string }) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeStock = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/analyze/${symbol}`);
      setAnalysis(response.data.data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">AI Analysis for {symbol}</h3>
        <Button onClick={analyzeStock} disabled={loading}>
          {loading ? 'Analyzing...' : 'Get AI Analysis'}
        </Button>
      </div>

      {analysis && (
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔷 Part 3: Convex Integration (Optional but Awesome)

### Installation

```bash
npm install convex
npx convex dev
```

### Setup Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  portfolios: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  holdings: defineTable({
    portfolioId: v.id("portfolios"),
    symbol: v.string(),
    quantity: v.number(),
    averagePrice: v.number(),
    currentPrice: v.optional(v.number()),
    lastUpdated: v.number(),
  })
    .index("by_portfolio", ["portfolioId"])
    .index("by_symbol", ["symbol"]),

  watchlists: defineTable({
    userId: v.string(),
    name: v.string(),
    symbols: v.array(v.string()),
  }).index("by_user", ["userId"]),

  alerts: defineTable({
    userId: v.string(),
    symbol: v.string(),
    condition: v.union(v.literal("above"), v.literal("below")),
    targetPrice: v.number(),
    currentPrice: v.optional(v.number()),
    isActive: v.boolean(),
    isTriggered: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_symbol", ["symbol"]),
});
```

### Convex Functions

```typescript
// convex/portfolios.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get portfolios (real-time!)
export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Create portfolio
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("portfolios", args);
  },
});

// Get portfolio with holdings (real-time!)
export const getWithHoldings = query({
  args: { portfolioId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) return null;

    const holdings = await ctx.db
      .query("holdings")
      .withIndex("by_portfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const totalValue = holdings.reduce(
      (sum, h) => sum + (h.currentPrice || h.averagePrice) * h.quantity,
      0
    );

    return { ...portfolio, holdings, totalValue };
  },
});
```

### Use Convex in React

```typescript
// src/components/Portfolio.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Portfolio() {
  const portfolios = useQuery(api.portfolios.list, { 
    userId: currentUser.id 
  });
  
  const createPortfolio = useMutation(api.portfolios.create);

  // Real-time data - no polling needed!
  return (
    <div>
      {portfolios?.map(portfolio => (
        <PortfolioCard key={portfolio._id} portfolio={portfolio} />
      ))}
      
      <Button onClick={() => createPortfolio({
        userId: currentUser.id,
        name: "New Portfolio"
      })}>
        Create Portfolio
      </Button>
    </div>
  );
}
```

---

## 🎯 Complete Example: Modern Dashboard

```typescript
// src/pages/ModernDashboard.tsx
import { useState } from 'react';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { AIChat } from '@/components/ai/AIChat';
import { StockAnalysis } from '@/components/ai/StockAnalysis';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export function ModernDashboard() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  
  // Real-time portfolio from Convex
  const portfolio = useQuery(api.portfolios.getWithHoldings, {
    portfolioId: currentPortfolio.id,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chart */}
      <div className="lg:col-span-2">
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">{selectedStock}</h2>
          <AdvancedTradingViewChart symbol={selectedStock} />
        </div>

        {/* AI Analysis */}
        <div className="mt-6">
          <StockAnalysis symbol={selectedStock} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Portfolio (Real-time via Convex) */}
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio</h3>
          {portfolio && (
            <>
              <p className="text-2xl font-bold mb-4">
                ${portfolio.totalValue.toFixed(2)}
              </p>
              {portfolio.holdings.map(holding => (
                <div key={holding._id} className="py-2 border-b">
                  <div className="flex justify-between">
                    <span>{holding.symbol}</span>
                    <span>{holding.quantity} shares</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* AI Chat */}
        <AIChat />
      </div>
    </div>
  );
}
```

---

## 📦 Installation Summary

```bash
# TradingView Charts
npm install lightweight-charts

# AI Integration
npm install openai ai

# Convex (optional)
npm install convex
npx convex dev

# Add to backend .env
OPENAI_API_KEY=your_openai_key

# Start Convex (in separate terminal)
npx convex dev
```

---

## 🎯 Next Steps

1. **Install TradingView** - Upgrade your charts immediately
2. **Add AI features** - Start with stock analysis
3. **Try Convex** - See real-time magic on one feature
4. **Combine all three** - Build the ultimate financial app!

## 📚 Resources

- **TradingView Docs:** https://tradingview.github.io/lightweight-charts/
- **OpenAI API:** https://platform.openai.com/docs
- **Convex Docs:** https://docs.convex.dev
- **AI SDK:** https://sdk.vercel.ai/docs

---

Your app will be **10x better** with these additions! 🚀

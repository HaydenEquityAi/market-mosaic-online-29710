import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import marketDataService from '../services/marketData.service';

export const getStrategies = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  const result = await query(
    'SELECT id, name, description, type, parameters, status, created_at, updated_at FROM strategies WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.json({ data: result.rows });
};

export const getStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  const result = await query(
    'SELECT id, name, description, type, parameters, status, created_at, updated_at FROM strategies WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Strategy not found', 404);
  }

  res.json({ data: result.rows[0] });
};

export const createStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { name, description, type, parameters } = req.body;

  if (!name || !type || !parameters) {
    throw new AppError('Name, type, and parameters are required', 400);
  }

  const validTypes = ['momentum', 'mean_reversion', 'breakout', 'custom'];
  if (!validTypes.includes(type)) {
    throw new AppError('Invalid strategy type', 400);
  }

  const result = await query(
    'INSERT INTO strategies (user_id, name, description, type, parameters) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, name, description || null, type, JSON.stringify(parameters)]
  );

  res.status(201).json({
    message: 'Strategy created successfully',
    data: result.rows[0],
  });
};

export const updateStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, description, type, parameters, status } = req.body;

  const result = await query(
    'UPDATE strategies SET name = $1, description = $2, type = $3, parameters = $4, status = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
    [name, description || null, type, JSON.stringify(parameters), status, id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Strategy not found', 404);
  }

  res.json({
    message: 'Strategy updated successfully',
    data: result.rows[0],
  });
};

export const deleteStrategy = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  const result = await query(
    'DELETE FROM strategies WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Strategy not found', 404);
  }

  res.json({ message: 'Strategy deleted successfully' });
};

export const runBacktest = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { symbol, startDate, endDate, initialCapital = 10000 } = req.body;

  if (!symbol || !startDate || !endDate) {
    throw new AppError('Symbol, start date, and end date are required', 400);
  }

  // Verify strategy belongs to user
  const strategyResult = await query(
    'SELECT * FROM strategies WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (strategyResult.rows.length === 0) {
    throw new AppError('Strategy not found', 404);
  }

  const strategy = strategyResult.rows[0];

  // Update strategy status
  await query('UPDATE strategies SET status = $1 WHERE id = $2', ['backtesting', id]);

  try {
    // Get historical data
    const historicalData = await marketDataService.getHistoricalData(symbol, '1d', 'full');

    if (!historicalData) {
      throw new AppError('Unable to fetch historical data', 503);
    }

    // Filter data by date range
    const filteredData = historicalData.data.filter((point) => {
      const date = new Date(point.timestamp);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    if (filteredData.length === 0) {
      throw new AppError('No data available for the specified date range', 400);
    }

    // Run backtest simulation
    const backtestResult = await simulateStrategy(
      strategy,
      filteredData,
      initialCapital
    );

    // Save backtest result
    const result = await query(
      `INSERT INTO backtest_results 
      (strategy_id, start_date, end_date, initial_capital, final_capital, total_return, 
      total_return_percent, sharpe_ratio, max_drawdown, win_rate, total_trades, 
      profitable_trades, average_win, average_loss, largest_win, largest_loss, trades, equity_curve) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
      RETURNING *`,
      [
        id,
        startDate,
        endDate,
        backtestResult.initialCapital,
        backtestResult.finalCapital,
        backtestResult.totalReturn,
        backtestResult.totalReturnPercent,
        backtestResult.sharpeRatio,
        backtestResult.maxDrawdown,
        backtestResult.winRate,
        backtestResult.totalTrades,
        backtestResult.profitableTrades,
        backtestResult.averageWin,
        backtestResult.averageLoss,
        backtestResult.largestWin,
        backtestResult.largestLoss,
        JSON.stringify(backtestResult.trades),
        JSON.stringify(backtestResult.equityCurve),
      ]
    );

    // Update strategy status back to inactive
    await query('UPDATE strategies SET status = $1 WHERE id = $2', ['inactive', id]);

    res.json({
      message: 'Backtest completed successfully',
      data: result.rows[0],
    });
  } catch (error) {
    // Update strategy status back to inactive on error
    await query('UPDATE strategies SET status = $1 WHERE id = $2', ['inactive', id]);
    throw error;
  }
};

export const getBacktestResults = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  // Verify strategy belongs to user
  const strategyResult = await query(
    'SELECT id FROM strategies WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (strategyResult.rows.length === 0) {
    throw new AppError('Strategy not found', 404);
  }

  const result = await query(
    'SELECT * FROM backtest_results WHERE strategy_id = $1 ORDER BY created_at DESC',
    [id]
  );

  res.json({ data: result.rows });
};

// Simple momentum strategy simulation
async function simulateStrategy(strategy: any, data: any[], initialCapital: number) {
  const parameters = strategy.parameters;
  let capital = initialCapital;
  let position = 0;
  let positionSize = 0;
  const trades: any[] = [];
  const equityCurve: any[] = [];

  let wins = 0;
  let losses = 0;
  let winAmount = 0;
  let lossAmount = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let peakEquity = initialCapital;
  let maxDrawdown = 0;

  for (let i = parameters.lookback || 20; i < data.length; i++) {
    const currentPrice = data[i].close;
    const pastPrices = data.slice(i - (parameters.lookback || 20), i).map((d) => d.close);
    const sma = pastPrices.reduce((a, b) => a + b, 0) / pastPrices.length;

    // Simple momentum: buy when price > SMA, sell when price < SMA
    if (strategy.type === 'momentum') {
      if (position === 0 && currentPrice > sma) {
        // Buy signal
        position = 1;
        positionSize = capital / currentPrice;
        trades.push({
          date: data[i].timestamp,
          symbol: 'SYMBOL',
          action: 'buy',
          quantity: positionSize,
          price: currentPrice,
        });
      } else if (position === 1 && currentPrice < sma) {
        // Sell signal
        const pnl = positionSize * currentPrice - capital;
        capital = positionSize * currentPrice;

        trades.push({
          date: data[i].timestamp,
          symbol: 'SYMBOL',
          action: 'sell',
          quantity: positionSize,
          price: currentPrice,
          pnl,
        });

        if (pnl > 0) {
          wins++;
          winAmount += pnl;
          largestWin = Math.max(largestWin, pnl);
        } else {
          losses++;
          lossAmount += Math.abs(pnl);
          largestLoss = Math.min(largestLoss, pnl);
        }

        position = 0;
        positionSize = 0;
      }
    }

    // Calculate current equity
    const currentEquity = position === 1 ? positionSize * currentPrice : capital;
    equityCurve.push({
      date: data[i].timestamp,
      equity: currentEquity,
    });

    // Track drawdown
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }
    const drawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  // Close any open position at the end
  if (position === 1) {
    const finalPrice = data[data.length - 1].close;
    capital = positionSize * finalPrice;
  }

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const averageWin = wins > 0 ? winAmount / wins : 0;
  const averageLoss = losses > 0 ? lossAmount / losses : 0;

  // Calculate Sharpe ratio (simplified)
  const returns = equityCurve.map((point, i) => {
    if (i === 0) return 0;
    return (point.equity - equityCurve[i - 1].equity) / equityCurve[i - 1].equity;
  });
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    initialCapital,
    finalCapital: capital,
    totalReturn: capital - initialCapital,
    totalReturnPercent: ((capital - initialCapital) / initialCapital) * 100,
    sharpeRatio,
    maxDrawdown,
    winRate,
    totalTrades,
    profitableTrades: wins,
    averageWin,
    averageLoss,
    largestWin,
    largestLoss,
    trades,
    equityCurve,
  };
}

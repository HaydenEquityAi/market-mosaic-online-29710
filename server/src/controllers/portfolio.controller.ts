import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import marketDataService from '../services/marketData.service';
import cryptoService from '../services/crypto.service';
import currencyService from '../services/currency.service';

// ===== In-memory guest portfolio store =====
type GuestHolding = {
  id: string;
  symbol: string;
  asset_type: 'stock' | 'crypto' | 'currency';
  quantity: number;
  average_price: number;
  created_at: string;
  updated_at: string;
};

const guestPortfolioId = 'guest-default';
const guestState: { holdings: GuestHolding[] } = { holdings: [] };

function ensureGuestPortfolio(): void {
  // No-op for now; structure is pre-initialized
}

function nowIso(): string {
  return new Date().toISOString();
}

export const getPortfolios = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';

  const result = await query(
    'SELECT id, name, description, created_at, updated_at FROM portfolios WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  res.json({ data: result.rows });
};

export const getPortfolio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;

  const result = await query(
    'SELECT id, name, description, created_at, updated_at FROM portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  res.json({ data: result.rows[0] });
};

export const createPortfolio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { name, description } = req.body;

  if (!name) {
    throw new AppError('Portfolio name is required', 400);
  }

  const result = await query(
    'INSERT INTO portfolios (user_id, name, description) VALUES ($1, $2, $3) RETURNING id, name, description, created_at, updated_at',
    [userId, name, description || null]
  );

  res.status(201).json({
    message: 'Portfolio created successfully',
    data: result.rows[0],
  });
};

export const updatePortfolio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;
  const { name, description } = req.body;

  const result = await query(
    'UPDATE portfolios SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING id, name, description, updated_at',
    [name, description || null, id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  res.json({
    message: 'Portfolio updated successfully',
    data: result.rows[0],
  });
};

export const deletePortfolio = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;

  const result = await query(
    'DELETE FROM portfolios WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  res.json({ message: 'Portfolio deleted successfully' });
};

export const getPortfolioHoldings = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;

  // Guest fallback when no id provided
  if (!id) {
    ensureGuestPortfolio();

    // Enrich with prices similar to DB-backed path
    const enrichedHoldings = await Promise.all(
      guestState.holdings.map(async (holding) => {
        let currentPrice = 0;
        try {
          if (holding.asset_type === 'stock') {
            const quote = await marketDataService.getStockQuote(holding.symbol);
            currentPrice = quote?.price || 0;
          } else if (holding.asset_type === 'crypto') {
            const crypto = await cryptoService.getCrypto(holding.symbol.toLowerCase());
            currentPrice = crypto?.price || 0;
          } else if (holding.asset_type === 'currency') {
            const [from, to] = holding.symbol.split('/');
            const pair = await currencyService.getExchangeRate(from, to);
            currentPrice = pair?.rate || 0;
          }
        } catch (error) {
          console.error(`Error fetching current price for ${holding.symbol}:`, error);
        }

        const currentValue = currentPrice * holding.quantity;
        const costBasis = holding.average_price * holding.quantity;
        const gainLoss = currentValue - costBasis;
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

        return {
          ...holding,
          currentPrice,
          currentValue,
          costBasis,
          gainLoss,
          gainLossPercent,
        } as any;
      })
    );

    return res.json({ data: enrichedHoldings });
  }

  // Verify portfolio belongs to user
  const portfolioResult = await query(
    'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  const holdingsResult = await query(
    'SELECT id, symbol, asset_type, quantity, average_price, created_at, updated_at FROM portfolio_holdings WHERE portfolio_id = $1',
    [id]
  );

  const holdings = holdingsResult.rows;

  // Enrich with current prices
  const enrichedHoldings = await Promise.all(
    holdings.map(async (holding) => {
      let currentPrice = 0;

      try {
        if (holding.asset_type === 'stock') {
          const quote = await marketDataService.getStockQuote(holding.symbol);
          currentPrice = quote?.price || 0;
        } else if (holding.asset_type === 'crypto') {
          const crypto = await cryptoService.getCrypto(holding.symbol.toLowerCase());
          currentPrice = crypto?.price || 0;
        } else if (holding.asset_type === 'currency') {
          const [from, to] = holding.symbol.split('/');
          const pair = await currencyService.getExchangeRate(from, to);
          currentPrice = pair?.rate || 0;
        }
      } catch (error) {
        console.error(`Error fetching current price for ${holding.symbol}:`, error);
      }

      const currentValue = currentPrice * parseFloat(holding.quantity);
      const costBasis = parseFloat(holding.average_price) * parseFloat(holding.quantity);
      const gainLoss = currentValue - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return {
        ...holding,
        currentPrice,
        currentValue,
        costBasis,
        gainLoss,
        gainLossPercent,
      };
    })
  );

  res.json({ data: enrichedHoldings });
};

export const addHolding = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;
  const { symbol, assetType, quantity, price } = req.body;

  if (!symbol || !assetType || !quantity || !price) {
    throw new AppError('Symbol, asset type, quantity, and price are required', 400);
  }

  // Guest path when no id provided
  if (!id) {
    ensureGuestPortfolio();

    const existing = guestState.holdings.find(
      (h) => h.symbol.toUpperCase() === symbol.toUpperCase() && h.asset_type === assetType
    );

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    let saved: GuestHolding;

    if (existing) {
      const totalQty = existing.quantity + qty;
      const newAverage = (existing.quantity * existing.average_price + qty * prc) / totalQty;
      existing.quantity = totalQty;
      existing.average_price = newAverage;
      existing.updated_at = nowIso();
      saved = existing;
    } else {
      const created: GuestHolding = {
        id: Date.now().toString(),
        symbol: symbol.toUpperCase(),
        asset_type: assetType,
        quantity: qty,
        average_price: prc,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      guestState.holdings.push(created);
      saved = created;
    }

    return res.status(201).json({
      message: 'Holding added successfully',
      data: saved,
    });
  }

  // Verify portfolio belongs to user
  const portfolioResult = await query(
    'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  // Check if holding already exists
  const existingHolding = await query(
    'SELECT id, quantity, average_price FROM portfolio_holdings WHERE portfolio_id = $1 AND symbol = $2 AND asset_type = $3',
    [id, symbol.toUpperCase(), assetType]
  );

  let result;

  if (existingHolding.rows.length > 0) {
    // Update existing holding (weighted average)
    const existing = existingHolding.rows[0];
    const existingQty = parseFloat(existing.quantity);
    const existingAvg = parseFloat(existing.average_price);
    const newQty = parseFloat(quantity);
    const newPrice = parseFloat(price);

    const totalQty = existingQty + newQty;
    const newAverage = (existingQty * existingAvg + newQty * newPrice) / totalQty;

    result = await query(
      'UPDATE portfolio_holdings SET quantity = $1, average_price = $2 WHERE id = $3 RETURNING *',
      [totalQty, newAverage, existing.id]
    );
  } else {
    // Create new holding
    result = await query(
      'INSERT INTO portfolio_holdings (portfolio_id, symbol, asset_type, quantity, average_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, symbol.toUpperCase(), assetType, quantity, price]
    );
  }

  // Record transaction
  await query(
    'INSERT INTO transactions (portfolio_id, symbol, asset_type, transaction_type, quantity, price, total_amount, transaction_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, symbol.toUpperCase(), assetType, 'buy', quantity, price, parseFloat(quantity) * parseFloat(price), new Date()]
  );

  res.status(201).json({
    message: 'Holding added successfully',
    data: result.rows[0],
  });
};

export const removeHolding = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id, holdingId } = req.params;

  // Guest path when no id provided
  if (!id) {
    ensureGuestPortfolio();
    const before = guestState.holdings.length;
    const afterList = guestState.holdings.filter((h) => h.id !== holdingId);
    if (afterList.length === before) {
      throw new AppError('Holding not found', 404);
    }
    guestState.holdings.length = 0;
    guestState.holdings.push(...afterList);
    return res.json({ message: 'Holding removed successfully' });
  }

  // Verify portfolio belongs to user
  const portfolioResult = await query(
    'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  const result = await query(
    'DELETE FROM portfolio_holdings WHERE id = $1 AND portfolio_id = $2 RETURNING *',
    [holdingId, id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Holding not found', 404);
  }

  res.json({ message: 'Holding removed successfully' });
};

export const getPortfolioTransactions = async (req: AuthRequest, res: Response) => {
  const userId = req.userId || 'test-user';
  const { id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  // Verify portfolio belongs to user
  const portfolioResult = await query(
    'SELECT id FROM portfolios WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (portfolioResult.rows.length === 0) {
    throw new AppError('Portfolio not found', 404);
  }

  const result = await query(
    'SELECT * FROM transactions WHERE portfolio_id = $1 ORDER BY transaction_date DESC LIMIT $2 OFFSET $3',
    [id, limit, offset]
  );

  res.json({ data: result.rows });
};

// ===== Guest-friendly controller wrappers (no :id required) =====
export const getDefaultHoldings = async (req: AuthRequest, res: Response) => {
  // Reuse getPortfolioHoldings with no id to trigger guest path
  (req as any).params = { ...(req as any).params };
  delete (req as any).params.id;
  return getPortfolioHoldings(req, res);
};

export const addDefaultHolding = async (req: AuthRequest, res: Response) => {
  (req as any).params = { ...(req as any).params };
  delete (req as any).params.id;
  return addHolding(req, res);
};

export const removeDefaultHolding = async (req: AuthRequest, res: Response) => {
  (req as any).params = { holdingId: (req as any).params?.holdingId };
  return removeHolding(req, res);
};

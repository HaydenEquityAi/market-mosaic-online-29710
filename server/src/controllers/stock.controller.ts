import { Request, Response } from 'express';
import marketDataService from '../services/marketData.service';
import polygonService from '../services/polygon.service';
import { AppError } from '../middleware/errorHandler';

export const getStockQuote = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  let quote = null;

  // Try Polygon first
  try {
    console.log('Attempting Polygon API for quote:', symbol);
    quote = await polygonService.getStockQuote(symbol.toUpperCase());
    console.log('Polygon API success for:', symbol);
  } catch (polygonError) {
    console.log('Polygon API failed, trying Alpha Vantage for:', symbol);
    try {
      quote = await marketDataService.getStockQuote(symbol.toUpperCase());
      console.log('Alpha Vantage API success for:', symbol);
    } catch (alphaError) {
      console.error('Both APIs failed for:', symbol);
      throw new AppError('Stock not found', 404);
    }
  }

  if (!quote) {
    throw new AppError('Stock not found', 404);
  }

  res.json({ data: quote });
};

export const getMultipleQuotes = async (req: Request, res: Response) => {
  const { symbols } = req.query;

  if (!symbols || typeof symbols !== 'string') {
    throw new AppError('Symbols query parameter is required', 400);
  }

  const symbolArray = symbols.split(',').map((s) => s.trim().toUpperCase());

  let quotes = [];

  // Try Polygon first
  try {
    console.log('Attempting Polygon API for multiple quotes');
    quotes = await polygonService.getMultipleQuotes(symbolArray);
    console.log('Polygon API success, got', quotes.length, 'quotes');
  } catch (polygonError) {
    console.log('Polygon API failed, trying Alpha Vantage');
    try {
      quotes = await marketDataService.getStockQuotes(symbolArray);
      console.log('Alpha Vantage API success, got', quotes.length, 'quotes');
    } catch (alphaError) {
      console.error('Both APIs failed');
      quotes = [];
    }
  }

  res.json({ data: quotes });
};

export const getHistoricalData = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const { interval, outputSize } = req.query;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  const validIntervals = ['1m', '5m', '15m', '1h', '1d', '1w', '1M'];
  const selectedInterval = interval && validIntervals.includes(interval as string)
    ? (interval as any)
    : '1d';

  const selectedOutputSize = outputSize === 'full' ? 'full' : 'compact';

  // Calculate date range for Polygon (last 30 days if not specified)
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let data = null;

  // Try Polygon first (for day intervals)
  if (selectedInterval === '1d') {
    try {
      console.log('Attempting Polygon API for historical data:', symbol);
      data = await polygonService.getHistoricalData(symbol.toUpperCase(), from, to);
      console.log('Polygon API success for historical data:', symbol);
    } catch (polygonError) {
      console.log('Polygon API failed, trying Alpha Vantage for:', symbol);
    }
  }

  // Fallback to Alpha Vantage
  if (!data) {
    try {
      data = await marketDataService.getHistoricalData(
        symbol.toUpperCase(),
        selectedInterval,
        selectedOutputSize
      );
      console.log('Alpha Vantage API success for historical data:', symbol);
    } catch (alphaError) {
      console.error('Both APIs failed for historical data:', symbol);
      throw new AppError('Historical data not found', 404);
    }
  }

  if (!data) {
    throw new AppError('Historical data not found', 404);
  }

  res.json({ data });
};

export const searchStocks = async (req: Request, res: Response) => {
  // Support both 'q' and 'keywords' query parameters
  const query = (req.query.q || req.query.keywords) as string;
  
  console.log('Search query received:', query);
  console.log('All query params:', req.query);

  // If no query provided, return empty array instead of error
  if (!query || typeof query !== 'string') {
    console.log('No query provided, returning empty array');
    return res.json({ data: [] });
  }

  let results = [];

  // Try Polygon first
  try {
    console.log('Attempting Polygon API for search:', query);
    results = await polygonService.searchStocks(query);
    console.log(`Polygon API success, found ${results.length} results`);
  } catch (polygonError) {
    console.log('Polygon API failed, trying Alpha Vantage for:', query);
    try {
      results = await marketDataService.searchStocks(query);
      console.log(`Alpha Vantage API success, found ${results.length} results`);
    } catch (alphaError) {
      console.error('Both APIs failed for search:', query);
      results = [];
    }
  }

  res.json({ data: results });
};

export const getCompanyOverview = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol) {
    throw new AppError('Symbol is required', 400);
  }

  let overview = null;

  // Try Polygon first
  try {
    console.log('Attempting Polygon API for company details:', symbol);
    overview = await polygonService.getCompanyDetails(symbol.toUpperCase());
    console.log('Polygon API success for company details:', symbol);
  } catch (polygonError) {
    console.log('Polygon API failed, trying Alpha Vantage for:', symbol);
    try {
      overview = await marketDataService.getCompanyOverview(symbol.toUpperCase());
      console.log('Alpha Vantage API success for company details:', symbol);
    } catch (alphaError) {
      console.error('Both APIs failed for company details:', symbol);
      throw new AppError('Company overview not found', 404);
    }
  }

  if (!overview) {
    throw new AppError('Company overview not found', 404);
  }

  res.json({ data: overview });
};

export const getMarketIndices = async (req: Request, res: Response) => {
  const indices = await marketDataService.getMarketIndices();

  res.json({ data: indices });
};

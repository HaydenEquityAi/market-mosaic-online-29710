
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Trash2, Search, X, Wifi, RefreshCw } from 'lucide-react';
import { LivePriceDisplay } from '@/components/ui/LivePriceDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { portfolioApi, stocksApi } from '@/services/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, formatPercent, formatShares } from '@/utils/formatters';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Holding {
  id: string;
  symbol: string;
  assetType: string;
  quantity: number;
  price: number;
}

interface StockData {
  symbol: string;
  price: number;
  changePercent?: number;
  name?: string;
}

const Portfolio = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [averageCost, setAverageCost] = useState('');
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch portfolios list
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: portfolioApi.getAll,
    retry: 3,
  });

  // Auto-create portfolio if none exists
  const createPortfolioMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      portfolioApi.create(data.name),
    onSuccess: (data) => {
      console.log('Portfolio created:', data);
      setPortfolioId(data.id?.toString() || '1');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast({
        title: 'Portfolio created',
        description: 'A default portfolio has been created for you',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create portfolio:', error);
      toast({
        title: 'Error',
        description: 'Using guest portfolio (no login required).',
        variant: 'destructive',
      });
      // Use guest portfolio (no ID)
      setPortfolioId(null);
    },
  });

  // Set portfolio ID from fetched portfolios
  React.useEffect(() => {
    if (portfolios && portfolios.length > 0) {
      const firstPortfolio = portfolios[0];
      setPortfolioId(firstPortfolio.id?.toString() || '1');
      console.log('Using portfolio:', firstPortfolio);
    } else if (portfolios && portfolios.length === 0 && !portfoliosLoading) {
      // No portfolios exist, create one
      console.log('No portfolios found, creating default portfolio...');
      createPortfolioMutation.mutate({ 
        name: 'My Portfolio', 
        description: 'Main investment portfolio' 
      });
    }
  }, [portfolios, portfoliosLoading]);

  // Fetch holdings (only when we have a portfolio ID)
  const { data: holdings = [], isLoading: holdingsLoading, error } = useQuery({
    queryKey: ['portfolio', portfolioId ?? 'guest', 'holdings'],
    queryFn: () => (portfolioId ? portfolioApi.getHoldings(portfolioId) : portfolioApi.getGuestHoldings()),
    enabled: true,
    refetchInterval: 60000,
    retry: 3,
  });

  // Fetch current stock prices for all holdings - 60 second refresh
  const symbols = holdings.map((h: Holding) => h.symbol);
  const { data: stockDataMap = {}, isFetching: pricesFetching, dataUpdatedAt: pricesUpdatedAt } = useQuery({
    queryKey: ['stock-quotes', symbols],
    queryFn: async () => {
      if (symbols.length === 0) return {};
      const quotes = await stocksApi.getMultipleQuotes(symbols);
      return Object.fromEntries(quotes.map((s: StockData) => [s.symbol, s]));
    },
    enabled: symbols.length > 0,
    refetchInterval: 60000, // 60 seconds for portfolio
    staleTime: 50000,
  });

  // Search stocks for dialog
  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await stocksApi.searchStocks(query);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      searchStocks(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (!holdings.length) return null;

    const portfolioItems = holdings.map((holding: Holding) => {
      const stock: StockData = stockDataMap[holding.symbol];
      const currentPrice = stock?.price || holding.price;
      const marketValue = holding.quantity * currentPrice;
      const costBasis = holding.quantity * holding.price;
      const gainLoss = marketValue - costBasis;
      const gainPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return {
        ...holding,
        currentPrice,
        marketValue,
        costBasis,
        gainLoss,
        gainPercent,
        name: stock?.name || holding.symbol,
      };
    });

    const totalValue = portfolioItems.reduce((sum, item) => sum + item.marketValue, 0);
    const totalCost = portfolioItems.reduce((sum, item) => sum + item.costBasis, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    const bestPerformer = [...portfolioItems].sort((a, b) => b.gainPercent - a.gainPercent)[0];
    const worstPerformer = [...portfolioItems].sort((a, b) => a.gainPercent - b.gainPercent)[0];

    return {
      totalValue,
      totalGainLoss,
      totalGainPercent,
      bestPerformer,
      worstPerformer,
      items: portfolioItems,
    };
  }, [holdings, stockDataMap]);

  // Add holding mutation
  const addHoldingMutation = useMutation({
    mutationFn: async (data: { symbol: string; quantity: number; averageCost: number }) => {
      return portfolioId
        ? portfolioApi.addHolding(portfolioId, data.symbol, data.quantity, data.averageCost)
        : portfolioApi.addGuestHolding(data.symbol, data.quantity, data.averageCost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId, 'holdings'] });
      toast({
        title: 'Stock added',
        description: 'Successfully added stock to portfolio',
      });
      setIsDialogOpen(false);
      setSelectedStock(null);
      setQuantity('');
      setAverageCost('');
      setSearchQuery('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add stock',
        variant: 'destructive',
      });
    },
  });

  // Delete holding mutation
  const deleteHoldingMutation = useMutation({
    mutationFn: async (holdingId: string) => {
      return portfolioId
        ? portfolioApi.removeHolding(portfolioId, holdingId)
        : portfolioApi.removeGuestHolding(holdingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId, 'holdings'] });
      toast({
        title: 'Stock removed',
        description: 'Successfully removed stock from portfolio',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to remove stock',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity || !averageCost) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    addHoldingMutation.mutate({
      symbol: selectedStock.symbol,
      quantity: parseInt(quantity),
      averageCost: parseFloat(averageCost),
    });
  };

  const handleDelete = (holdingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this holding?')) {
      deleteHoldingMutation.mutate(holdingId);
    }
  };

  const handleRowClick = (symbol: string) => {
    navigate(`/stocks/${symbol}`);
  };

  // Pie chart data
  const pieData = portfolioMetrics?.items.map((item) => ({
    name: item.symbol,
    value: item.marketValue,
  })) || [];

  return (
    <PageLayout title="Portfolio">
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold">My Portfolio</h1>
              {pricesFetching ? (
                <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm sm:text-base text-muted-foreground">Track your investments in real-time</p>
              {pricesUpdatedAt && (
                <span className="text-xs text-muted-foreground">
                  • Updated {Math.floor((Date.now() - pricesUpdatedAt) / 1000)}s ago
                </span>
              )}
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
                <Plus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Add Stock</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add Stock to Portfolio</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Stock Search */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm sm:text-base">Search Stock</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedStock(null);
                      }}
                      className="pl-9 h-11 sm:h-10"
                    />
                  </div>
                  {searchResults.length > 0 && !selectedStock && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedStock(result)}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 min-h-[44px]"
                        >
                          <div className="font-semibold text-sm">{result.symbol}</div>
                          <div className="text-sm text-muted-foreground">{result.name}</div>
                          {result.type && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {result.type}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedStock && (
                    <div className="flex items-center justify-between p-3 bg-accent rounded-md min-h-[44px]">
                      <div>
                        <div className="font-semibold text-sm">{selectedStock.symbol}</div>
                        <div className="text-sm text-muted-foreground truncate">{selectedStock.name}</div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStock(null);
                          setSearchQuery('');
                        }}
                        className="h-11 w-11"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm sm:text-base">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Number of shares"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    step="1"
                    className="h-11 sm:h-10"
                  />
                </div>

                {/* Average Cost */}
                <div className="space-y-2">
                  <Label htmlFor="averageCost" className="text-sm sm:text-base">Average Purchase Price ($)</Label>
                  <Input
                    id="averageCost"
                    type="number"
                    placeholder="Purchase price per share"
                    value={averageCost}
                    onChange={(e) => setAverageCost(e.target.value)}
                    min="0"
                    step="0.01"
                    className="h-11 sm:h-10"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addHoldingMutation.isPending} className="w-full sm:w-auto min-h-[44px]">
                    {addHoldingMutation.isPending ? 'Adding...' : 'Add to Portfolio'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {(portfoliosLoading || createPortfolioMutation.isPending || !portfolioId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted w-1/2 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted w-3/4 rounded mb-2" />
                  <div className="h-4 bg-muted w-1/2 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        {!holdingsLoading && portfolioMetrics && portfolioMetrics.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                  {formatCurrency(portfolioMetrics.totalValue || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Gain/Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    'text-muted-foreground'
                  )}>
                    {(portfolioMetrics.totalGainLoss || 0) >= 0 ? '+' : ''}
                  {formatCurrency(portfolioMetrics.totalGainLoss || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Gain/Loss %
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    'text-muted-foreground'
                  )}>
                    {(portfolioMetrics.totalGainPercent || 0) >= 0 ? '+' : ''}
                  {formatPercent(portfolioMetrics.totalGainPercent || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Best Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {portfolioMetrics.bestPerformer?.symbol || 'N/A'}
                  </div>
                  <div className="text-sm text-green-500">
                  {formatPercent(portfolioMetrics.bestPerformer?.gainPercent || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Worst Performer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {portfolioMetrics.worstPerformer?.symbol || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                  {formatPercent(portfolioMetrics.worstPerformer?.gainPercent || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Holdings</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Symbol</th>
                          <th className="hidden md:table-cell text-left py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Name</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Shares</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Price</th>
                          <th className="hidden lg:table-cell text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Current</th>
                          <th className="hidden lg:table-cell text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Value</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">G/L</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">%</th>
                          <th className="text-right py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolioMetrics.items.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => handleRowClick(item.symbol)}
                            className="border-b hover:bg-accent cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm">{item.symbol}</td>
                            <td className="hidden md:table-cell py-3 px-3 sm:px-4 text-xs sm:text-sm truncate max-w-[120px]">{item.name}</td>
                            <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">{item.quantity || 0}</td>
                            <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">{formatCurrency(item.price || 0)}</td>
                            <td className="hidden lg:table-cell py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">{formatCurrency(item.currentPrice || 0)}</td>
                            <td className="hidden lg:table-cell py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">{formatCurrency(item.marketValue || 0)}</td>
                            <td className={cn(
                              "py-3 px-3 sm:px-4 text-right font-medium text-xs sm:text-sm",
                              'text-muted-foreground'
                            )}>
                              {formatCurrency(item.gainLoss || 0)}
                            </td>
                            <td className={cn(
                              "py-3 px-3 sm:px-4 text-right font-medium text-xs sm:text-sm",
                              'text-muted-foreground'
                            )}>
                              {formatPercent(item.gainPercent || 0)}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDelete(item.id, e)}
                                className="hover:text-destructive h-10 w-10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent ? (percent * 100).toFixed(0) : '0')}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!holdingsLoading && (!portfolioMetrics || portfolioMetrics.items.length === 0) && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Your portfolio is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Track your investments and watch them grow. Add your first stock to get started.
              </p>
              <Button
                size="lg"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Stock
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-destructive mb-4">
                Failed to load portfolio data. Please try again.
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId, 'holdings'] })}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Portfolio;

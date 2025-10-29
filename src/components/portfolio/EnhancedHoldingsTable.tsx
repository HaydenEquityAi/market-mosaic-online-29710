
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, MoreHorizontal, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Holding {
  ticker: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  gainLoss: number;
  gainLossPercent: number;
  allocation: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  dayChange: number;
}

const mockHoldings: Holding[] = [
  {
    ticker: 'AMD',
    shares: 120,
    costBasis: 240,
    currentPrice: 262,
    gainLoss: 2640,
    gainLossPercent: 9.1,
    allocation: 77,
    sentiment: 'bullish',
    dayChange: 3.2
  },
  {
    ticker: 'ARLP',
    shares: 400,
    costBasis: 21,
    currentPrice: 23.4,
    gainLoss: 960,
    gainLossPercent: 11.4,
    allocation: 14,
    sentiment: 'neutral',
    dayChange: 0.8
  },
  {
    ticker: 'NVDA',
    shares: 25,
    costBasis: 820,
    currentPrice: 875,
    gainLoss: 1375,
    gainLossPercent: 6.7,
    allocation: 7,
    sentiment: 'bullish',
    dayChange: 2.1
  },
  {
    ticker: 'PLTR',
    shares: 150,
    costBasis: 18,
    currentPrice: 16.5,
    gainLoss: -225,
    gainLossPercent: -8.3,
    allocation: 2,
    sentiment: 'bearish',
    dayChange: -1.2
  }
];

export function EnhancedHoldingsTable() {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            🟢 Bullish
          </Badge>
        );
      case 'bearish':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            🔴 Bearish
          </Badge>
        );
      case 'neutral':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            🟡 Neutral
          </Badge>
        );
      default:
        return null;
    }
  };
  
  const totalValue = mockHoldings.reduce(
    (sum, holding) => sum + (holding.shares * holding.currentPrice), 
    0
  );
  
  const totalGainLoss = mockHoldings.reduce(
    (sum, holding) => sum + holding.gainLoss, 
    0
  );
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Portfolio Holdings</CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
              <p className={cn(
                'text-xl font-bold',
                totalGainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
              )}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Cost Basis</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Day Change</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead className="text-right">Allocation</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockHoldings.map((holding) => (
                <TableRow key={holding.ticker} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono font-bold text-base">
                      {holding.ticker}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {holding.shares}
                  </TableCell>
                  <TableCell className="text-right">
                    ${holding.costBasis}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${holding.currentPrice}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {holding.dayChange >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={cn(
                        'font-semibold',
                        holding.dayChange >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {holding.dayChange >= 0 ? '+' : ''}{holding.dayChange}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <p className={cn(
                        'font-bold',
                        holding.gainLoss >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {holding.gainLoss >= 0 ? '+' : ''}${Math.abs(holding.gainLoss).toLocaleString()}
                      </p>
                      <p className={cn(
                        'text-xs',
                        holding.gainLossPercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center justify-end gap-2">
                        <Progress value={holding.allocation} className="w-16 h-2" />
                        <span className="font-semibold text-sm">{holding.allocation}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSentimentBadge(holding.sentiment)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            Add Position
          </Button>
          <Button variant="outline" size="sm">
            Rebalance Portfolio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

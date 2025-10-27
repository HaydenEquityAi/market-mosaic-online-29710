
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, BarChart3Icon } from 'lucide-react';
import { Stock, formatCurrency, formatPercentage, formatNumber, formatDate } from '@/utils/stocksApi';
import { Sparkline } from '@/components/stocks/Sparkline';
import { cn } from '@/lib/utils';

interface StockCardProps {
  stock: Partial<Stock>; // Use Partial to allow undefined properties
  priceHistory?: number[];
  className?: string;
  onClick?: () => void;
}

export function StockCard({ stock, priceHistory, className, onClick }: StockCardProps) {
  const isPositive = (stock.change || 0) >= 0;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm",
        onClick ? "cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="space-y-1 min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold leading-none truncate">{stock.symbol || 'N/A'}</CardTitle>
          <p className="text-xs text-muted-foreground truncate">{stock.name || 'Unknown'}</p>
        </div>
        <BarChart3Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 ml-2" />
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1 sm:space-y-2 min-w-0">
            <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(stock.price || 0)}</div>
            <div className="flex items-center text-xs">
              <span className={cn(
                "inline-flex items-center",
                isPositive ? "text-success" : "text-danger"
              )}>
                {isPositive ? 
                  <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                }
                {formatCurrency(Math.abs(stock.change || 0))} ({formatPercentage(stock.changePercent || 0)})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs">
              <div className="text-muted-foreground">Vol:</div>
              <div className="text-right truncate">{formatNumber(stock.volume || 0)}</div>
              <div className="text-muted-foreground hidden sm:block">Cap:</div>
              <div className="text-right truncate hidden sm:block">{formatNumber(stock.marketCap || 0)}</div>
              <div className="text-muted-foreground sm:hidden">Mkt:</div>
              <div className="text-right truncate sm:hidden">{formatNumber(stock.marketCap || 0)}</div>
              <div className="text-muted-foreground">Upd:</div>
              <div className="text-right truncate">{formatDate(stock.lastUpdated)}</div>
            </div>
          </div>
          <div className="h-20 sm:h-24 flex items-center justify-center">
            {priceHistory && priceHistory.length > 0 && (
              <Sparkline 
                data={priceHistory} 
                color={isPositive ? 'rgb(var(--success))' : 'rgb(var(--danger))'} 
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

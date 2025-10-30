import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LivePriceDisplayProps {
  price: number;
  previousPrice?: number;
  change?: number;
  changePercent?: number;
  isLive?: boolean;
  lastUpdated?: Date;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LivePriceDisplay({
  price,
  previousPrice,
  change = 0,
  changePercent = 0,
  isLive = true,
  lastUpdated,
  size = 'md',
  className,
}: LivePriceDisplayProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const isPositive = change >= 0;

  // Animate when price changes
  useEffect(() => {
    if (previousPrice !== undefined && previousPrice !== price) {
      setIsUpdating(true);
      setHasChanged(true);
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 600);
      
      const changeTimer = setTimeout(() => {
        setHasChanged(false);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(changeTimer);
      };
    }
  }, [price, previousPrice]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'font-bold transition-all duration-300',
            sizeClasses[size],
            isUpdating && 'animate-pulse',
            hasChanged && (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
          )}
        >
          {formatPrice(price)}
        </span>
        {isLive && (
          <div className="flex items-center gap-1">
            <div className="relative">
              <Wifi className={cn(
                'h-3 w-3 sm:h-4 sm:w-4',
                isLive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'
              )} />
              {isUpdating && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
              LIVE
            </span>
          </div>
        )}
      </div>
      
      {(change !== 0 || changePercent !== 0) && (
        <div className={cn(
          'flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors duration-300',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          hasChanged && 'animate-bounce'
        )}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
          <span>{formatPercent(changePercent)}</span>
          <span className="text-muted-foreground ml-1">
            ({formatPrice(Math.abs(change))})
          </span>
        </div>
      )}
      
      {lastUpdated && (
        <span className="text-[10px] text-muted-foreground">
          Updated {getLastUpdatedText()}
        </span>
      )}
    </div>
  );
}


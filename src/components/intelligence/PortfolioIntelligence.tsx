
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, AlertTriangle, Sparkles, 
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioIntelligenceProps {
  portfolioValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  techExposure: number;
  sharpeRatio: number;
  beta: number;
  dividendYield: number;
}

export function PortfolioIntelligence({
  portfolioValue = 247815,
  dailyChange = 5947,
  dailyChangePercent = 2.4,
  techExposure = 68,
  sharpeRatio = 1.23,
  beta = 1.05,
  dividendYield = 1.7
}: PortfolioIntelligenceProps) {
  
  const isPositive = dailyChange >= 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Portfolio Summary Card */}
      <Card className="lg:col-span-2 border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Portfolio Intelligence Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Stats */}
          <div className="flex items-baseline gap-4 flex-wrap">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <h2 className="text-4xl font-bold">
                ${portfolioValue.toLocaleString()}
              </h2>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {isPositive ? (
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className={cn(
                  "text-lg font-bold",
                  isPositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {isPositive ? '+' : ''}{dailyChangePercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  ${Math.abs(dailyChange).toLocaleString()} Today
                </p>
              </div>
            </div>
            {techExposure > 65 && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {techExposure}% Tech Exposure
              </Badge>
            )}
          </div>
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
              <p className="text-lg font-semibold">{sharpeRatio}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beta</p>
              <p className="text-lg font-semibold">{beta}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Div Yield</p>
              <p className="text-lg font-semibold">{dividendYield}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Insight Panel */}
      <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-background via-background to-blue-500/5">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500" />
            BrokerAI Insight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-emerald-500">AMD</span> is driving today's gains 
              (<span className="text-emerald-500">+3.2%</span>). However, your tech exposure is 
              <span className="font-semibold text-yellow-600"> high ({techExposure}%)</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Consider shifting 10% into Energy ETFs for better diversification.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Auto-Rebalance
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              See Alternatives
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

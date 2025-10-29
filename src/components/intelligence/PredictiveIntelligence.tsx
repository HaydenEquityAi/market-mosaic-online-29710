
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Calendar, AlertCircle, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionData {
  symbol: string;
  priceRange: { min: number; max: number };
  probability: number;
  timeframe: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  riskEvent?: string;
  riskDate?: string;
  historicalPattern?: {
    matchCount: number;
    avgGain: number;
  };
}

const mockPredictions: PredictionData[] = [
  {
    symbol: 'AMD',
    priceRange: { min: 270, max: 290 },
    probability: 75,
    timeframe: '30 days',
    sentiment: 'bullish',
    riskEvent: 'Fed meeting',
    riskDate: '12/18',
    historicalPattern: {
      matchCount: 5,
      avgGain: 12
    }
  },
  {
    symbol: 'NVDA',
    priceRange: { min: 850, max: 920 },
    probability: 68,
    timeframe: '30 days',
    sentiment: 'bullish',
    riskEvent: 'Earnings call',
    riskDate: '11/20'
  },
  {
    symbol: 'ARLP',
    priceRange: { min: 22, max: 25 },
    probability: 62,
    timeframe: '30 days',
    sentiment: 'neutral',
    historicalPattern: {
      matchCount: 3,
      avgGain: 8
    }
  }
];

export function PredictiveIntelligence() {
  return (
    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-background via-background to-purple-500/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          Predictive Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockPredictions.map((prediction, index) => (
          <div 
            key={prediction.symbol}
            className={cn(
              "p-4 rounded-lg border transition-all hover:shadow-md",
              index === 0 ? "bg-purple-500/5 border-purple-500/20" : "bg-muted/30"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{prediction.symbol}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      prediction.sentiment === 'bullish' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      prediction.sentiment === 'bearish' && "bg-red-500/10 text-red-600 border-red-500/20",
                      prediction.sentiment === 'neutral' && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    )}
                  >
                    {prediction.sentiment === 'bullish' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {prediction.sentiment.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${prediction.priceRange.min}–${prediction.priceRange.max} range
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-500">{prediction.probability}%</p>
                <p className="text-xs text-muted-foreground">confidence</p>
              </div>
            </div>
            
            {/* Probability Bar */}
            <div className="mb-3">
              <Progress value={prediction.probability} className="h-2" />
            </div>
            
            {/* Risk Event */}
            {prediction.riskEvent && (
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-500/10 px-3 py-2 rounded-md mb-2">
                <AlertCircle className="h-4 w-4" />
                <span>Risk: {prediction.riskEvent}</span>
                {prediction.riskDate && (
                  <>
                    <Calendar className="h-3 w-3 ml-auto" />
                    <span className="font-medium">{prediction.riskDate}</span>
                  </>
                )}
              </div>
            )}
            
            {/* Historical Pattern */}
            {prediction.historicalPattern && (
              <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                Similar pattern in {prediction.historicalPattern.matchCount} past cases → 
                <span className="text-emerald-600 font-medium ml-1">
                  +{prediction.historicalPattern.avgGain}% avg gain
                </span>
              </div>
            )}
          </div>
        ))}
        
        <Button variant="outline" className="w-full" size="sm">
          View All Predictions
        </Button>
      </CardContent>
    </Card>
  );
}

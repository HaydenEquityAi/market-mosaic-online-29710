
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, TrendingUp, AlertCircle, ExternalLink,
  Twitter, MessageSquare, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  impactPercent: string;
  ticker: string;
  source: string;
  time: string;
  url: string;
}

interface SocialSentiment {
  ticker: string;
  positivePercent: number;
  change: number;
  trendingScore: number;
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'AMD partners with MSFT on AI chip development',
    impact: 'high',
    impactPercent: '+3-5%',
    ticker: 'AMD',
    source: 'Reuters',
    time: '2h ago',
    url: '#'
  },
  {
    id: '2',
    title: 'Energy bill passes Senate with bipartisan support',
    impact: 'medium',
    impactPercent: '+1-2%',
    ticker: 'ARLP',
    source: 'Bloomberg',
    time: '4h ago',
    url: '#'
  },
  {
    id: '3',
    title: 'S&P 500 reaches new all-time high',
    impact: 'low',
    impactPercent: '+0.3%',
    ticker: 'SPY',
    source: 'CNBC',
    time: '6h ago',
    url: '#'
  },
  {
    id: '4',
    title: 'Fed signals potential rate cuts in Q2 2025',
    impact: 'high',
    impactPercent: '+2-4%',
    ticker: 'Market',
    source: 'WSJ',
    time: '1d ago',
    url: '#'
  }
];

const mockSentiment: SocialSentiment[] = [
  { ticker: 'AMD', positivePercent: 64, change: 12, trendingScore: 95 },
  { ticker: 'NVDA', positivePercent: 72, change: 8, trendingScore: 88 },
  { ticker: 'PLTR', positivePercent: 58, change: -5, trendingScore: 76 },
  { ticker: 'ARLP', positivePercent: 51, change: 3, trendingScore: 42 }
];

export function NewsSentimentAnalyzer() {
  const [filter, setFilter] = useState<'all' | 'holdings' | 'trending'>('all');
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return '';
    }
  };
  
  const getSentimentColor = (percent: number) => {
    if (percent >= 60) return 'text-emerald-500';
    if (percent >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="border-2 border-blue-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-500" />
            News & Social Intelligence
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Markets
            </Button>
            <Button 
              variant={filter === 'holdings' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('holdings')}
            >
              My Holdings
            </Button>
            <Button 
              variant={filter === 'trending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('trending')}
            >
              Trending
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="news">
              <Newspaper className="h-4 w-4 mr-2" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="social">
              <Twitter className="h-4 w-4 mr-2" />
              Social Sentiment
            </TabsTrigger>
          </TabsList>
          
          {/* News Tab */}
          <TabsContent value="news" className="space-y-3">
            {mockNews.map((news) => (
              <div 
                key={news.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'uppercase text-[10px] font-bold',
                      getImpactColor(news.impact)
                    )}
                  >
                    {news.impact} Impact
                  </Badge>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                </div>
                
                <h4 className="font-semibold mb-2 leading-snug">{news.title}</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary" className="font-mono">
                      {news.ticker}
                    </Badge>
                    <span className="text-muted-foreground">{news.source}</span>
                    <span className={cn(
                      'font-semibold',
                      news.impact === 'high' ? 'text-emerald-500' : 'text-yellow-500'
                    )}>
                      {news.impactPercent} est.
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          {/* Social Sentiment Tab */}
          <TabsContent value="social" className="space-y-3">
            <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">Trending Tickers</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['NVDA', 'PLTR', 'ARLP', 'AMD', 'TSLA'].map((ticker) => (
                  <Badge key={ticker} variant="secondary" className="font-mono">
                    {ticker}
                  </Badge>
                ))}
              </div>
            </div>
            
            {mockSentiment.map((sentiment) => (
              <div 
                key={sentiment.ticker}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-base font-bold">
                      {sentiment.ticker}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Twitter className="h-3 w-3 text-blue-400" />
                      <MessageSquare className="h-3 w-3 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      'text-2xl font-bold',
                      getSentimentColor(sentiment.positivePercent)
                    )}>
                      {sentiment.positivePercent}%
                    </p>
                    <p className="text-xs text-muted-foreground">positive</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Change:</span>
                    <span className={cn(
                      'font-semibold',
                      sentiment.change > 0 ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {sentiment.change > 0 ? '+' : ''}{sentiment.change}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Trending:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${sentiment.trendingScore}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs">{sentiment.trendingScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" size="sm">
                <Twitter className="h-4 w-4 mr-2" />
                View Tweets
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Stocktwits
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

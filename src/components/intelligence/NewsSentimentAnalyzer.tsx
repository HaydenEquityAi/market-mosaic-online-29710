
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, TrendingUp, AlertCircle, ExternalLink,
  Twitter, MessageSquare, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { newsApi, type NewsArticle, type SentimentData } from '@/services/newsApi';

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

// Mappers to convert backend responses to UI items
const mapNewsToUi = (articles: NewsArticle[] | undefined): NewsItem[] => {
  return (articles || []).map((a) => ({
    id: String(a.id ?? `${a.ticker}-${a.publishedAt}`),
    title: a.title,
    impact: (a.sentimentScore ?? 0) > 0.5 ? 'high' : (a.sentimentScore ?? 0) < -0.2 ? 'low' : 'medium',
    impactPercent: a.sentimentScore !== undefined ? `${(Math.abs(a.sentimentScore) * 100).toFixed(0)}%` : '+0%',
    ticker: a.ticker || 'MARKET',
    source: a.source || 'Unknown',
    time: new Date(a.publishedAt).toLocaleString(),
    url: a.url || '#',
  }));
};

const mapSentimentToUi = (rows: SentimentData[] | undefined): SocialSentiment[] => {
  return (rows || []).map((s) => ({
    ticker: s.ticker,
    positivePercent: Math.round(s.positivePercent ?? 0),
    change: Math.round(s.change24h ?? 0),
    trendingScore: Math.round(s.trendingScore ?? 0),
  }));
};

export function NewsSentimentAnalyzer() {
  const [filter, setFilter] = useState<'all' | 'holdings' | 'trending'>('all');
  
  // Fetch latest news
  const {
    data: latestNews,
    isLoading: newsLoading,
    isError: newsError,
  } = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: () => newsApi.getLatestNews(20),
    refetchInterval: 60000,
  });

  // Fetch social sentiment
  const {
    data: socialSentiment,
    isLoading: sentimentLoading,
    isError: sentimentError,
  } = useQuery({
    queryKey: ['news', 'social-sentiment'],
    queryFn: () => newsApi.getSocialSentiment(['AAPL', 'NVDA', 'TSLA', 'AMD', 'SPY']),
    refetchInterval: 120000,
  });

  const uiNews = useMemo(() => mapNewsToUi(latestNews), [latestNews]);
  const uiSentiment = useMemo(() => mapSentimentToUi(socialSentiment), [socialSentiment]);
  
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
        {(newsLoading || sentimentLoading) && (
          <div className="p-4 text-sm text-muted-foreground">Loading intelligence data…</div>
        )}
        {(newsError || sentimentError) && (
          <div className="p-4 text-sm text-red-500">Failed to load intelligence data.</div>
        )}
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
            {(uiNews || []).map((news) => (
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
                  <Button asChild variant="ghost" size="sm">
                    <a href={news.url} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
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
                {(uiSentiment || []).slice(0, 8).map((s) => (
                  <Badge key={s.ticker} variant="secondary" className="font-mono">
                    {s.ticker}
                  </Badge>
                ))}
              </div>
            </div>
            
            {(uiSentiment || []).map((sentiment) => (
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

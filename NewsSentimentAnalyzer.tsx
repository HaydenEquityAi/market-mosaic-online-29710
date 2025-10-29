import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Newspaper, TrendingUp, ExternalLink, Twitter, MessageSquare, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { newsApi } from '@/services/newsApi';

export function NewsSentimentAnalyzer() {
  const [filter, setFilter] = useState<'all' | 'holdings' | 'trending'>('all');
  
  // Fetch news
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', filter],
    queryFn: () => newsApi.getLatestNews(20),
    refetchInterval: 900000, // 15 minutes
    staleTime: 600000 // 10 minutes
  });

  // Fetch social sentiment
  const { data: sentiment, isLoading: sentimentLoading } = useQuery({
    queryKey: ['sentiment'],
    queryFn: () => newsApi.getSocialSentiment(['AMD', 'NVDA', 'PLTR', 'ARLP', 'TSLA']),
    refetchInterval: 900000, // 15 minutes
    staleTime: 600000
  });

  // Fetch trending tickers
  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => newsApi.getTrendingTickers(),
    refetchInterval: 1800000, // 30 minutes
    staleTime: 1200000
  });
  
  const getImpactColor = (impact?: string) => {
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
            {newsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : news && news.length > 0 ? (
              news.map((article) => (
                <div 
                  key={article.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'uppercase text-[10px] font-bold',
                        getImpactColor(article.impact)
                      )}
                    >
                      {article.impact || 'medium'} Impact
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold mb-2 leading-snug">{article.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      {article.ticker && (
                        <Badge variant="secondary" className="font-mono">
                          {article.ticker}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">{article.source}</span>
                      {article.sentimentScore && (
                        <span className={cn(
                          'font-semibold',
                          article.sentiment === 'positive' ? 'text-emerald-500' : 
                          article.sentiment === 'negative' ? 'text-red-500' : 
                          'text-yellow-500'
                        )}>
                          {article.sentiment}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No news available at the moment
              </div>
            )}
          </TabsContent>
          
          {/* Social Sentiment Tab */}
          <TabsContent value="social" className="space-y-3">
            {trending && trending.length > 0 && (
              <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold">Trending Tickers</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {trending.map((ticker) => (
                    <Badge key={ticker} variant="secondary" className="font-mono">
                      {ticker}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {sentimentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sentiment && sentiment.length > 0 ? (
              sentiment.map((item) => (
                <div 
                  key={item.ticker}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-base font-bold">
                        {item.ticker}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Twitter className="h-3 w-3 text-blue-400" />
                        <MessageSquare className="h-3 w-3 text-purple-400" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-2xl font-bold',
                        getSentimentColor(item.positivePercent)
                      )}>
                        {item.positivePercent}%
                      </p>
                      <p className="text-xs text-muted-foreground">positive</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Mentions:</span>
                      <span className="font-semibold">{item.totalMentions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Trending:</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${item.trendingScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-xs">{item.trendingScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sentiment data available
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
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

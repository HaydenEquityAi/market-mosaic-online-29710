
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Users, TrendingUp, TrendingDown, ExternalLink,
  Award, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CongressTrade {
  id: string;
  name: string;
  title: string;
  party: 'R' | 'D' | 'I';
  action: 'bought' | 'sold';
  ticker: string;
  amount: string;
  date: string;
}

interface HedgeFundActivity {
  id: string;
  fund: string;
  action: 'increased' | 'decreased' | 'new';
  ticker: string;
  changePercent: number;
  quarterlyReturn?: number;
}

interface InsiderTrade {
  id: string;
  company: string;
  ticker: string;
  insiderType: string;
  action: 'buy' | 'sell';
  amount: string;
  date: string;
}

const mockCongressTrades: CongressTrade[] = [
  {
    id: '1',
    name: 'Rep. Garcia',
    title: 'Representative',
    party: 'D',
    action: 'bought',
    ticker: 'NVDA',
    amount: '$150K',
    date: '3d ago'
  },
  {
    id: '2',
    name: 'Sen. Lee',
    title: 'Senator',
    party: 'R',
    action: 'sold',
    ticker: 'AAPL',
    amount: '$40K',
    date: '5d ago'
  },
  {
    id: '3',
    name: 'Rep. Johnson',
    title: 'Representative',
    party: 'R',
    action: 'bought',
    ticker: 'AMD',
    amount: '$75K',
    date: '1w ago'
  }
];

const mockHedgeFunds: HedgeFundActivity[] = [
  {
    id: '1',
    fund: 'Bridgewater Associates',
    action: 'increased',
    ticker: 'ARLP',
    changePercent: 23,
    quarterlyReturn: 12.4
  },
  {
    id: '2',
    fund: 'Renaissance Technologies',
    action: 'increased',
    ticker: 'NVDA',
    changePercent: 10,
    quarterlyReturn: 18.7
  },
  {
    id: '3',
    fund: 'Citadel',
    action: 'new',
    ticker: 'PLTR',
    changePercent: 100,
    quarterlyReturn: 15.2
  },
  {
    id: '4',
    fund: 'Two Sigma',
    action: 'decreased',
    ticker: 'TSLA',
    changePercent: -15,
    quarterlyReturn: 9.8
  }
];

const mockInsiders: InsiderTrade[] = [
  {
    id: '1',
    company: 'Advanced Micro Devices',
    ticker: 'AMD',
    insiderType: 'CEO',
    action: 'buy',
    amount: '$1.2M',
    date: '2d ago'
  },
  {
    id: '2',
    company: 'NVIDIA Corporation',
    ticker: 'NVDA',
    insiderType: 'CFO',
    action: 'buy',
    amount: '$850K',
    date: '4d ago'
  },
  {
    id: '3',
    company: 'Alliance Resource Partners',
    ticker: 'ARLP',
    insiderType: 'Director',
    action: 'buy',
    amount: '$420K',
    date: '1w ago'
  }
];

export function SmartMoneyTracker() {
  const [activeTab, setActiveTab] = useState('congress');
  
  return (
    <Card className="border-2 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-500" />
          Smart Money Movements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="congress">
              <Users className="h-4 w-4 mr-2" />
              Congress
            </TabsTrigger>
            <TabsTrigger value="hedgefunds">
              <Award className="h-4 w-4 mr-2" />
              Hedge Funds
            </TabsTrigger>
            <TabsTrigger value="insiders">
              <DollarSign className="h-4 w-4 mr-2" />
              Insiders
            </TabsTrigger>
          </TabsList>
          
          {/* Congress Trades Tab */}
          <TabsContent value="congress" className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-4">
              <p className="text-sm font-semibold mb-1">📊 Past 7 Days Activity</p>
              <p className="text-xs text-muted-foreground">
                {mockCongressTrades.length} trades detected • Track similar trades for alerts
              </p>
            </div>
            
            {mockCongressTrades.map((trade) => (
              <div 
                key={trade.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {trade.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold">{trade.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{trade.title}</p>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-[10px] h-4',
                            trade.party === 'R' && 'bg-red-500/10 text-red-600 border-red-500/20',
                            trade.party === 'D' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          )}
                        >
                          {trade.party}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{trade.date}</span>
                </div>
                
                <div className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-md">
                  <div className="flex items-center gap-3">
                    {trade.action === 'bought' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                      'font-semibold capitalize',
                      trade.action === 'bought' ? 'text-emerald-500' : 'text-red-500'
                    )}>
                      {trade.action}
                    </span>
                    <Badge variant="secondary" className="font-mono">
                      {trade.ticker}
                    </Badge>
                  </div>
                  <span className="font-bold">{trade.amount}</span>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Source
            </Button>
          </TabsContent>
          
          {/* Hedge Funds Tab */}
          <TabsContent value="hedgefunds" className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-4">
              <p className="text-sm font-semibold mb-1">🏦 Latest 13F Filings</p>
              <p className="text-xs text-muted-foreground">
                Tracking top 20 hedge funds • Updated quarterly
              </p>
            </div>
            
            {mockHedgeFunds.map((activity) => (
              <div 
                key={activity.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold mb-1">{activity.fund}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {activity.ticker}
                      </Badge>
                      {activity.quarterlyReturn && (
                        <span className="text-xs text-emerald-500">
                          +{activity.quarterlyReturn}% Q4
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={cn(
                      'capitalize',
                      activity.action === 'increased' && 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                      activity.action === 'decreased' && 'bg-red-500/10 text-red-600 border-red-500/20',
                      activity.action === 'new' && 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    )}
                  >
                    {activity.action}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className={cn(
                        'h-2 rounded-full',
                        activity.changePercent > 0 ? 'bg-emerald-500' : 'bg-red-500'
                      )}
                      style={{ width: `${Math.abs(activity.changePercent)}%` }}
                    />
                  </div>
                  <span className={cn(
                    'text-sm font-bold',
                    activity.changePercent > 0 ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {activity.changePercent > 0 ? '+' : ''}{activity.changePercent}%
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
          
          {/* Insiders Tab */}
          <TabsContent value="insiders" className="space-y-3">
            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 mb-4">
              <p className="text-sm font-semibold mb-1">💼 Recent Insider Activity</p>
              <p className="text-xs text-muted-foreground">
                Tracking C-suite and board members
              </p>
            </div>
            
            {mockInsiders.map((insider) => (
              <div 
                key={insider.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{insider.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="font-mono">
                        {insider.ticker}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {insider.insiderType}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{insider.date}</span>
                </div>
                
                <div className="flex items-center justify-between bg-emerald-500/10 px-3 py-2 rounded-md border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-semibold text-emerald-500 capitalize">
                      {insider.action}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">{insider.amount}</span>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                  💡 Insider purchases historically preceded <span className="text-emerald-600 font-semibold">+8%</span> avg price increase
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" size="sm">
              Track Similar Trades
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { 
  Home, BarChart3, Newspaper, Briefcase, TrendingUp, 
  Settings, ChevronRight, ChevronLeft, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  badgeColor?: string;
  emoji?: string;
}

export function EnhancedSidebar({ isCollapsed, onToggle, className }: SidebarProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      title: 'Overview',
      icon: Home,
      href: '/',
    },
    {
      title: 'Portfolio Analytics',
      icon: BarChart3,
      href: '/portfolio',
    },
    {
      title: 'News & Sentiment',
      icon: Newspaper,
      href: '/news-sentiment',
      badge: undefined,
    },
    {
      title: 'Smart Money',
      icon: Briefcase,
      href: '/smart-money',
      badge: undefined,
    },
    {
      title: 'Markets & Predictions',
      icon: TrendingUp,
      href: '/predictions',
    },
    {
      title: 'Settings',
      icon: Settings,
      href: '/settings',
    }
  ];

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground relative transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-200",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-sidebar-foreground" />
          </div>
          <h2 className="font-bold tracking-tight">BrokerAI</h2>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "text-sidebar-foreground h-8 w-8",
            isCollapsed && "mx-auto"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("h-5 w-5 shrink-0")} />
                  {item.badge && !isCollapsed && (
                    <div className={cn(
                      "absolute -top-1 -right-1 h-3 w-3 rounded-full",
                      item.badgeColor || "bg-red-500",
                      "animate-pulse"
                    )} />
                  )}
                </div>
                
                <div className={cn(
                  "flex items-center justify-between flex-1 transition-opacity duration-200",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "h-5 min-w-5 px-1 text-[10px]",
                        item.badgeColor,
                        "text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer - Market Status */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "transition-opacity duration-200 rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-600/10 p-3",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="font-semibold text-xs">Markets Open</p>
          </div>
          <p className="text-[11px] text-muted-foreground">NYSE closes in 3h 45m</p>
          <div className="mt-2 pt-2 border-t border-sidebar-border/50">
            <p className="text-[10px] text-muted-foreground">S&P 500</p>
            <p className="text-xs font-semibold text-emerald-500">+0.47%</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

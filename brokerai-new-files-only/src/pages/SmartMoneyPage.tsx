
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EnhancedSidebar } from '@/components/layout/EnhancedSidebar';
import { SmartMoneyTracker } from '@/components/intelligence/SmartMoneyTracker';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function SmartMoneyPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <EnhancedSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden fixed top-16 left-4 z-40">
            <Button variant="outline" size="icon" className="rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <EnhancedSidebar isCollapsed={false} onToggle={toggleSidebar} />
          </SheetContent>
        </Sheet>
        
        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 lg:ml-0 overflow-y-auto">
          <div className="container max-w-7xl p-3 sm:p-4 lg:p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Smart Money Tracker</h1>
              <p className="text-muted-foreground">
                Track congressional trades, hedge fund activity, and insider transactions
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmartMoneyTracker />
              <SmartMoneyTracker />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden fixed top-16 left-4 z-40">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar isCollapsed={false} onToggle={toggleSidebar} />
          </SheetContent>
        </Sheet>
        
        <main className="flex-1 transition-all duration-300 lg:ml-0">
          <div className="container max-w-full p-3 sm:p-4 lg:p-6 animate-fade-in">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

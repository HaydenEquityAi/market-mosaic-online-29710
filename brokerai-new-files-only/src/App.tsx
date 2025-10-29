
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Stocks from "./pages/Stocks";
import Markets from "./pages/Markets";
import Currencies from "./pages/Currencies";
import Global from "./pages/Global";
import Portfolio from "./pages/Portfolio";
import Performance from "./pages/Performance";
import Analysis from "./pages/Analysis";
import Settings from "./pages/Settings";
// New Enhanced Pages
import { EnhancedDashboard } from "./components/layout/EnhancedDashboard";
import { NewsSentimentPage } from "./pages/NewsSentimentPage";
import { SmartMoneyPage } from "./pages/SmartMoneyPage";
import { PredictionsPage } from "./pages/PredictionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Enhanced Dashboard as main route */}
          <Route path="/" element={<EnhancedDashboard />} />
          
          {/* New Intelligence Routes */}
          <Route path="/news-sentiment" element={<NewsSentimentPage />} />
          <Route path="/smart-money" element={<SmartMoneyPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          
          {/* Original Routes */}
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/currencies" element={<Currencies />} />
          <Route path="/global" element={<Global />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Classic Dashboard (if you want to keep it) */}
          <Route path="/classic" element={<Index />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

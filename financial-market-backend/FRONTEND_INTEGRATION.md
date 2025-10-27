# Frontend Integration Guide

This guide will help you connect your React frontend to the backend API.

## Step 1: Install Axios (if not already installed)

```bash
cd /path/to/your/frontend
npm install axios
```

## Step 2: Create API Configuration

Create a new file `src/utils/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Step 3: Update Environment Variables

Create or update `.env` file in your frontend root:

```env
VITE_API_URL=http://localhost:3001/api
```

## Step 4: Replace stocksApi.ts

Update `src/utils/stocksApi.ts` to use the real API:

```typescript
import { useState, useEffect } from 'react';
import api from './api';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

// ... keep other interfaces ...

// Replace mock data with API calls
export const fetchStocks = async (symbols: string[]): Promise<Stock[]> => {
  try {
    const response = await api.get(`/stocks/quotes?symbols=${symbols.join(',')}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
};

export const fetchMarketIndices = async () => {
  try {
    const response = await api.get('/stocks/indices');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching indices:', error);
    return [];
  }
};

export const fetchCurrencyPairs = async () => {
  try {
    const response = await api.get('/currencies/major-pairs');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching currency pairs:', error);
    return [];
  }
};

// Update hooks to use API
export function useStockData(symbols: string[], updateInterval = 60000) {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchStocks(symbols);
      setStocks(data);
    };

    fetchData();
    const intervalId = setInterval(fetchData, updateInterval);
    return () => clearInterval(intervalId);
  }, [symbols, updateInterval]);

  return stocks;
}

// Similar updates for other hooks...
```

## Step 5: Create API Service Files

Create `src/services/` directory with service files:

### `src/services/auth.service.ts`

```typescript
import api from '../utils/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  updateProfile: async (data: { firstName: string; lastName: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};
```

### `src/services/portfolio.service.ts`

```typescript
import api from '../utils/api';

export const portfolioService = {
  getPortfolios: async () => {
    const response = await api.get('/portfolios');
    return response.data.data;
  },

  createPortfolio: async (data: { name: string; description?: string }) => {
    const response = await api.post('/portfolios', data);
    return response.data;
  },

  getPortfolioHoldings: async (portfolioId: string) => {
    const response = await api.get(`/portfolios/${portfolioId}/holdings`);
    return response.data.data;
  },

  addHolding: async (
    portfolioId: string,
    data: {
      symbol: string;
      assetType: 'stock' | 'crypto' | 'currency';
      quantity: number;
      price: number;
    }
  ) => {
    const response = await api.post(`/portfolios/${portfolioId}/holdings`, data);
    return response.data;
  },

  getTransactions: async (portfolioId: string) => {
    const response = await api.get(`/portfolios/${portfolioId}/transactions`);
    return response.data.data;
  },
};
```

### `src/services/strategy.service.ts`

```typescript
import api from '../utils/api';

export const strategyService = {
  getStrategies: async () => {
    const response = await api.get('/strategies');
    return response.data.data;
  },

  createStrategy: async (data: {
    name: string;
    description?: string;
    type: string;
    parameters: any;
  }) => {
    const response = await api.post('/strategies', data);
    return response.data;
  },

  runBacktest: async (
    strategyId: string,
    data: {
      symbol: string;
      startDate: string;
      endDate: string;
      initialCapital?: number;
    }
  ) => {
    const response = await api.post(`/strategies/${strategyId}/backtest`, data);
    return response.data;
  },

  getBacktestResults: async (strategyId: string) => {
    const response = await api.get(`/strategies/${strategyId}/backtest-results`);
    return response.data.data;
  },
};
```

## Step 6: Update Dashboard Component

Update `src/components/layout/Dashboard.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { fetchStocks, fetchMarketIndices, fetchCurrencyPairs } from '@/utils/stocksApi';
// ... other imports

export function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [stocksData, indicesData, currenciesData] = await Promise.all([
          fetchStocks(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']),
          fetchMarketIndices(),
          fetchCurrencyPairs(),
        ]);
        
        setStocks(stocksData);
        setIndices(indicesData);
        setCurrencies(currenciesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // ... rest of component
}
```

## Step 7: Create Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('authToken');
    }
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const register = async (data: any) => {
    const result = await authService.register(data);
    setUser(result.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Step 8: Update App.tsx

Wrap your app with the AuthProvider:

```typescript
import { AuthProvider } from './contexts/AuthContext';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Your routes */}
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

## Step 9: Test the Integration

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend:
```bash
cd /path/to/frontend
npm run dev
```

3. Visit http://localhost:8080 and test:
   - Stock quotes should load from the API
   - Authentication should work
   - Portfolio management should function
   - Strategy backtesting should run

## Common Issues

### CORS Errors
Make sure your backend `.env` has:
```
CORS_ORIGIN=http://localhost:8080
```

### 401 Unauthorized
Check that the auth token is being stored and sent correctly.

### API Not Responding
Verify the backend is running on port 3001 and accessible.

## Next Steps

1. Add error boundaries for better error handling
2. Implement loading states throughout the app
3. Add toast notifications for API responses
4. Create protected route components
5. Add refresh token logic for extended sessions

---

You now have a fully integrated frontend and backend! 🎉

# Intelligence Pages API Integration Status

## Current State Analysis

### ✅ What's Working
1. **API Services Created**:
   - `src/services/newsApi.ts` - Has correct endpoints
   - `src/services/smartMoneyApi.ts` - Has correct endpoints
   - Both now use `https://api.brokerai.ai/api` base URL

2. **Backend Routes Exist**:
   - `server/src/routes/news.routes.ts` 
   - `server/src/routes/smartMoney.routes.ts`
   - Both registered in `server/src/index.ts`

3. **Pages Structure**:
   - `NewsSentimentPage.tsx` - Exists, imports NewsSentimentAnalyzer
   - `SmartMoneyPage.tsx` - Exists, imports SmartMoneyTracker  
   - `PredictionsPage.tsx` - Exists, imports PredictiveIntelligence

### ❌ What Needs to be Fixed

#### 1. Intelligence Components Show Mock Data
- `NewsSentimentAnalyzer.tsx` - Uses `mockNews` and `mockSentiment` arrays
- `SmartMoneyTracker.tsx` - Uses `mockCongressTrades`, `mockHedgeFunds`, `mockInsiders`
- `PredictiveIntelligence.tsx` - Uses `mockPredictions` array

#### 2. Components Don't Use React Query
- No `useQuery` hooks to fetch real data
- No loading states
- No error handling

#### 3. API Integration Needed
Components need to:
1. Import `useQuery` from `@tanstack/react-query`
2. Import API services (`newsApi`, `smartMoneyApi`)
3. Replace mock data with real API calls
4. Add loading/error states
5. Match data structure from backend

## Required Changes

### Files to Update:
1. `src/services/newsApi.ts` - ✅ Base URL fixed
2. `src/services/smartMoneyApi.ts` - ✅ Base URL fixed  
3. `src/components/intelligence/NewsSentimentAnalyzer.tsx` - ❌ Need to add API calls
4. `src/components/intelligence/SmartMoneyTracker.tsx` - ❌ Need to add API calls
5. `src/components/intelligence/PredictiveIntelligence.tsx` - ❌ Need to add API calls (or use stock data for predictions)

## Next Steps

Since the files are quite large and the integration would be extensive, here's what needs to happen:

1. **For NewsSentimentAnalyzer.tsx**:
   - Add `useQuery` to fetch `newsApi.getLatestNews()`
   - Add `useQuery` to fetch `newsApi.getSocialSentiment()`
   - Map backend data structure to component's interface
   - Add loading/error UI states

2. **For SmartMoneyTracker.tsx**:
   - Add `useQuery` for congress trades, hedge fund activity, insider trades
   - Map backend data to component interfaces
   - Add loading/error states

3. **For PredictiveIntelligence.tsx**:
   - Either create a predictions API endpoint in backend
   - Or use existing stock data with algorithm to generate predictions
   - Or keep as mock data for now (simplest option)

## Recommendation

Due to the size of these components (270+ lines each), the integration would be most effective by:

1. **Option A**: Gradually replace mock data sections with real API calls
2. **Option B**: Create new version files and replace them
3. **Option C**: Add feature flags to toggle between mock and real data for testing

Would you like me to:
- Show you the exact code changes needed for each component?
- Create updated versions of the components?
- Start with one component (e.g., NewsSentimentAnalyzer) as a proof of concept?

## Current Configuration

- Base URL: `https://api.brokerai.ai/api`
- CORS: ✅ Configured on backend (recently updated)
- Frontend API services: ✅ Created and exported
- Backend routes: ✅ Created and registered

The infrastructure is ready - we just need to connect the UI components to the API services!


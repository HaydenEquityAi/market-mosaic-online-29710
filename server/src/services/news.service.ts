export const newsService = {
  async getLatestNews(limit: number = 20, tickers?: string[]) {
    return [];
  },
  async getTickerNews(symbol: string, limit: number = 10) {
    return [];
  },
  async getSocialSentiment(tickers: string[]) {
    return [];
  },
  async getTrendingTickers() {
    return ['NVDA', 'AMD', 'TSLA', 'AAPL', 'MSFT'];
  }
};
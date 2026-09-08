export type Stock = {
  id: string; rank: number; symbol: string; providerCode: string; name: string; englishName: string;
  market: 'US' | 'KR'; sector: string; riskLevel: '높음' | '매우 높음';
  summary: string; thesis: string; risk: string; watch: string; reviewedAt: string;
  sources: { title: string; url: string; date: string }[];
};
export type Quote = {
  price: number; changePercent: number | null; currency: 'USD' | 'KRW';
  tradedAt: string; collectedAt: string; marketStatus: string; sourceUrl: string;
};
export type NewsItem = { title: string; url: string; publisher: string; publishedAt: string };
export type MarketItem = { id: string; quote: Quote | null; news: NewsItem[]; quoteError: boolean; newsError: boolean; newsCollectedAt: string | null };
export type MarketSnapshot = { collectedAt: string; items: MarketItem[] };

import { XMLParser } from 'fast-xml-parser';
import { normalizeNews, normalizeQuote } from './normalize.ts';
import type { MarketItem, MarketSnapshot, Stock } from './types.ts';

export async function collectStock(stock: Stock, fallback?: MarketItem): Promise<MarketItem> {
  const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; DecemberRadar/1.0)', Accept: 'application/json, application/xml, text/xml' };
  const quoteUrl = stock.market === 'US' ? `https://api.stock.naver.com/stock/${stock.providerCode}/basic` : `https://m.stock.naver.com/api/stock/${stock.symbol}/basic`;
  const query = `${stock.market === 'US' ? stock.englishName : stock.name} 주식 when:14d`;
  const newsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const [quoteResult, newsResult] = await Promise.allSettled([
    fetch(quoteUrl, { headers, cache: 'no-store', signal: AbortSignal.timeout(12000) }).then(async r => { if (!r.ok) throw new Error(`Quote HTTP ${r.status}`); return normalizeQuote(await r.json(), stock); }),
    fetch(newsUrl, { headers, cache: 'no-store', signal: AbortSignal.timeout(12000) }).then(async r => { if (!r.ok) throw new Error(`News HTTP ${r.status}`); const text = await r.text(); const parsed = new XMLParser({ ignoreAttributes: false }).parse(text); if (!parsed.rss?.channel) throw new Error('Invalid news feed'); return normalizeNews(parsed.rss.channel.item); }),
  ]);
  return {
    id: stock.id,
    quote: quoteResult.status === 'fulfilled' ? quoteResult.value : fallback?.quote || null,
    news: newsResult.status === 'fulfilled' ? newsResult.value : fallback?.news || [],
    quoteError: quoteResult.status === 'rejected', newsError: newsResult.status === 'rejected',
    newsCollectedAt: newsResult.status === 'fulfilled' ? new Date().toISOString() : fallback?.newsCollectedAt || null,
  };
}
export async function collectMarket(stocks: Stock[], fallback?: MarketSnapshot): Promise<MarketSnapshot> {
  const items: MarketItem[] = [];
  // Small bounded batches avoid flooding the data providers.
  for (let i = 0; i < stocks.length; i += 3) {
    items.push(...await Promise.all(stocks.slice(i, i + 3).map(s => collectStock(s, fallback?.items.find(f => f.id === s.id)))));
  }
  return { collectedAt: new Date().toISOString(), items };
}

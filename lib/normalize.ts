import type { NewsItem, Quote, Stock } from './types.ts';

export function numberValue(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(String(value).replaceAll(',', ''));
  return Number.isFinite(n) ? n : null;
}
export function normalizeQuote(data: Record<string, any>, stock: Stock, now = new Date()): Quote {
  const identity = stock.market === 'US' ? data.symbolCode : data.itemCode;
  if (identity !== stock.symbol) throw new Error('Quote identity mismatch');
  const currency = stock.market === 'US' ? 'USD' : 'KRW';
  if (data.currencyType?.code && data.currencyType.code !== currency) throw new Error('Currency mismatch');
  const price = numberValue(data.closePrice);
  const tradedAt = new Date(data.localTradedAt);
  if (!price || price <= 0 || !Number.isFinite(tradedAt.getTime()) || tradedAt.getTime() > now.getTime() + 300_000) throw new Error('Invalid price or quote date');
  return {
    price, changePercent: numberValue(data.fluctuationsRatio), currency,
    tradedAt: tradedAt.toISOString(), collectedAt: now.toISOString(), marketStatus: String(data.marketStatus || 'UNKNOWN'),
    sourceUrl: stock.market === 'US' ? `https://m.stock.naver.com/worldstock/stock/${stock.providerCode}/total` : `https://m.stock.naver.com/domestic/stock/${stock.symbol}/total`,
  };
}
export function safeUrl(value: unknown): string | null {
  try { const u = new URL(String(value)); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
export function normalizeNews(items: any, now = new Date()): NewsItem[] {
  const input = Array.isArray(items) ? items : items ? [items] : [];
  const seen = new Set<string>();
  return input.flatMap((item: any) => {
    const url = safeUrl(item.link);
    const publishedAt = new Date(item.pubDate);
    const title = typeof item.title === 'string' ? item.title.replace(/<[^>]*>/g, '').trim() : '';
    if (!url || !title || seen.has(title) || !Number.isFinite(publishedAt.getTime()) || publishedAt > now || now.getTime() - publishedAt.getTime() > 14 * 86400000) return [];
    seen.add(title);
    const publisher = typeof item.source === 'object' ? item.source['#text'] : item.source;
    return [{ title, url, publisher: typeof publisher === 'string' ? publisher : '뉴스 원문', publishedAt: publishedAt.toISOString() }];
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
}
export function isStale(timestamp: string | null, now = new Date()): boolean {
  return !timestamp || !Number.isFinite(Date.parse(timestamp)) || now.getTime() - Date.parse(timestamp) > 36 * 3600000;
}

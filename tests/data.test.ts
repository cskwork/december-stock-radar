import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeQuote, normalizeNews, numberValue, isStale } from '../lib/normalize.ts';
import { collectStock } from '../lib/collect.ts';
import { authorized } from '../lib/auth.ts';
import type { Stock } from '../lib/types.ts';
const research = JSON.parse(readFileSync(new URL('../data/research.json', import.meta.url), 'utf8'));
const stocks = research.stocks as Stock[];
const now = new Date('2026-09-08T13:00:00Z');
const valid = { symbolCode: 'CRWV', closePrice: '93.26', fluctuationsRatio: '0', localTradedAt: '2026-09-08T08:55:00-04:00', currencyType: {code:'USD'}, marketStatus:'OPEN' };
test('zero movement is valid while missing and malformed data stay missing', () => {
  assert.equal(numberValue('0'),0); assert.equal(numberValue(null),null); assert.equal(numberValue(''),null); assert.equal(numberValue('--'),null);
  assert.equal(normalizeQuote(valid,stocks[0],now).changePercent,0);
});
test('quote cannot silently switch company, currency, or use future data', () => {
  assert.throws(()=>normalizeQuote({...valid,symbolCode:'AMD'},stocks[0],now));
  assert.throws(()=>normalizeQuote({...valid,currencyType:{code:'KRW'}},stocks[0],now));
  assert.throws(()=>normalizeQuote({...valid,localTradedAt:'2027-01-01'},stocks[0],now));
  assert.throws(()=>normalizeQuote({...valid,closePrice:'NaN'},stocks[0],now));
});
test('Korean prices retain won denomination and explicit trading timestamp', () => {
  const q=normalizeQuote({itemCode:'196170',closePrice:'277,000',fluctuationsRatio:'-3.15',localTradedAt:'2026-09-08T16:10:15+09:00'},stocks[2],now);
  assert.equal(q.price,277000); assert.equal(q.currency,'KRW'); assert.equal(q.tradedAt,'2026-09-08T07:10:15.000Z');
});
test('RSS drops invalid links, duplicates, future/old dates and strips markup',()=>{
  const good={title:'<b>새 계약</b>',link:'https://example.com/news',pubDate:'Tue, 08 Sep 2026 10:00:00 GMT',source:{'#text':'공식 발표'}};
  const rows=normalizeNews([good,good,{...good,title:'위험',link:'javascript:alert(1)'},{...good,title:'미래',pubDate:'2027-01-01'},{...good,title:'과거',pubDate:'2025-01-01'}],now);
  assert.equal(rows.length,1); assert.equal(rows[0].title,'새 계약');assert.equal(rows[0].publisher,'공식 발표');
});
test('failed providers preserve original timestamps and mark both components failed',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>{throw new Error('offline');};
  try {
    const oldQuote=normalizeQuote(valid,stocks[0],now);
    const item=await collectStock(stocks[0],{id:'crwv',quote:oldQuote,news:[],newsCollectedAt:now.toISOString(),quoteError:false,newsError:false});
    assert.equal(item.quote?.collectedAt,now.toISOString());assert.equal(item.quote?.price,93.26);assert.equal(item.quoteError,true);assert.equal(item.newsError,true);
  } finally {globalThis.fetch=original;}
});
test('staleness uses collection time so weekends do not fabricate failures',()=>{
  assert.equal(isStale('2026-09-08T12:00:00Z',now),false);assert.equal(isStale('2026-09-06T12:00:00Z',now),true);assert.equal(isStale(null,now),true);
});
test('cron authentication rejects missing, wrong and multibyte input without throwing',()=>{
  assert.equal(authorized('Bearer correct','correct'),true);assert.equal(authorized(null,'correct'),false);assert.equal(authorized('Bearer incorrect','correct'),false);assert.equal(authorized('Bearer 한한한한한한한','correct'),false);
});
test('fixed ten-stock universe, source dates and rank integrity survive daily edits',()=>{
  assert.equal(stocks.length,10); assert.equal(new Set(stocks.map(s=>s.id)).size,10);
  assert.deepEqual(stocks.map(s=>s.rank).sort((a,b)=>a-b),[1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(stocks.map(s=>s.symbol).sort(),['CRWV','NBIS','196170','000660','MU','AMD','ASTS','042700','RKLB','NVDA'].sort());
  for(const s of stocks){assert.ok(s.thesis&&s.risk&&s.watch);assert.ok(s.sources.length);for(const source of s.sources){assert.ok(source.url.startsWith('https://'));assert.ok(Date.parse(source.date)<=Date.parse(s.reviewedAt));}}
});

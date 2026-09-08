import { readFile, writeFile } from 'node:fs/promises';
import { collectMarket } from '../lib/collect.ts';
import type { Stock, MarketSnapshot } from '../lib/types.ts';
const research = JSON.parse(await readFile(new URL('../data/research.json', import.meta.url), 'utf8'));
let previous: MarketSnapshot | undefined;
try { previous = JSON.parse(await readFile(new URL('../data/market-seed.json', import.meta.url), 'utf8')); } catch {}
const snapshot = await collectMarket(research.stocks as Stock[], previous);
await writeFile(new URL('../data/market-seed.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
console.log(snapshot.items.map(i => ({id:i.id, price:i.quote?.price, tradedAt:i.quote?.tradedAt, news:i.news.length, quoteError:i.quoteError, newsError:i.newsError})));
if(snapshot.items.some(i=>i.quoteError)) process.exitCode = 1;

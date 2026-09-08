import { unstable_cache } from 'next/cache';
import research from '@/data/research.json';
import seed from '@/data/market-seed.json';
import { collectMarket } from './collect';
import type { MarketSnapshot, Stock } from './types';

export const getMarket = unstable_cache(
  () => collectMarket(research.stocks as Stock[], seed as MarketSnapshot),
  ['december-market-v1'],
  { revalidate: 86400, tags: ['december-market'] },
);

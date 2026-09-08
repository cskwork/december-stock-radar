import Dashboard from '@/components/dashboard';
import research from '@/data/research.json';
import { getMarket } from '@/lib/market';
import type { Stock } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export default async function Page() {
  const snapshot = await getMarket();
  return <Dashboard research={{ ...research, stocks: research.stocks as Stock[] }} snapshot={snapshot} />;
}

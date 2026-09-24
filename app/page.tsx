import Dashboard from '@/components/dashboard';
import research from '@/data/research.json';
import { getMarket } from '@/lib/market';
import { horizonProgress, OBSERVATION_START } from '@/lib/horizon';
import type { Stock } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const [snapshot, params] = await Promise.all([getMarket(), searchParams]);
  const requested = typeof params.stock === 'string' ? params.stock : undefined;
  return <Dashboard research={{ ...research, stocks: research.stocks as Stock[] }} snapshot={snapshot} initialStock={requested} horizon={horizonProgress(OBSERVATION_START, research.horizon, new Date())} />;
}

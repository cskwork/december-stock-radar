import { authorized } from '@/lib/auth';
import { revalidateTag } from 'next/cache';
import { getMarket } from '@/lib/market';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return Response.json({ error: 'Scheduler is not configured' }, { status: 503 });
  if (!authorized(request.headers.get('authorization'), expected)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  revalidateTag('december-market', { expire: 0 });
  const snapshot = await getMarket();
  const failed = snapshot.items.filter(i => i.quoteError || i.newsError).map(i => i.id);
  return Response.json({ refreshedAt: snapshot.collectedAt, quotes: snapshot.items.filter(i => !i.quoteError).length, newsFeeds: snapshot.items.filter(i => !i.newsError).length, failed }, { status: failed.length ? 503 : 200 });
}

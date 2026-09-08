import { getMarket } from '@/lib/market';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET() {
  return Response.json(await getMarket(), { headers: { 'Cache-Control': 'no-store' } });
}

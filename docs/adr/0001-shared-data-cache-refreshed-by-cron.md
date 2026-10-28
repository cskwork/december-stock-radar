# 0001. Shared data cache refreshed by a daily cron

Status: accepted. Introduced in 3519e98 (2026-09-08).

## Context

The dashboard shows quotes and headlines for ten fixed stocks. Every page view would otherwise call two undocumented public providers for each stock (20 requests). That would be slow, would risk rate limits, and would let one provider hiccup break a page view. The product is a daily research view, not a trading screen (`PRODUCT.md`, `README.md`).

## Decision

- `lib/market.ts` wraps `collectMarket` in Next's `unstable_cache` with tag `december-market` and `revalidate: 86400`.
- Vercel Cron (`vercel.json`, `0 23 * * *`) calls `app/api/cron/route.ts`. The route calls `revalidateTag('december-market', { expire: 0 })` and then `getMarket()`, so the next reader gets fresh data.
- The page and `GET /api/market` only read the cache. The UI refresh button calls the same cached endpoint.
- The cron route is protected by a bearer `CRON_SECRET`. It fails closed with 503 when the secret is unset.

## Consequences

- Upstream load is about one collection per day, plus cache misses.
- Data is up to about 24 h old by design. The UI shows collection and trade times.
- The 24 h `revalidate` is a safety net if the cron does not run.
- The design depends on Vercel's data cache and Cron. Running elsewhere would need a different scheduler.

## Alternatives considered

- Fetch on every request (`no-store`): simpler, but adds per-view latency, ties availability to the providers, and puts more load on them.
- Static rebuild per day (redeploy only): this is already used for the editorial lane, but it needs a build for each quote refresh.

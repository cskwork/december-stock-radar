# Architecture

## Components

| Path | Role |
|---|---|
| `app/page.tsx` | Server component (`force-dynamic`). Reads `getMarket()` and `data/research.json`, computes the observation countdown, and renders the dashboard. |
| `components/dashboard.tsx` | Client component. Market filter, sort (editorial rank or daily change), keyboard navigation, `?stock=` deep links, stale/error labels, and a "refresh" button that calls `GET /api/market`. |
| `app/api/market/route.ts` | Public read endpoint. Returns the cached snapshot with `Cache-Control: no-store`, so the HTTP response is not cached but the data cache is. |
| `app/api/cron/route.ts` | Daily refresh. Checks the bearer secret, calls `revalidateTag('december-market')`, then recollects. Returns counts and the failed ids. The status is 503 if any stock failed. |
| `lib/market.ts` | `getMarket = unstable_cache(collectMarket(...), ['december-market-v1'], { revalidate: 86400, tags: ['december-market'] })`. |
| `lib/collect.ts` | Fetches a quote and a news feed for each stock with `Promise.allSettled`. Stocks are processed in batches of 3, each request has a 12 s timeout, and a failed component falls back per stock. |
| `lib/normalize.ts` | Pure validation and normalization of quotes and RSS items, plus `isStale` (36 h). |
| `lib/auth.ts` | Constant-time bearer comparison. |
| `lib/horizon.ts` | Pure helpers: Seoul calendar day, D-day progress to `research.horizon`, ledger keyboard movement, deep-link validation. |
| `scripts/refresh-seed.ts` | Runs the same `collectMarket` locally and rewrites `data/market-seed.json`. Exits 1 if any quote failed. |
| `data/research.json` | Editorial data: `horizon`, `brief`, `history`, and ten `stocks` with `rank`, `thesis`, `risk`, `watch`, `reviewedAt`, and dated `sources`. |
| `data/market-seed.json` | The last committed market snapshot, bundled with the deploy and used as the fallback. |

## Data flow

1. **Scheduled refresh.** Vercel Cron (`vercel.json`, `0 23 * * *` UTC = 08:00 KST) calls `GET /api/cron` with `Authorization: Bearer $CRON_SECRET`.
2. The route invalidates the `december-market` tag and calls `getMarket()`, which runs `collectMarket(research.stocks, seed)`.
3. For each stock, `collectStock` fetches two things in parallel:
   - Quote: US stocks use `https://api.stock.naver.com/stock/<providerCode>/basic`; KR stocks use `https://m.stock.naver.com/api/stock/<symbol>/basic`.
   - News: a Google News RSS search for `<name> 주식 when:14d` (ko/KR).
4. `normalizeQuote` checks the response's identity (`symbolCode` or `itemCode` must equal the requested symbol). It also checks the currency (USD/KRW), that the price is positive, and that the trade time is no more than 5 minutes in the future. It records `tradedAt` and `collectedAt` separately.
5. `normalizeNews` keeps `https:` links only, removes markup, and drops duplicate titles, future items, and items older than 14 days. It keeps the 3 newest items.
6. The snapshot `{ collectedAt, items[] }` is stored in the Next data cache. Page renders and `/api/market` read it until the next revalidation or the 24 h fallback expiry.
7. **Editorial lane.** This lane is separate and runs outside this repo's runtime. A scheduled review that follows `DAILY_REVIEW.md` edits `data/research.json` from primary sources (IR, SEC, DART). It runs `npm run refresh:seed`, `npm test`, and `npm run build`, then redeploys.

## External dependencies

- Naver stock JSON endpoints (public, unauthenticated, undocumented).
- Google News RSS (public, unauthenticated).
- Vercel: hosting, Cron, and the Next.js data cache (region `icn1`).
- npm packages: `next` 16.3.4, `react` 19.2.4, `fast-xml-parser` (RSS), `lucide-react` (icons).

## Secrets

- `CRON_SECRET` is the only secret. It is read on the server in `app/api/cron/route.ts` and never sent to the client.
- The data providers need no API key.
- `.env*` is git-ignored, except for `.env.example`.

## Failure handling

| Failure | Behavior | Where |
|---|---|---|
| A provider times out or returns non-2xx, or the RSS is invalid | That component falls back to the seed value. `quoteError`/`newsError` is set to `true`, and the old `collectedAt`/`newsCollectedAt` is kept. | `lib/collect.ts` |
| A quote for the wrong symbol or currency, a future time, or a non-positive price | `normalizeQuote` throws, which leads to the fallback above. | `lib/normalize.ts` |
| Data older than 36 h by collection time | The UI labels the quote "이전 자료" and shows an "incomplete" notice. Weekends do not count as failures because staleness uses collection time, not trade time. | `isStale`, `components/dashboard.tsx` |
| Analysis older than 36 h | A separate "analysis old" flag. | `components/dashboard.tsx` (`analysisOld`) |
| Any stock failed during cron | The route returns 503 with the `failed` ids, which shows in the Vercel cron logs. | `app/api/cron/route.ts` |
| `CRON_SECRET` unset | The route returns 503 and does not refresh (fail closed). | `app/api/cron/route.ts` |
| A render error | The `app/error.tsx` retry screen. | `app/error.tsx` |

The fallback is the seed that was **deployed**, not the last successful server-side quote. After a long outage, the screen shows the deploy-time values with their original dates.

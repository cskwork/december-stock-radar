# 0002. Per-stock seed fallback with visible error flags

Status: accepted. Introduced in 3519e98 (2026-09-08).

## Context

The two providers (Naver quotes, Google News RSS) fail independently, and each stock can fail separately. An empty card is unhelpful. Silently showing old data as current would mislead the reader (`PRODUCT.md`: "Show source dates, errors, stale data").

## Decision

- `collectStock` in `lib/collect.ts` fetches the quote and news with `Promise.allSettled`. Each component falls back to the matching item in `data/market-seed.json`.
- A fallback item keeps its original `collectedAt`/`newsCollectedAt` and sets `quoteError`/`newsError`.
- `isStale` (`lib/normalize.ts`) flags data older than 36 h by collection time. The dashboard labels such rows "이전 자료 · <trade date>".
- `/api/cron` returns 503 with the failed ids, so operators see partial failure. `scripts/refresh-seed.ts` exits 1 if any quote failed.

## Consequences

- The page always renders ten rows. Failures are explicit in the UI, the API, and the cron status.
- The fallback is the seed from the last deploy, not the last successful runtime fetch, because the cache does not keep history. `README.md` states this limitation.
- The test `failed providers preserve original timestamps and mark both components failed` (`tests/data.test.ts`) locks this behavior.

## Alternatives considered

- Fail the whole snapshot when any provider fails: one broken feed would hide nine good ones.
- Keep the last good value in a database or KV store: this would give fresher fallbacks but adds a stateful dependency. The repo has none.

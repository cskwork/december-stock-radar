# Daily review contract

User authorization: Publish to Vercel and update the existing ten stocks' prices, news, and recommendation rationale daily. Do not replace the ten-stock universe. Site and daily data redeployment are authorized; unrelated UI changes, paid data subscriptions and financial transactions are outside scope.

## Run at 09:00 Asia/Seoul
1. Read `data/research.json` and the previous history. Research every stock's new official filings, earnings releases, contracts, and milestones since its actual last review. Use official IR, SEC and DART first; date-stamped reputable reporting can supplement. The original conversation and RSS headlines are not authority for new claims. Read the actual source body before recording a factual change.
2. Keep names, IDs, currency and universe intact. Update `thesis`, `risk`, `watch`, sources and reviewedAt only when that company has actually been checked. If the rationale is unchanged, keep its text and record that conclusion. Change rank only with a documented fundamental reason, never automatically from daily returns. Keep ranks 1–10 unique. Do not invent expected returns, December targets, or claim market-wide optimality. Maintain dates on any source, and identify forecasts as forecasts.
3. Update `brief`, `reviewNote` and `history` with concise Korean. Bump global `reviewedAt` only after all ten reviews succeeded. Partial failures retain the prior global timestamp, individual unreviewed timestamps, and a note of the failure. Keep at most 30 history entries. If a premise is disproven, say so in the rationale rather than manufacturing another bullish thesis.
4. Run `npm run refresh:seed`. Any failure must remain visible via `quoteError`, `newsError` and original timestamps. Do not repair it by inventing data. The Vercel `/api/cron` also collects market data daily independently at 23:00 UTC, 08:00–09:00 KST depending on scheduler timing. Public `GET /api/market` reads cached daily data; the UI button does not force upstream refresh.
5. Run `npm test` and `npm run build`. If both pass, stage only research and seed changes, commit, then `vercel deploy --prod --yes --scope agentic-era`. Git remote creation/push is not necessary. Preserve the existing linked project and `.env.local`, never print secrets. Do not broaden publish scope.
6. Check production deployment is READY, anonymous public HTTP is 200, `/api/market` contains ten quotes with source timestamps, and homepage contains the updated review note or date. A build alone does not prove publication. Record failures in history where possible; do not claim fresh verification if failed.
7. Notify the user only for a material thesis/risk/ranking change, failed review/collection/deployment or required action. Routine quote movement or changed check timestamps stay quiet.

## End of horizon
After 2026-12-31, keep the historical thesis and do not silently roll the investment horizon forward. Notify once that the observation window ended and pause the associated Codex heartbeat `12-10` with the automation tool.

## Runtime and source boundaries
- Codex review requires the user's computer and Codex execution environment to be available. Vercel price/news cron is hosted independently.
- `data/research.json`: dated editorial analysis. `data/market-seed.json`: last deployment's fallback, not a live price guarantee. `lib/collect.ts`: provider access. `lib/normalize.ts`: validation. `vercel.json`: hosted daily schedule.
- Public site: https://december-stock-radar.vercel.app
- Price provider: Npay/Naver. News: related Google News RSS headlines and outbound links, personal non-commercial reader. No article bodies are republished.

# 12월의 관찰목록
Korean daily research dashboard for the ten US/Korean stocks selected in the conversation, through 2026-12-31.

## Run
`npm install`, `npm run dev` (port 3106). `npm test` checks market data validity and update boundaries. `npm run build` checks production output.

## Update
- Vercel cron at 23:00 UTC: quote/news refresh with a protected bearer secret. Each component retains its source timestamp. A successful revalidation changes the shared server data cache. No browser needs to stay open.
- Codex daily review at 09:00 KST: dated editorial update and production redeployment. Follow DAILY_REVIEW.md. The local execution environment must be available.
- Reading `/api/market` uses the daily cache, with a 24-hour revalidation fallback. This is not real-time market data. `/api/cron` requires the `CRON_SECRET` environment variable; unavailable credentials fail closed.
- Failed providers are visibly marked; the last deployed seed can be displayed as dated fallback. The fallback is not guaranteed to be the most recent successful server-side quote.
- No price targets, claimed forecast returns, trading actions, private user finances, or API keys reach the client.

## Deploy
Existing project `agentic-era/december-stock-radar`. Use `vercel deploy --prod --yes --scope agentic-era`. Keep production CRON_SECRET configured and do not print it. Anonymous public URL: https://december-stock-radar.vercel.app

Pretendard font is bundled under its SIL Open Font License in public/fonts/LICENSE.txt.

# Evidence plan
- Validate quote parsing, zero vs missing data, market/currency identity, news sanitation and dates with offline unit tests.
- Build/typecheck; run actual live collection for ten stocks with source timestamps.
- Exercise production read endpoint and authenticated daily cron; verify public HTML and scheduled job configuration.
- Inspect desktop and mobile, keyboard selection, market filters, empty results, and detail sources in one browser pass; fix only observed defects.
- Daily recommendation review uses a Codex heartbeat. Keep analysis timestamp separate from collection timestamp; first future scheduled execution remains unproven until observed.

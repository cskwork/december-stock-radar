# 0003. Reject quotes that cannot prove identity, currency, and time

Status: accepted. Introduced in 3519e98 (2026-09-08).

## Context

The quote endpoints are undocumented, and US and KR stocks use different URLs and field names (`symbolCode` vs `itemCode`). A wrong mapping, a redirect, or a format change could show another company's price, a price in the wrong currency, or a malformed number. A zero change must stay distinct from a missing change.

## Decision

`normalizeQuote` in `lib/normalize.ts` throws unless all of these hold:

- the returned symbol equals `stock.symbol`;
- the `currencyType.code`, if present, equals USD (US) or KRW (KR);
- `closePrice` parses to a positive finite number (commas allowed, so `277,000` becomes 277000);
- `localTradedAt` is a valid date no more than 5 minutes in the future.

`numberValue` keeps `'0'` as 0, and `''`, `null`, and `'--'` become `null`. The thrown error leads to the seed fallback (ADR 0002).

## Consequences

- A provider change shows up as `quoteError` instead of a wrong number.
- Valid but unusual responses are also rejected, for example a missing `localTradedAt`.
- Covered by tests in `tests/data.test.ts`: identity, currency, future date, NaN price, KRW comma parsing, and zero vs missing.

## Alternatives considered

- Trust the provider response: less code, but a wrong price would look like a real one.
- Schema validation library (e.g. zod): not used. The checks are few and hand-written to avoid a dependency.

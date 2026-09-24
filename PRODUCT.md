# December stock radar
<!-- impeccable:product-schema 1 -->
## Platform
web
## Users
The user tracks ten previously selected US and Korean stocks through December 2026, checking prices, news, and the investment thesis daily.
## Purpose
A readable Korean comparison and research dashboard published to Vercel. The user confirmed daily updates for the existing ten stocks rather than daily replacement of the universe.
## Constraints
Separate observed market data, dated source-backed analysis, and subjective original priorities. No invented target prices or returns. Show source dates, errors, stale data, and risks. Do not publish personal financial data. Vercel publication and daily updates are explicitly authorized.
## Brand
Visual world since 2026-09-24: a field observation book (yellow cover, graph-ruled pages). See DESIGN.md. Chosen by an unattended redesign run under the owner's "proceed as recommended" approval, not picked by the owner from options.
## Stack
Implementation choice: Next.js for Vercel hosted data caching and daily cron, React for accessible comparisons. Not a user-established preference.
## Evidence
The preceding conversation contains the ordered ten stocks and research source URLs. Validate external feeds and date handling before claiming automatic updates.
## Accessibility
User explicitly prioritizes readability. Support Korean text, large body type, mobile layouts, keyboard use (arrow keys move through the ten rows), and readable contrast. Each stock entry has a shareable address (`?stock=<id>`) and browser back/forward moves between opened entries.

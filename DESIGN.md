---
name: 12월의 관찰목록
description: A field observation book for ten stocks watched through 2026-12-31
colors:
  cover-yellow: "#f2c200"
  cover-edge: "#d8a800"
  cover-muted-ink: "#3b3100"
  page-white: "#ffffff"
  carbon-ink: "#141619"
  pencil-gray: "#565e67"
  rule-gray: "#d8dfe5"
  rule-soft: "#e9edf0"
  cloth-tape: "#1b1b19"
  highlighter: "#fff3b0"
  yellow-wash: "#fffae0"
  market-up-red: "#c3122f"
  market-down-blue: "#1a57c2"
  caution-amber: "#8a4600"
typography:
  display:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "52px"
    fontWeight: 800
    lineHeight: 1.14
    letterSpacing: "-0.04em"
  countdown:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "76px"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "18px"
    fontWeight: 750
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "13px"
    fontWeight: 750
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  grid: "24px"
  row: "15px"
  gutter: "36px"
  shell: "32px"
components:
  tape-label:
    backgroundColor: "{colors.cloth-tape}"
    textColor: "{colors.cover-yellow}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  index-tab-active:
    backgroundColor: "{colors.cover-yellow}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px 8px"
  button-outline:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.none}"
    padding: "7px 13px"
  button-outline-hover:
    backgroundColor: "{colors.highlighter}"
  ledger-row-selected:
    backgroundColor: "{colors.highlighter}"
    textColor: "{colors.carbon-ink}"
    padding: "15px 12px"
  stamp:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.none}"
    padding: "3px 10px"
---

# Design System: 12월의 관찰목록

## Overview

**Creative North Star: "The field observation book"**

The site is an all-weather field notebook kept for ten stocks. A chrome-yellow cover carries the title and the D-day countdown to 2026-12-31; below it, white pages ruled with a pale blue-gray graph grid hold a numbered specimen ledger and one open entry. Every entry keeps field-science discipline: what was observed (price, trade time, headline) sits apart from what was interpreted (thesis, counterargument, what to check next), and every claim carries its date and source.

Density is moderate and readable. Korean text runs large with generous leading, numerals are tabular, corners are square, and hairline rules do the structural work that cards would do elsewhere. Color is restrained: yellow marks the cover, the active tab and the selected row; black cloth tape marks labels and spines; red and blue follow Korean market convention for up and down.

**Key Characteristics:**
- Yellow cover band with a 10px black cloth-tape edge, taped key-art photo on wide desktops
- Graph-ruled page ground (24px minor, 120px major) behind the ledger and entry pane
- "관찰한 것" / "해석한 것" split inside every entry
- Freshness shown as stamps; delayed states are dashed and hatched, never color alone
- Square corners everywhere; depth only from the pane's single soft shadow and the taped photo

## Colors

A restrained palette: one cover yellow, carbon ink, pencil gray, and two market-convention signals.

### Primary
- **Cover Yellow** (#f2c200): the cover band, active filter tab, entry number tag, text selection, and brand mark lettering. Never used for body text.
- **Cloth Tape** (#1b1b19): cover bottom edge, entry pane top edge, tape labels, selected rank chip, progress fill.

### Secondary
- **Highlighter** (#fff3b0): selected ledger row, "다음에 확인할 것" box, button hover.
- **Yellow Wash** (#fffae0): the observed-data block and row hover.

### Neutral
- **Page White** (#ffffff): page ground under the grid, panes, controls.
- **Carbon Ink** (#141619): text, rules that separate sections (1-2px), control borders.
- **Pencil Gray** (#565e67): secondary text, captions, dates (6.4:1 on white).
- **Rule Gray** (#d8dfe5) / **Rule Soft** (#e9edf0): row dividers and link list dividers.

### Signal
- **Market Up Red** (#c3122f) and **Market Down Blue** (#1a57c2): price change only, plus risk tags in red.
- **Caution Amber** (#8a4600): stale data, delayed collection, pending review; always paired with dashed borders and a hatch pattern.

### Named Rules
**The Cover Rule.** Yellow belongs to the cover and to "this is the one you are looking at" (active tab, selected row, entry number). It never decorates.
**The Pattern-Not-Just-Color Rule.** Every degraded state (stale quote, delayed feed, pending review) is dashed and hatched as well as amber, and states its meaning in words.

## Typography

**Display Font:** Pretendard (self-hosted variable woff2, SIL OFL), falling back to the system sans
**Body Font:** Pretendard

**Character:** One workhorse Korean sans, pushed to heavy weights (800-850) for the cover title and countdown and kept at 400 with 1.85 leading for reading.

### Hierarchy
- **Countdown** (850, 76px desktop / 54px mobile, 0.95): the D-day stamp only.
- **Display** (800, 52px / 44px under 1180px / 34px mobile, 1.14, -0.04em): the cover title.
- **Headline** (800, 34px, 1.25): the open entry's company name; section titles at 28px.
- **Title** (750, 18px, 1.4): ledger company names and prices; 20px for the entry summary line.
- **Body** (400, 16.5px, 1.85, max 68ch): thesis, risk, method prose.
- **Label** (750, 13px): tape labels, stamps, entry number, filter counts. Dates and prices always `font-variant-numeric: tabular-nums`.

## Layout

A centered shell (max 1344px, 32px side padding; 24px under 1050px; 18px under 760px). Desktop is a 7:5 ledger/entry split with a 36px gutter; the entry pane is sticky (top 16px) and scrolls internally at viewport height from 1051px up. Under 760px the ledger stands alone and the entry opens in place below it (deep links open it directly). The body grid is 24px minor / 120px major; spacing follows it loosely (15px row padding, 22-26px block gaps, 44-56px before the method section).

## Elevation & Depth

Flat by default. Depth appears in two places only: the entry pane (`box-shadow: 0 18px 36px -24px rgba(20,22,25,.35)`) so it reads as a page lifted off the grid, and the taped cover photo (`0 14px 28px -10px rgba(70,50,0,.45), 0 2px 4px rgba(70,50,0,.2)`). Everything else separates by rules and fills.

## Shapes

Square corners everywhere (radius 0). Borders are 1px carbon ink for controls and panes, 2px ink for section tops, 10px cloth tape for the cover edge and pane top. The cover photo is the only rotated element (-2.5deg) with a translucent tape strip.

## Components

### Buttons
- **Shape:** square, 1px ink border.
- **Default:** white fill, ink text, 14px/650. Hover fills Highlighter. Disabled drops to 60% opacity with a wait cursor.
- **Primary (error/loading screens):** cloth-tape fill with cover-yellow text.

### Index tabs (market filter)
Notebook index tabs joined edge to edge above the ledger's 2px top rule. The active tab is Cover Yellow and rises 3px; counts in 12px pencil gray.

### Ledger rows
Grid of rank chip / name + symbol + sector / price + change / chevron. Rank chip is a 34x28 outlined square; selected turns cloth tape with yellow numerals and the row fills Highlighter. Arrow keys, Home and End move through rows.

### Stamps
Inline bordered labels for collection and review times. Fresh = solid ink border; delayed = dashed amber border over the hatch pattern.

### Entry pane (signature component)
10px tape top edge, entry-number tag, market/symbol, risk tag. Then "관찰한 것" (yellow-wash block with price, change, trade time, source), then "해석한 것" (summary, thesis, risk, what to check next), then dated sources and headlines. Changing entries replays a 280ms ease-out from 72% opacity; reduced motion removes it. The URL carries `?stock=<id>` so entries are shareable and back/forward works.

## Do's and Don'ts

### Do:
- **Do** keep observed data and interpretation in separate, labeled parts of an entry.
- **Do** show every date and time in Korea time with tabular numerals.
- **Do** mark degraded data with words plus dashed/hatched treatment in Caution Amber.
- **Do** use red for up and blue for down, the Korean market convention.

### Don't:
- **Don't** add target prices, projected returns, or decorative charts (PRODUCT.md).
- **Don't** round corners or add card grids; rules and fills carry the structure.
- **Don't** spread Cover Yellow beyond the cover and selection states.

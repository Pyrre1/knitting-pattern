# TODO

## Phase 2 roadmap (test deploy)
One phase per chat. Start a chat with "Do Phase X from TODO.md"; decisions below are settled.

### Phase A — notice + docs ✔
- [x] CLAUDE.md frontend map
- [x] Prototype notice dialog (first visit, remembered) + footer link; `frontend/config.js` holds `FEEDBACK_EMAIL`, `FUTURE_URL`

### Phase B — print upgrade + upside down ✔
- [x] Core: `rotateGrid(grid, '180')` + test. `#rotate` gets "Upside down (180°)" for image and text
      (folded hem: motif knitted upside down). Chart, instructions, print and live view follow it.
      Text: compose with unrotated gauge, then rotate. Hint text in en + sv.
- [x] New `frontend/print.js`; `index.js` only wires it up.
- [x] Button "Print / Save PDF" (browser print-to-PDF, no dependency). Keep Save PNG.
- [x] Orientation select portrait / landscape → injected `@page { size: … }` (CSP: no inline
      `<style>`; use a stylesheet toggled by class or CSSOM `insertRule`). Firefox may ignore it.
- [x] Print-only info block:
      - gauge (stitches/rows per 10 cm or 4 in, as entered)
      - final size: stitches × rows, and cm or inch (follows the selected unit)
      - text: letter height in rows (or stitches when rotated 90°), and cm/inch
      - rotation: "Upside down (hem): yes" only when chosen, plus 90° right/left if used
      - knitting setup: start bottom up / top down, flat (back and forth) / in the round
      - footer: "This pattern was created at <AppName - url>", date, "(currently just a prototype)" (print and PNG)
- [x] PNG: checkbox "Include info" adds the info block as a text strip under the chart; unchecked = chart only.
- [x] Footer name: `APP_NAME` in `config.js`; set → "AppName - url", empty → url only.
- [x] Hint for upside down: right side of the motif must face out after folding (knit the cuff
      part with the inside as right side, e.g. work turned inside out). 180° alone is enough: no mirror needed.
- [x] Chart fits the page in the chosen orientation (now locked to screen width / 75vh).

### Phase B2 — print scale ✔
Replaces backlog item "Print size for long, narrow charts".
- [x] Checkbox "Print in scale" with a scale % (unchecked = normal print, chart fitted to the page).
      100 % = cells match the real knitted size; > 100 % for small intricate charts that need
      room to read and mark with a pen. Instructions keep their own size.
- [x] Scale larger than a page: split the chart into page tiles (`core/printTiles.js`), named A1, A2, B1 …,
      overview map on page 1, row/stitch numbers repeated on each tile, no overlap (cut along the chart edge).
      Each tile is placed against its joining edges (top row at the page bottom, left column at the right,
      middle ones centred), so one straight cut per join. Page 1: info, yarns and tile map in a 55 mm column
      beside A1 (first tile column planned narrower when needed).
      Paper: normal print → print dialog chooses paper and orientation; in scale → Paper (orientation)
      select, swatch in cm → A4, inch → "Paper size" select (Letter default, A4). `@page` margin 10 mm.
- [x] Save PNG in its own box, "Include info" ticked by default, hint: PDF prints faster and sharper, PNG for phone/iPad.
- [x] Browser print scale does not enlarge the chart (print CSS fits it), so we use our own scale + tiles.
      Hint in the confirm: keep browser scale at 100 % / Default.
- [x] Estimate pages; confirm when > 4 ("Needs about X pages"); duplex tip. Ctrl+P skips the confirm.
- [x] Chart drawing moved from `index.js` to `frontend/chart.js` (`drawChart` draws whole chart or a region).

### Phase C — prototype banner
- [x] Permanent banner above Swatch / Yarns (`frontend/banner.js`), pale amber against the green theme:
      "This is a prototype. Please email feedback or suggestions to <FEEDBACK_EMAIL>. Last update: <date>".
      en + sv. Hidden in print. First-visit dialog and footer link stay.
- [x] Date written at build time: `Dockerfile` overwrites `frontend/version.js` (`LAST_UPDATE`, ISO date).
      Committed default is empty → no date locally. No email → no email sentence.

### Phase D — live view
- [ ] New `frontend/liveView.js`; "Live view" button opens a fullscreen view.
- [ ] Full chart, current row highlighted; current `formatInstruction` text shown large.
- [ ] Big Prev / Next buttons, arrow keys, tap.
- [ ] Wake Lock API keeps the screen on; re-acquire on `visibilitychange`; fallback hint
      "keep screen on" when unsupported (iOS Safari < 16.4) or without HTTPS.
- [ ] Progress saved in localStorage keyed by a pattern hash (grid + options).
- [ ] Zoom: pinch on touch, Ctrl+scroll / buttons on PC; keep current row in view.
- [ ] Map instruction ↔ displayed row via `rowInstructions` `displayRow`; core helper + test only if needed.

### Phase E — deploy hygiene
- [ ] `robots.txt` (prototype: `Disallow: /`). Served from `/srv`: add `COPY` to `Dockerfile`.
- [ ] `<meta name="robots" content="noindex">`, meta description, favicon.
- [ ] Caddy: optional 404 page; security headers beyond CSP are at the edge (pi-infra).
- [ ] Real site later: allow indexing, `sitemap.xml`, Open Graph image, redirect from prototype address.

## Backlog

Deferred until after the local visual MVP.

- [ ] Yarn limit: free tier max 4 yarns; more than 4 as a possible premium feature.
      `pairYarns` brute-forces all assignments (n! growth) — replace with Hungarian
      algorithm if the limit is raised much beyond ~8.
- [ ] Cache patterns per yarn count, so switching 3 → 2 → 4 → 3 yarns reuses results.
      Measured: full recount takes ~75 ms on a 600 px logo, so probably not needed.
- [ ] Transparency handling option (`fromImageData` currently blends onto white):
      - blend onto a user-chosen background colour (cheap: parameterise the blend colour)
      - use the nearest opaque bordering colour
      - treat transparent as its own palette colour when yarn count exceeds the logo's colours
- [ ] Majority-vote stitches: map each pixel to the palette, then take the most common
      colour per cell instead of averaging. May keep very thin lines more continuous.
- [x] Layout polish: input fieldsets (Image, Swatch, Final size, Yarns) overlap at some widths;
      "Settings are locked" notice sits below the form, easy to miss.
- [ ] Text tools (pro candidates):
      - colour one letter (or word) with its own yarn (per-letter palette index in `composeText`)
      - nudge single letters up/down/sideways (per-letter offset)
      - set height and width independently (stretch letters) instead of fixing two of three
- [ ] Row help contrast: shade adapts to light/dark yarns; if still too faint on mid tones,
      offer a secondary marker (e.g. hatching or a row-edge marker).
- [ ] Stitch view (preview): decide after trying it whether to develop further (highlights,
      in print/PNG as an option) and whether it is a pro feature.
- [x] (done in Phase B2) Print size for long, narrow charts (e.g. scarves). A canvas cannot split across
      pages, so print currently fits the chart on page 1 (`max-height: 75vh`): fine for
      e.g. 88 × 52, but scarf cells get too small to follow or mark with a pencil.
      - print option: fit to page (default) / mid-sized cells (more paper) / full width
        (most paper, easiest to read, suits detailed colourwork)
      - minimum print cell size; warn if the chosen size cannot be met
      - needs the chart split into page-sized slices (repeat row numbers on each slice)
      - on Print, if estimated pages > 4: confirm "Needs about X pages"; tip: without
        duplex, print odd pages, flip the stack, print even pages

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

### Phase C2 — quick fixes
- [x] Gauge default 22 × 28 (now 22 × 30): `#swatch-rows` in `index.html`; check README/tests for 30.
- [x] Small note under "Choose image" inside the Image fieldset: "All processing on your device,
      no image is uploaded" (en + sv). Shown even if the About page is never read.
- [x] Normal print / Save PDF: stop the visible re-render. Now `beforeprint` calls
      `redraw(printScale(…))` on the on-screen canvas and `afterprint` redraws at 1, so the page
      changes behind the print dialog (most visible with stitch view) and print opens slowly.
      Options: print the current canvas as is (print CSS already scales it down), or draw a
      print-only canvas (hidden on screen) at a modest scale. Check sharpness in the PDF first;
      print in scale (tiles) already uses separate canvases and is not affected.

### Phase D — deploy hygiene ✔
- [x] `robots.txt` (prototype: `Disallow: /`). Served from `/srv`: add `COPY` to `Dockerfile`.
- [x] `<meta name="robots" content="noindex">`
- [x] Meta description, favicon (`frontend/favicon.svg`; `/favicon.ico` redirects to it).
- [x] Caddy: 404 page (`frontend/404.html`, en + sv, via `handle_errors`); security headers beyond CSP are at the edge (pi-infra).
- [ ] (later, not part of Phase D) Real site: allow indexing, `sitemap.xml`, Open Graph image, redirect from prototype address.

### Phase E — menu + About page
- [ ] Menu row at the top: Pattern (current landing page) | About | Live view (from Phase G (b);
      hidden until D is done). New module (e.g. `frontend/menu.js`); no inline scripts (CSP).
- [ ] About page: no account, nothing stored on a server, all calculations on the device, images
      never uploaded. The app does **not** save your work: a refresh loses it.
- [ ] Saving in the browser (live view patterns and progress, localStorage): stays on the user's
      device only, never sent to us. Lost when site data/cookies are cleared (plain cache clear may
      not remove it). Wording, on About and next to the save action: "By saving a pattern or using
      live view you allow this site to store data in your browser (local storage). The pattern is
      not saved by us and may be lost if you clear your browser data."
      Storage the user asks for needs no cookie banner (ePrivacy "strictly necessary"); notice only.
- [ ] Examples section on About (placeholder until pictures exist; hidden while empty).
- [ ] en + sv for all text.

### Phase F — more yarns
- [ ] Number of yarns: 2, 3, 4, "More…". "More…" shows a second select: 5–8 and "Crazy time…".
      First select keeps 2–4.
- [ ] First: replace `pairYarns` brute force (n!) with the Hungarian algorithm (O(n³)). Same exact
      optimum (no accuracy loss), tests unchanged. Brute force freezes from ~11 own yarns (11! ≈ 40 M).
      After this, matching is never the bottleneck.
- [ ] Real cost of more yarns is colour reduction (k-means on the full image), roughly linear.
      Measured (600 × 600 px, 150 stitches, PC): 4 → 250 ms, 8 → 360 ms, 12 → 460 ms, 20 → 600 ms.
      Chart drawing and painting cost per stitch, not per yarn. Phones maybe 3–5× slower. Re-measure
      after the Hungarian change; adjust wording to the numbers.
- [ ] Warning when "More…" is chosen (honest): "More yarns make each recalculation slower
      (a second or more on phones). Many colours per row are also hard to knit."
- [ ] "Crazy time…" unlocks 9–20: two confirms, the second "Are you **sure**? Recalculating may take
      several seconds on slower devices."
      Hint in that dialog: "Best suited for embroidery, e.g. duplicate stitch (Swiss darning) on
      finished knitting, rather than knitting all colours in." No crash claim unless measurement shows a real risk.

### Phase G — live view
- [ ] Entry points: (a) "Live view" button in the Output box (beside Print / Save PDF) for the
      rendered pattern; (b) "Live view" in the menu (Phase E) loading a pattern saved on the device.
      localStorage is enough for (b) (grid + palette + options as compact JSON, well under the ~5 MB
      limit), so build both. (b) needs a list of saved patterns (name, date, delete).
- [ ] New `frontend/liveView.js`; "Live view" button opens a fullscreen view.
- [ ] Full chart, current row highlighted; current `formatInstruction` text shown large.
- [ ] Big Prev / Next buttons, arrow keys, tap.
- [ ] Wake Lock API keeps the screen on; re-acquire on `visibilitychange`; fallback hint
      "keep screen on" when unsupported (iOS Safari < 16.4) or without HTTPS.
- [ ] Progress saved in localStorage keyed by a pattern hash (grid + options).
- [ ] Zoom: pinch on touch, Ctrl+scroll / buttons on PC; keep current row in view.
- [ ] Map instruction ↔ displayed row via `rowInstructions` `displayRow`; core helper + test only if needed.

## Backlog

Deferred until after the local visual MVP.

- [x] (moved to Phase F) Yarn limit. No premium tier: no payments, accounts or stored user data.
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
- [ ] Text tools:
      - colour one letter (or word) with its own yarn (per-letter palette index in `composeText`)
      - nudge single letters up/down/sideways (per-letter offset)
      - set height and width independently (stretch letters) instead of fixing two of three
- [ ] Handwriting font for text (Swedish "skrivstil"), low priority. Needs a free-licence font
      shipped with the app (self-hosted, CSP `'self'`). Joined letters break the "each letter drawn
      once" model in `textGrid.js` (glyphs would need to connect).
      - optional: load fonts from the device. Local Font Access API is Chromium-only; a font file
        picker (.ttf/.otf/.woff via `FontFace`) works in all browsers and stays on the device.
- [ ] Row help contrast: shade adapts to light/dark yarns; if still too faint on mid tones,
      offer a secondary marker (e.g. hatching or a row-edge marker).
- [ ] Stitch view (preview): decide after trying it whether to develop further (highlights,
      in print/PNG as an option).
- [x] (done in Phase B2) Print size for long, narrow charts (e.g. scarves). A canvas cannot split across
      pages, so print currently fits the chart on page 1 (`max-height: 75vh`): fine for
      e.g. 88 × 52, but scarf cells get too small to follow or mark with a pencil.
      - print option: fit to page (default) / mid-sized cells (more paper) / full width
        (most paper, easiest to read, suits detailed colourwork)
      - minimum print cell size; warn if the chosen size cannot be met
      - needs the chart split into page-sized slices (repeat row numbers on each slice)
      - on Print, if estimated pages > 4: confirm "Needs about X pages"; tip: without
        duplex, print odd pages, flip the stack, print even pages

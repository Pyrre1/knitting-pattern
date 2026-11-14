# Done
<!-- Index: finished phases, oldest first. Read only the section you need: grep -n "### Phase X" DONE.md.
A    first-visit notice, config.js
B    print / Save PDF, info block, PNG strip, upside down (rotate 180), orientation @page
B2   print in scale, page tiles (printTiles.js), chart.js split, page estimate confirm
C    prototype banner (banner.js), build date (version.js, Dockerfile)
C2   quick fixes: default gauge, "no upload" note, print-only canvas
D    deploy hygiene: robots, noindex, favicon, 404, Caddy
E    menu (menu.js), About, Changes page (changes.js)
F    up to 20 yarns (yarnCount.js), Hungarian pairYarns, yarnAdvice, timings
Backlog (done): yarn limit, layout polish, print size for long charts
For a new phase built like an old one: copy that phase's step structure (core + test → module → i18n en/sv → changes.js). -->

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

### Phase C — prototype banner ✔
- [x] Permanent banner above Swatch / Yarns (`frontend/banner.js`), pale amber against the green theme:
      "This is a prototype. Please email feedback or suggestions to <FEEDBACK_EMAIL>. Last update: <date>".
      en + sv. Hidden in print. First-visit dialog and footer link stay.
- [x] Date written at build time: `Dockerfile` overwrites `frontend/version.js` (`LAST_UPDATE`, ISO date).
      Committed default is empty → no date locally. No email → no email sentence.

### Phase C2 — quick fixes ✔
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

### Phase E — menu + About page ✔
- [x] Menu row (`frontend/menu.js`): Pattern | About | Changes; views in one page (`#pattern`, `#about`,
      `#changes`), so switching keeps the pattern. Live view link in HTML, hidden until Phase G.
- [x] About page: no account/server, local calculations, no upload, refresh loses work; saving-in-browser
      notice; prototype + feedback (footer link removed, first-visit dialog kept); Examples hidden while empty.
- [x] en + sv for all text.
- [x] fix: print in scale tile overview cells follow page orientation.
- [x] "Changes" page (`frontend/changes.js`): hand-written, en + sv, newest first; banner "Last update"
      links to it. Add an entry with each user-visible change; keep it general (no internals).

### Phase F — more yarns ✔
- [x] Number of yarns: 2, 3, 4, "More…". "More…" shows a second select: 5–8 and "Max (up to 20)…"
      (renamed from "Crazy time…": calmer, more professional). First select keeps 2–4. `frontend/yarnCount.js`.
- [x] First: replace `pairYarns` brute force (n!) with the Hungarian algorithm (O(n³)). Same exact
      optimum (no accuracy loss), tests unchanged. Brute force freezes from ~11 own yarns (11! ≈ 40 M).
      After this, matching is never the bottleneck.
- [x] Real cost of more yarns is colour reduction (k-means on the full image), roughly linear.
      Measured (600 × 600 px, 150 stitches, PC): 4 → 250 ms, 8 → 360 ms, 12 → 460 ms, 20 → 600 ms.
      Chart drawing and painting cost per stitch, not per yarn. Phones maybe 3–5× slower.
      Re-measured after Hungarian (synthetic 600 × 600 gradient, 150 stitches, no yarns / own yarns):
      4 → 310 / 270 ms, 8 → 350 / 360 ms, 12 → 500 / 510 ms, 20 → 900 / 730 ms. Own yarns cost no more;
      20 yarns ≈ 2–4 s on phones. Warning wording below holds.
- [x] Warning when "More…" is chosen (once per visit): "More yarns make each recalculation slower
      (a second or more on phones). Many colours per row are also hard to knit."
- [x] "Max (up to 20)…" unlocks 9–20 (until reload): two confirms, the second "Are you sure? Recalculating
      may take several seconds on slower devices." plus the embroidery hint (duplicate stitch / Swiss darning).
- [x] Yarn advice (last step): `core/yarnAdvice.js` flags colours with < 0.5 % of stitches or closer than
      `colourDistance` 1200 to a more used colour → suggested count. Image only, 5+ yarns. Detection only:
      a notice under the palette ("All yarns might not be needed …") with "Remove one yarn" (one step
      at a time, repeat while it shows) and "Restore last removed yarn" (step back). The pattern is not changed
      until a button is clicked.

### Backlog (done)
- [x] (moved to Phase F) Yarn limit. No premium tier: no payments, accounts or stored user data.
- [x] Layout polish: input fieldsets (Image, Swatch, Final size, Yarns) overlap at some widths;
      "Settings are locked" notice sits below the form, easy to miss.
- [x] (done in Phase B2) Print size for long, narrow charts (e.g. scarves). A canvas cannot split across
      pages, so print currently fits the chart on page 1 (`max-height: 75vh`): fine for
      e.g. 88 × 52, but scarf cells get too small to follow or mark with a pencil.
      - print option: fit to page (default) / mid-sized cells (more paper) / full width
        (most paper, easiest to read, suits detailed colourwork)
      - minimum print cell size; warn if the chosen size cannot be met
      - needs the chart split into page-sized slices (repeat row numbers on each slice)
      - on Print, if estimated pages > 4: confirm "Needs about X pages"; tip: without
        duplex, print odd pages, flip the stack, print even pages
- [x] Kanban split into TODO.md / IN_PROGRESS.md / DONE.md with index headers.

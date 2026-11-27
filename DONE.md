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
F2   part 1: blend advice, yarn flags list, fine-tune (pickColours), majority vote (voteGrid.js), yarn buttons
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

### Phase F2 — yarn advice tuning, part 1 (done 2026-11-27) ✔
- [x] Tuning: on the samples (100 stitches) the current limits rarely trigger: logo edge blends get
      2–6 % of the stitches each, so the share limit misses them (20 yarns → suggests 11–16; 6–8 → almost
      never). Idea: a blend lies between two other colours in RGB (near the line A–B) and mostly next to
      both; test that instead of / besides share. Needs measuring on more real images (logos, photos).
- [x] Detected blend colours as a list with include/exclude toggles (uses `removeColour`), shown only
      when something is detected or under "Advanced settings".
- [x] Small distinct colour loses its yarn to a blend (`samples/logo-with-text.png`, added 2026-11-21).
      Logo: red thin lines, white thin lines, green fill, white background, black text. At 4 yarns wanted
      red, white, green, black; got the text in pink/red. Likely cause: colours are picked by pixel share,
      so the soft red/white edges (pink) outweigh the thin black text and take the 4th yarn.
      Idea: after `refinePalette`, test each colour with the `yarnAdvice` blend check; swap a blend for the
      image colour farthest from the rest (here black). Also weigh connected areas (islands), not only %.
      Measured 2026-11-21 (100 stitches, 4 yarns): `logo-with-text-clear-background.png` (original PNG) is
      right: green, black #282425 (2.8 %), red, white. `logo-with-text.png` (screenshot, softer edges) is
      wrong: dark red #8d0c22 (red + black merged), green, pink blend #b69799 (10 %), white; advice then
      says 3 yarns. Target: screenshot gives the same 4 as the original.
      At 8 yarns the screenshot gives black, red, green, white + blends, and advice keeps exactly those 4.
      **Plan (over-pick, then prune)** — opt-in, decided 2026-11-22: a "Fine-tune colours" action in the
      Advanced toolbox (see below), not the default, since it takes longer. Default render stays as today.
      1. `yarnAdvice` also returns `order` (flagged indexes in removal order); `flags` stay sorted by index. Test.
      2. New `core/pickColours.js`: `pickColours(pixels, scaled, yarnCount)`:
         a. trial = `refinePalette(pixels, medianCut(pixels, yarnCount × OVERPICK))` (OVERPICK = 2, cap 20).
         b. `yarnAdvice` on the trial pattern (scaled grid); drop the first (trial − yarnCount) of `order`.
         c. Not enough flagged (e.g. photos) → today's result (`medianCut(pixels, yarnCount)` + refine), unchanged.
         d. Final = `refinePalette(pixels, kept sources)` (kept colours as seeds).
         Tests: synthetic logo (red/white lines with wide pink edges, small black block) → 4 yarns include black;
         photo-like gradient → same as today.
      3. `createPattern` takes an option (e.g. `fineTune: true`) that uses `pickColours`; default unchanged.
         Frontend: button in the Advanced toolbox; result kept until a new image (2026-11-25: also kept on count changes).
      4. Measure all `samples/` before/after (`measureAdvice.js`); check generate time on the 20-colour photo.
      5. `changes.js` fix entry (en + sv): "Small colours such as thin text keep their yarn instead of a soft edge colour."
      Done 2026-11-24: OVERPICK 2 measured (1.5 and 3 miss the target). Screenshot at 4 yarns = black, red, green, white;
      photo unchanged. Photo 100 stitches, Node: 4 yarns 165 → 246 ms, 20 yarns 190 → 420 ms. UI not yet checked by hand.
      Risks: slower generate (two colour reductions); fallback c. keeps photos as today. Unknown: right OVERPICK.
- [x] Green stitches in black text (`logo-with-text.png`, 4 yarns, fine-tuned). Cause: a stitch is the average of its
      pixels, black + white = grey, and the nearest of the 4 colours to that grey is green.
      Idea, measured 2026-11-25: majority vote (map every pixel to its colour first, each stitch takes the most
      common): no green left in the text, letters readable, slightly thinner strokes. Part of Fine-tune, no extra tick box.
      To solve: `removeColours` / `addColour` remap from the averaged `pixels`, so leaving out a yarn would bring
      green back (needs votes there too). Measure all samples first: thin lines may lose the vote.
      Done 2026-11-27: `voteGrid.js`; pattern keeps `image` (fine-tune only), so `removeColours` / `addColour` vote too.
      Measured: thin lines keep their share (red 10.1 → 10.1 %, black text 2.8 → 4.1 %), blends drop to 0 %
      (8 yarns on `logo-with-text.png` → advice suggests exactly the 4 real colours), photo < 0.3 % change, vote 2–9 ms.
      UI checked 2026-11-27: no green in text, Fine-tune off unchanged, 8 yarns → Auto improve → 4. Untick check n/a:
      fine-tuned at 4 yarns nothing is flagged, so the yarn list only shows with Fine-tune off (averaging, green expected).
- [x] ~~Colours with 0 stitches~~ (auto-drop built, then replaced by the redesign below): e.g. a 2-colour logo at 14 yarns gives E = 0 stitches, at 15 F = 0, and so on
      (colours come from the full image, the grid from the scaled one, so thin details vanish). A colour
      without stitches is not a colour. Decided: drop unused colours automatically and say so:
      "You chose X yarns, but only Y were used, so the pattern uses Y." (20 → 14 in one go, not 19 → 18 → 17).
      After that notice, "Keep X anyway" keeps the empty yarns in the palette for painting in by hand.
- [x] Yarn advice redesign (replaces auto-drop of empty yarns, decided 2026-11-14): no automatic drop;
      one advice box "X yarns is more than this image needs … Best fit: N" with "Use N yarns"; buttons
      − yarn / + yarn / Undo yarn change under the palette (images). Remove `emptyYarns.js` and
      `dropEmptyColours` (advice already counts empty yarns).
- [x] Paint hint still says "1-4 or A-D"; keys now go to 1–9 and A–T.
- [ ] ~~"Remove islands smaller than N stitches"~~ Skipped 2026-11-27 in favour of more useful functions:
      tested at 20+ yarns, small islands (eyebrows, thin lines) add depth and a 3D effect; unwanted ones
      are easy to paint by hand. Plan if revived: 4-connected islands, replaced by most common bordering colour.
- [ ] ~~Own yarns: warn when two chosen yarns are almost the same colour~~ Skipped 2026-11-27 in favour of
      more useful functions: the user holds their own yarns and knows. Near-duplicates matter only for
      calculated colours, already covered by the `yarnAdvice` near flag.
- [ ] ~~"Stitches needed to be its own colour" tool~~ Skipped 2026-11-27: purpose unclear; likely an old fix for hue
      drift in fades, since solved by the colour picking (medianCut + refinePalette, fine-tune).

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

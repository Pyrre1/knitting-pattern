# In progress
<!-- Active phase only (one per chat). Moved here from TODO.md when started; moved to DONE.md when finished.
Empty = no phase active: pick one from TODO.md. -->

### Phase F2 — yarn advice tuning + clean-up tools (discuss first)
Part 1 (tuning, fine-tune, vote, yarn advice redesign) done → DONE.md "Phase F2 — part 1".
- [ ] Advanced toolbox (redesigned 2026-11-24: "Advanced settings" button opens a framed box; tip box replaced
      by Auto improve + Undo; toolbox built, more tools to add): one Advanced box holding all clean-up tools:
      fine-tune colours (built), flagged yarns list (built, both in `#advanced`),
      motif/background focus (colour budget below). Each tool says it may take time.
- [ ] Plain, pedagogical help text for each tool: many users are not technical and only want to knit,
      embroider or crochet. Show only when it applies; no jargon. Decided 2026-11-27: an (i) beside each tool
      opens a short text on click/tap (native `<details>`, no JS; hover alone fails on phones). Write last,
      once all tools exist.
- [ ] Colour budget by importance, under an "Advanced settings" box. Removing yarns from a flower on grass
      flattens the flower almost at once (flower ≈ 10 % of the image, grass and leaves hold most hues),
      so e.g. 8 greens + 1 flower colour instead of 3 + 3. Decided: build b) first, a) later as a lazy backup.
      b) manual (first), decided 2026-11-27: mark the motif on the chart; colours are picked per area.
         Tools (in Advanced, "Mark motif" mode):
         - Quick select (like Photoshop): click a stitch → it and every touching stitch of the same colour
           (8-connected: side or corner) join the motif. Click the background → it is skipped.
         - Brush (1 / 3 / 5 stitches) adds cells; eraser returns cells to background. Both fix what quick
           select gets wrong, e.g. the same green touching in grass and leaves.
         - View: stitches outside the motif dimmed (works on any image; no overlay colour to choose).
         - Mask kept on the image pixels (not stitches), so size, gauge and rotation changes keep it.
         - Motif ↔ background slider splits the yarns (e.g. 5 = 2 + 3).
         Precise and a bit heavy beats light and unadjustable. Minimal fallback if too heavy: "select a yarn"
         (all its stitches) + eraser.
         Steps (one chat each, `/clear` between):
         1. core: colours picked per area from a mask (pixels + mask + yarns per area → pattern) + tests;
            near-duplicate merge across areas (risk below).
         2. core: quick select (8-connected flood fill on the grid) + mask ↔ stitch mapping + tests;
            frontend: "Mark motif" mode, quick select, dimmed view.
         3. brush sizes + eraser, motif ↔ background slider, recalculate per area; changes.js.
      a) automatic (later, backup): group colours (hue / area) and spread yarns across groups. Faster and
         asks nothing of the user, but riskier: may help some logos and spoil others. Offer it as a trial:
         "Try automatic grouping" → result shown → "Revert" restores the previous pattern kept in memory
         (no recalculation; one pattern object is cheap).
      Risk (both): a colour in both areas (green grass and green leaves in the motif) gives two near-identical
      yarns. Fix: merge near-duplicates afterwards (`yarnAdvice` near check) and give the freed yarn back
      to the area that needs it.

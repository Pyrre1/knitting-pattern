# In progress
<!-- Active phase only (one per chat). Moved here from TODO.md when started; moved to DONE.md when finished.
Empty = no phase active: pick one from TODO.md. -->

### Phase F2 — yarn advice tuning + clean-up tools (discuss first)
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
- [ ] Advanced toolbox (redesigned 2026-11-24: "Advanced settings" button opens a framed box; tip box replaced
      by Auto improve + Undo; toolbox built, more tools to add): one Advanced box holding all clean-up tools:
      fine-tune colours (built), flagged yarns list (built, both in `#advanced`), remove islands, island size, "stitches needed
      to be its own colour", motif/background focus (colour budget below). Each tool says it may take time.
- [ ] "Remove islands smaller than N stitches" (single stray stitches), same visibility rule.
- [ ] Plain, pedagogical help text for each tool: many users are not technical and only want to knit,
      embroider or crochet. Show only when it applies; no jargon.
- [x] ~~Colours with 0 stitches~~ (auto-drop built, then replaced by the redesign below): e.g. a 2-colour logo at 14 yarns gives E = 0 stitches, at 15 F = 0, and so on
      (colours come from the full image, the grid from the scaled one, so thin details vanish). A colour
      without stitches is not a colour. Decided: drop unused colours automatically and say so:
      "You chose X yarns, but only Y were used, so the pattern uses Y." (20 → 14 in one go, not 19 → 18 → 17).
      After that notice, "Keep X anyway" keeps the empty yarns in the palette for painting in by hand.
- [ ] Colour budget by importance, under an "Advanced settings" box. Removing yarns from a flower on grass
      flattens the flower almost at once (flower ≈ 10 % of the image, grass and leaves hold most hues),
      so e.g. 8 greens + 1 flower colour instead of 3 + 3. Decided: build b) first, a) later as a lazy backup.
      b) manual (first): paint a mask over the image, motif vs background, and set yarns per area (e.g. 3 + 3).
         Colour reduction runs per area, so marking the background groups its colours automatically;
         simpler and more predictable than a). Split yarns with a motif ↔ background slider
         (e.g. 5 yarns: background 1 or 2, motif 4 or 3).
      a) automatic (later, backup): group colours (hue / area) and spread yarns across groups. Faster and
         asks nothing of the user, but riskier: may help some logos and spoil others. Offer it as a trial:
         "Try automatic grouping" → result shown → "Revert" restores the previous pattern kept in memory
         (no recalculation; one pattern object is cheap).
      Risk (both): a colour in both areas (green grass and green leaves in the motif) gives two near-identical
      yarns. Fix: merge near-duplicates afterwards (`yarnAdvice` near check) and give the freed yarn back
      to the area that needs it.
- [x] Yarn advice redesign (replaces auto-drop of empty yarns, decided 2026-11-14): no automatic drop;
      one advice box "X yarns is more than this image needs … Best fit: N" with "Use N yarns"; buttons
      − yarn / + yarn / Undo yarn change under the palette (images). Remove `emptyYarns.js` and
      `dropEmptyColours` (advice already counts empty yarns).
- [ ] Own yarns: warn when two chosen yarns are almost the same colour.
- [x] Paint hint still says "1-4 or A-D"; keys now go to 1–9 and A–T.

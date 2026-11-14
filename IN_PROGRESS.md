# In progress
<!-- Active phase only (one per chat). Moved here from TODO.md when started; moved to DONE.md when finished.
Empty = no phase active: pick one from TODO.md. -->

### Phase F2 — yarn advice tuning + clean-up tools (discuss first)
- [x] Tuning: on the samples (100 stitches) the current limits rarely trigger: logo edge blends get
      2–6 % of the stitches each, so the share limit misses them (20 yarns → suggests 11–16; 6–8 → almost
      never). Idea: a blend lies between two other colours in RGB (near the line A–B) and mostly next to
      both; test that instead of / besides share. Needs measuring on more real images (logos, photos).
- [ ] Detected blend colours as a list with include/exclude toggles (uses `removeColour`), shown only
      when something is detected or under "Advanced settings".
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
         simpler and more predictable than a).
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

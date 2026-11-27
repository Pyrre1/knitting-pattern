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
      embroider or crochet. Show only when it applies; no jargon.
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

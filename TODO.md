# TODO

Deferred until after the local visual MVP.

- [ ] Yarn limit: free tier max 4 yarns; more than 4 as a possible premium feature.
      `pairYarns` brute-forces all assignments (n! growth) — replace with Hungarian
      algorithm if the limit is raised much beyond ~8.
- [ ] Cache patterns per yarn count, so switching 3 → 2 → 4 → 3 yarns reuses results.
      Measure first: recount only runs on the scaled stitch grid and may already be fast enough.
- [ ] Transparency handling option (`fromImageData` currently blends onto white):
      - blend onto a user-chosen background colour (cheap: parameterise the blend colour)
      - use the nearest opaque bordering colour
      - treat transparent as its own palette colour when yarn count exceeds the logo's colours
- [ ] Majority-vote stitches: map each pixel to the palette, then take the most common
      colour per cell instead of averaging. May keep very thin lines more continuous.

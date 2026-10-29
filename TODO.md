# TODO

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
- [ ] Print size for long, narrow charts (e.g. scarves). A canvas cannot split across
      pages, so print currently fits the chart on page 1 (`max-height: 75vh`): fine for
      e.g. 88 × 52, but scarf cells get too small to follow or mark with a pencil.
      - print option: fit to page (default) / mid-sized cells (more paper) / full width
        (most paper, easiest to read, suits detailed colourwork)
      - minimum print cell size; warn if the chosen size cannot be met
      - needs the chart split into page-sized slices (repeat row numbers on each slice)
      - on Print, if estimated pages > 4: confirm "Needs about X pages"; tip: without
        duplex, print odd pages, flip the stack, print even pages

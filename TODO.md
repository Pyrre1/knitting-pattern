# TODO
<!-- Index. Kanban: TODO.md (planned) → IN_PROGRESS.md (active phase) → DONE.md (finished, history).
Start a phase: move its section here → IN_PROGRESS.md. Finish: move it to DONE.md, mark ✔.
Phases: F2 yarn advice tuning (discuss first) · G live view · H languages da/nb · I paper saver
Similar past work: see the index at the top of DONE.md; grep -n "### Phase X" DONE.md, read only that section. -->

## Roadmap (test deploy)
One phase per chat. Start a chat with "Do Phase X"; decisions in each phase are settled.

### Phase F2 — yarn advice tuning + clean-up tools (discuss first)
- [ ] Tuning: on the samples (100 stitches) the current limits rarely trigger: logo edge blends get
      2–6 % of the stitches each, so the share limit misses them (20 yarns → suggests 11–16; 6–8 → almost
      never). Idea: a blend lies between two other colours in RGB (near the line A–B) and mostly next to
      both; test that instead of / besides share. Needs measuring on more real images (logos, photos).
- [ ] Detected blend colours as a list with include/exclude toggles (uses `removeColour`), shown only
      when something is detected or under "Advanced settings".
- [ ] "Remove islands smaller than N stitches" (single stray stitches), same visibility rule.
- [ ] Plain, pedagogical help text for each tool: many users are not technical and only want to knit,
      embroider or crochet. Show only when it applies; no jargon.
- [ ] Colours with 0 stitches: e.g. a 2-colour logo at 14 yarns gives E = 0 stitches, at 15 F = 0, and so on
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
- [ ] Own yarns: warn when two chosen yarns are almost the same colour.
- [ ] Paint hint still says "1-4 or A-D"; keys now go to 1–9 and A–T.

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
- [ ] Menu integration (built in Phase E): `index.html` has a hidden `#menu a[data-view="live"]`.
      Unhide it, add `'live'` to `VIEWS` in `menu.js` and a `<section id="view-live" hidden>` for the
      saved-pattern list (b). Fullscreen live view itself may stay an overlay opened from there or from Output.
- [ ] Show the saving notice (`aboutStorage` in `i18n.js`) next to the save action, as decided in Phase E.
- [ ] Changes entry in `changes.js`.

### Phase H — more languages (Danish, Norwegian)
- [ ] Add `da` and `nb` to `STRINGS`, `INSTRUCTION_TERMS` and `ERRORS` in `frontend/i18n.js`
      (every key in every language). ~170 strings each; the code already handles any number of languages.
- [ ] Knitting terms differ per language (e.g. right side / wrong side, row / round): have a Danish and
      a Norwegian knitter check them before release.
- [ ] Changes entries (`changes.js`) need the new languages too, or fall back to English.
- [ ] Language picker: names in their own language (Dansk, Norsk, Svenska, English), no flags:
      flags stand for countries, not languages (e.g. English), and add images for little gain.
- [ ] Browser language detection: Norwegian may report `no`, `nb` or `nn`; map all to `nb`.

### Phase I — paper saver for print in scale
- [ ] Core: estimate pages for portrait and landscape (`planTiles` for both) and pick the one with fewer pages.
- [ ] Preselect that orientation; if the user changes it, inform: "Changing from portrait to landscape
      prints about N pages instead of about M." Same check when paper size changes (Letter / A4).

## Backlog

Deferred until after the local visual MVP.

- [ ] Real site: allow indexing, `sitemap.xml`, Open Graph image, redirect from prototype address.
- [ ] Dark mode.
- [ ] Cache patterns per yarn count, so switching 3 → 2 → 4 → 3 yarns reuses results.
      Measured: full recount takes ~75 ms on a 600 px logo, so probably not needed.
- [ ] Transparency handling option (`fromImageData` currently blends onto white):
      - blend onto a user-chosen background colour (cheap: parameterise the blend colour)
      - use the nearest opaque bordering colour
      - treat transparent as its own palette colour when yarn count exceeds the logo's colours
- [ ] Majority-vote stitches: map each pixel to the palette, then take the most common
      colour per cell instead of averaging. May keep very thin lines more continuous.
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

# TODO
<!-- Index. Kanban: TODO.md (planned) → IN_PROGRESS.md (active phase) → DONE.md (finished, history).
Start a phase: move its section here → IN_PROGRESS.md. Finish: move it to DONE.md, mark ✔.
Phases: G live view · H languages da/nb · I paper saver + file names
Similar past work: see the index at the top of DONE.md; grep -n "### Phase X" DONE.md, read only that section. -->

## Roadmap (test deploy)
One phase per chat. Start a chat with "Do Phase X"; decisions in each phase are settled.

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
      About page section "Saving in the browser" is commented out in `index.html` (2026-11-22); unhide it here.
      Rephrase first (en + sv): PDF/PNG downloads are files on the user's device; only "save for live view"
      uses browser storage (local storage).
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

### Phase I — paper saver for print in scale, file names
- [ ] Core: estimate pages for portrait and landscape (`planTiles` for both) and pick the one with fewer pages.
- [ ] Preselect that orientation; if the user changes it, inform: "Changing from portrait to landscape
      prints about N pages instead of about M." Same check when paper size changes (Letter / A4).
- [ ] File names (noted 2026-11-22): PNG is always `knitting-pattern.png` and PDF takes the page title
      (`Stickmönster` / `Knitting pattern`), so every save clashes and tests are hard to tell apart.
      Name = source + date and time, e.g. `knitting-pattern_logo_2026-11-22_14-05.png`: source = uploaded
      image file name (without extension) or the typed text (shortened). Safe characters only (no / \ : * ? " < > |).
      PDF: set `document.title` to the same name during print, restore after. Pure helper in core + test.

## Backlog

Deferred until after the local visual MVP.

- [ ] Bug (reported 2026-11-22): stitch view made the page very slow on a phone (Galaxy S23 Ultra), barely
      scrollable; simple logo, 60 cm wide. Not reproduced yet. Suspects: canvas too large for the phone
      (cell size × stitches), stitch drawing cost per redraw, a redraw loop, or touch/scroll on the canvas
      (`canvas.painting` sets `touch-action: none`). Reproduce on desktop with mobile emulation first.
- [ ] Feedback hint for problem reports (About feedback section, maybe banner): "If something goes wrong
      and you are willing, please include the device and browser you used and your settings (gauge,
      size, yarn count, stitch view, print in scale …). It makes the problem easier to find and fix."
      en + sv in `i18n.js`; Changes entry. Optional later: a "Copy settings" button that puts the
      current form values on the clipboard for the mail.

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
- [ ] Chart with letters: toggle to draw each stitch's yarn letter in the cell (instead of stitch view),
      for many near-identical colours (cross stitch, embroidery, many-colour knitting).
- [ ] Fill tool: "fill connected" brush paints every touching stitch of the clicked colour with the new
      yarn (beside click / hold to paint). Recolours one letter at a time in text (2 → up to 20 yarns),
      or a transparent background apart from white in the logo. Text needs more than 2 yarns for it.
- [ ] Opposite yarn tip: "more yarns might give a better result, try N" (only up to ~6: many yarns are
      hard work to knit). Same advice box and undo as "Use N yarns".
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

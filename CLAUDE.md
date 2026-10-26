# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Knitting pattern generator. Input: image/logo or text. Output: stitch grid
showing colour placement (e.g. "3 white, 1 green …") suitable for transcoding
an image or text into a knitted fabric.
Status: prototype ported from old repo. Goal: finish features + polish UI.

## Stack
- Runtime: Node.js (ESM modules, `"type": "module"`)
- Tests: Jest 30 (`--experimental-vm-modules`)
- Frontend: vanilla HTML/CSS/JS (`frontend/`)
- Core logic: pure JS modules (`core/`)
- Backend: none for now; everything runs client-side

## Commands
- Install: `npm install`
- Test: `npm test`
- Single file: `npm test -- core/tests/imageScaler.test.js`
- Single test by name: `npm test -- -t "averaging RGB"`
- Coverage: `npm run coverage`
- Dev (frontend): serve the repo root with `npx serve .` and open `/frontend/`. Frontend imports `../core/*.js` as ES modules, so `file://` and `npx serve frontend` do not work.
- No build step, no linter configured yet

## Architecture
Current state: `core/` holds all logic; `frontend/` is a vanilla MVP (upload or typed text → inputs → canvas grid + yarn list) that imports core directly. Frontend has no tests; keep logic out of it.

Intended pipeline (core modules, all pure, tests in `core/tests/`):
1. `gaugeInterpreter({unit, width, height, stitches, rows})` → swatch gauge normalised to stitches/rows per cm and per inch.
2. `sizeInterpreter({gauge, desiredWidth: {value, unit}, imageAspectRatio})` → target `stitches`, `rows`, `widthCm`, `heightCm`. `unit` ∈ `stitches|cm|inch`; `imageAspectRatio` = height ÷ width. Rows are scaled by `rowsPerCm / stitchesPerCm` to compensate for non-square stitches. `stitches`/`rows` are rounded (min 1); `widthCm`/`heightCm` are the requested size, unrounded.
3. `imageScaler(imageData, {stitches, rows})` → downsamples to a `rows × stitches` grid by averaging RGB per block. `imageData` is a 2D array `[y][x] = [r, g, b]` (not a canvas `ImageData`).
4. `medianCut(grid, count)` → up to `count` rough colours (`count` = number of yarns), then `refinePalette(grid, rough)` (k-means seeded by medianCut, deterministic) → final source colours. Both run on the full image, not the scaled grid: averaging into stitches blends thin lines (e.g. logo outlines) into wrong colours.
5. `mapToPalette(grid, colours)` → grid of nearest-colour indexes. Takes plain colours; pass `palette.map(e => e.source)`, never yarns. Distance: `colourDistance` (weighted squared RGB, 2/4/3), shared by all matching.
6. `pairYarns(sources, yarns?)` → `[{ source, yarn }]` in source order. No yarns → yarn = source. Otherwise brute-force min total `colourDistance`; needs `yarns.length >= sources.length`.
7. `patternEdits`: `buildPattern(pixels, palette)` → `{ pixels, palette, grid }`; `setYarn` (grid unchanged), `removeColour` / `addColour` (remap), `paintCell(pattern, x, y, index)` (manual override of one stitch; lost on regenerate). All pure, return new patterns. Recount = rerun `createPattern` with current yarns.
8. `createPattern({ swatch, pixels, yarnCount, yarns?, desiredWidth })` chains 1–6 (colours from full `pixels`, grid from scaled) → `{ pixels (scaled), palette, grid, size }`. `swatch` is raw `gaugeInterpreter` input.

`rowInstructions(grid, { start: 'bottom'|'top', method: 'flat'|'round' })` → knitting-order rows `{ kind, number, displayRow, side, direction, runs: [{ index, count }] }`. `direction` is chart reading direction on the displayed grid: bottom up → RS right → left; top down → RS left → right (fabric hangs upside down); WS (flat only) opposite. Frontend puts each row number on the side the row starts. `formatInstruction(instr, labels, terms?)` → `"Row 2 (WS, read chart left → right): 1 B, 2 A"` for rows/rounds 1–2, then short form `"3 (RS): 3 A"` (rounds: `"3: 3 A"`). `terms` (default English) localises words; frontend passes them from `frontend/i18n.js` (sv: `Varv 2 (avig, …)`, short `3 (a)`). Yarns are labelled A, B, C, D by palette index.

Text path (`textGrid.js`) skips colour reduction: each distinct letter is drawn once and downsampled with `toGlyph(pixels, rows, gauge)` (0/1, narrowed for gauge), so repeated letters are identical. `composeText(glyphs, text, { layout, spacing | width, lineSpacing })` places them (fixed spacing, or fill `width` spreading spare stitches; `layout: 'column'` stacks letters top to bottom, `spacing` in rows, lines side by side, no `width`); `fitRows` binary-searches letter height for a target width; `textPattern({ swatch, grid, yarns? })` → pattern with palette [background, text]. Frontend renders the glyph pixels (system fonts only).

`rotateGrid(grid, 'none'|'right'|'left')` turns any grid 90° (right = clockwise) for sideways knitting; frontend rotates image pixels before `createPattern`, and text is composed with `rotateGauge(gauge)` (stitches↔rows) then rotated. Chart is shown as knitted; final width = across the knitting.

`fromImageData({ data, width, height })` adapts canvas `ImageData` (flat RGBA) to the `[y][x] = [r,g,b]` grid; transparency is blended onto white.

Palette entry = `{ source, yarn }`: stitches map by `source`, display/output uses `yarn`.

`imageScaler` splits pixels into cells via `accumulator.computeCellSizes` (integer per-cell widths/heights, remainder spread evenly).

Test-driven history: commits prefixed `GREEN -` mark red/green TDD steps.

## Communication
- Terse, aerospace style: state facts, actions, results. No preamble, no praise, no recap.
- One-line answer when one line suffices.
- Do not restate my request. Do not explain code unless asked.
- Never assume — ask if unclear.
- Ask only when blocked. Otherwise pick the sensible default and state it in one line.
- List unknowns/risks explicitly; never guess silently.

## Workflow
1. Explore (read only) → 2. Plan (wait for approval on non-trivial changes) → 3. Implement → 4. Test → 5. Commit.
- Keep tests; add new ones for new behaviour. TDD only if it gives clear value.
- Small diffs. One concern per commit. Conventional commit messages.
- Never commit unless asked. Never touch files outside the task scope.

## Token discipline
- Read only files needed. Use grep/glob before opening files.
- Do not paste large file contents or full test output back; summarize failures.
- Suggest /clear when switching tasks. Suggest /compact when context is long.

## Domain rules
- Stitch grid: display orientation matches input (what you see is what you get).
  For export/print, offer reversed row order (row 1 = bottom) as an option.
- Colour reduction: palette is configurable (default 2–4 colours). Support
  recalculation when target colour count changes (e.g. reduce 3 colours to 2).
  Keep conversion logic pure + unit tested.
- Gauge: user inputs stitches and rows per 10 cm (or 4×4 inch). Grid aspect
  ratio must account for this — knitted stitches are wider than tall.

## Off limits
- Do not edit: lockfiles by hand, generated files, `.env*`.
- Do not add dependencies without asking.

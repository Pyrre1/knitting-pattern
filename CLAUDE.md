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
- Dev (frontend): open `frontend/index.html` in browser directly, or serve with `npx serve frontend`
- No build step, no linter configured yet

## Architecture
Current state: only `core/` has code. `frontend/*` files are empty placeholders.

Intended pipeline (core modules, all pure, tests in `core/tests/`):
1. `gaugeInterpreter({unit, width, height, stitches, rows})` → swatch gauge normalised to stitches/rows per cm and per inch.
2. `sizeInterpreter({gauge, desiredWidth: {value, unit}, imageAspectRatio})` → target `stitches`, `rows`, `widthCm`, `heightCm`. `unit` ∈ `stitches|cm|inch`; `imageAspectRatio` = height ÷ width. Rows are scaled by `rowsPerCm / stitchesPerCm` to compensate for non-square stitches. `stitches`/`rows` are rounded (min 1); `widthCm`/`heightCm` are the requested size, unrounded.
3. `imageScaler(imageData, {stitches, rows})` → downsamples to a `rows × stitches` grid by averaging RGB per block. `imageData` is a 2D array `[y][x] = [r, g, b]` (not a canvas `ImageData`).
4. Colour reduction to a palette — not yet implemented.

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

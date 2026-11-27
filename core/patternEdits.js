import { mapToPalette } from "./mapToPalette.js"
import { voteGrid } from "./voteGrid.js"

// Stitches always map by source colour; yarn is only what gets knitted/displayed.
// With `image` (the full-size pixels, kept by reference) each stitch is a majority vote of its
// image pixels (voteGrid), also on every later remap; without it, the nearest colour to `pixels`.
export function buildPattern(pixels, palette, image) {
  const sources = palette.map((entry) => entry.source)
  const averaged = mapToPalette(pixels, sources)
  if (!image) return { pixels, palette, grid: averaged }

  const size = { stitches: pixels[0].length, rows: pixels.length }
  return { pixels, palette, image, grid: voteGrid(image, size, sources, averaged) }
}

// Remaps the stitches, keeps other fields (e.g. size)
function withPalette(pattern, palette) {
  return { ...pattern, ...buildPattern(pattern.pixels, palette, pattern.image) }
}

export function setYarn(pattern, index, yarn) {
  assertIndex(pattern, index)

  const palette = pattern.palette.map((entry, i) => (i === index ? { ...entry, yarn } : entry))

  return { ...pattern, palette }
}

export function removeColour(pattern, index) {
  assertIndex(pattern, index)
  if (pattern.palette.length === 1) {
    throw new Error("cannot remove the last colour")
  }

  return withPalette(
    pattern,
    pattern.palette.filter((_, i) => i !== index),
  )
}

// Removes several colours at once (palette indexes); stitches go to the nearest colour left
export function removeColours(pattern, indexes) {
  indexes.forEach((index) => assertIndex(pattern, index))
  const palette = pattern.palette.filter((_, i) => !indexes.includes(i))
  if (palette.length === 0) throw new Error("cannot remove the last colour")
  return indexes.length === 0 ? pattern : withPalette(pattern, palette)
}

export function addColour(pattern, source, yarn = source) {
  return withPalette(pattern, [...pattern.palette, { source, yarn }])
}

// Manual override of one stitch; copies only the changed row
export function paintCell(pattern, x, y, index) {
  assertIndex(pattern, index)
  if (
    !Number.isInteger(y) ||
    y < 0 ||
    y >= pattern.grid.length ||
    !Number.isInteger(x) ||
    x < 0 ||
    x >= pattern.grid[y].length
  ) {
    throw new Error(`no stitch at ${x}, ${y}`)
  }
  if (pattern.grid[y][x] === index) return pattern

  const grid = pattern.grid.map((row, rowIndex) =>
    rowIndex === y ? row.map((cell, cellIndex) => (cellIndex === x ? index : cell)) : row,
  )

  return { ...pattern, grid }
}

function assertIndex(pattern, index) {
  if (!Number.isInteger(index) || index < 0 || index >= pattern.palette.length) {
    throw new Error(`no palette entry at index ${index}`)
  }
}

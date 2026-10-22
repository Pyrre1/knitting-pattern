import { mapToPalette } from "./mapToPalette.js"

// Stitches always map by source colour; yarn is only what gets knitted/displayed
export function buildPattern(pixels, palette) {
  return {
    pixels,
    palette,
    grid: mapToPalette(pixels, palette.map(entry => entry.source))
  }
}

export function setYarn(pattern, index, yarn) {
  assertIndex(pattern, index)

  const palette = pattern.palette.map((entry, i) =>
    i === index ? { ...entry, yarn } : entry
  )

  return { ...pattern, palette }
}

export function removeColour(pattern, index) {
  assertIndex(pattern, index)
  if (pattern.palette.length === 1) {
    throw new Error('cannot remove the last colour')
  }

  return buildPattern(pattern.pixels, pattern.palette.filter((_, i) => i !== index))
}

export function addColour(pattern, source, yarn = source) {
  return buildPattern(pattern.pixels, [...pattern.palette, { source, yarn }])
}

// Manual override of one stitch; copies only the changed row
export function paintCell(pattern, x, y, index) {
  assertIndex(pattern, index)
  if (!Number.isInteger(y) || y < 0 || y >= pattern.grid.length ||
      !Number.isInteger(x) || x < 0 || x >= pattern.grid[y].length) {
    throw new Error(`no stitch at ${x}, ${y}`)
  }
  if (pattern.grid[y][x] === index) return pattern

  const grid = pattern.grid.map((row, rowIndex) =>
    rowIndex === y ? row.map((cell, cellIndex) => cellIndex === x ? index : cell) : row
  )

  return { ...pattern, grid }
}

function assertIndex(pattern, index) {
  if (!Number.isInteger(index) || index < 0 || index >= pattern.palette.length) {
    throw new Error(`no palette entry at index ${index}`)
  }
}

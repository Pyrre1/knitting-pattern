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

// Drops colours without stitches (keeps at least 2 colours, earliest first) and renumbers the grid.
// → { pattern, dropped: [old palette indexes] }
export function dropEmptyColours(pattern) {
  const counts = pattern.palette.map(() => 0)
  for (const row of pattern.grid) for (const index of row) counts[index]++

  const dropped = []
  let left = pattern.palette.length
  for (let i = pattern.palette.length - 1; i >= 0 && left > 2; i--) {
    if (counts[i] === 0) {
      dropped.unshift(i)
      left--
    }
  }
  if (dropped.length === 0) return { pattern, dropped }

  const newIndex = pattern.palette.map((_, i) => i - dropped.filter(d => d < i).length)
  return {
    pattern: {
      ...pattern,
      palette: pattern.palette.filter((_, i) => !dropped.includes(i)),
      grid: pattern.grid.map(row => row.map(index => newIndex[index]))
    },
    dropped
  }
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

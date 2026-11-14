import { colourDistance } from "./colourDistance.js"

// Closer than this (colourDistance) two colours look almost the same
export const NEAR_DISTANCE = 1200
// A blend lies at most this far from the line between its two colours (share of that line's length)
export const MAX_OFFSET = 0.25
// At least this share of a blend's neighbouring stitches are its two colours (or other blends between them)
export const MIN_TOUCH = 0.6
// At least this share of a blend's stitches lie on an edge (touch another colour): blends are thin
export const MIN_EDGE = 0.9

// Detects colours a pattern probably does not need; changes nothing.
// Removes one colour at a time (fewest stitches first), recounting in between:
// - empty: no stitches
// - near: almost the same source colour as a colour with more stitches
// - blend: a thin colour lying between two bigger colours, in colour and on the chart (a soft edge)
// Removed stitches move to the nearest remaining colour, as removeColour would.
// → { suggested, extra: [palette indexes] }. suggested is never below 2.
export function yarnAdvice({ palette, grid }, {
  nearDistance = NEAR_DISTANCE, maxOffset = MAX_OFFSET, minTouch = MIN_TOUCH, minEdge = MIN_EDGE
} = {}) {
  const sources = palette.map(entry => entry.source)
  const kept = palette.map((_, i) => i)
  const extra = []
  let cells = grid

  while (kept.length > 2) {
    const counts = countStitches(cells, palette.length)
    const { touches, edges } = countTouches(cells, palette.length)
    const candidates = kept.filter(i =>
      counts[i] === 0 ||
      kept.some(k => k !== i && bigger(k, i, counts) && colourDistance(sources[k], sources[i]) < nearDistance) ||
      (edges[i] >= minEdge * counts[i] && isBlend(i, kept, sources, counts, touches, { maxOffset, minTouch }))
    )
    if (candidates.length === 0) break

    const removed = candidates.reduce((a, b) => counts[b] < counts[a] ? b : a)
    kept.splice(kept.indexOf(removed), 1)
    extra.push(removed)
    const target = nearest(sources[removed], kept, sources)
    cells = cells.map(row => row.map(index => index === removed ? target : index))
  }

  return { suggested: Math.max(2, kept.length), extra: extra.sort((a, b) => a - b) }
}

// Ties go to the lower index, so one of two equal colours is kept
function bigger(k, i, counts) {
  return counts[k] > counts[i] || (counts[k] === counts[i] && k < i)
}

function countStitches(grid, size) {
  const counts = new Array(size).fill(0)
  for (const row of grid) for (const index of row) counts[index]++
  return counts
}

// touches[i][j] = sides where a stitch of colour i meets one of colour j (j ≠ i);
// edges[i] = stitches of colour i touching another colour
function countTouches(grid, size) {
  const touches = Array.from({ length: size }, () => new Array(size).fill(0))
  const edges = new Array(size).fill(0)
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const i = grid[y][x]
      let edge = false
      for (const j of [grid[y][x - 1], grid[y][x + 1], grid[y - 1]?.[x], grid[y + 1]?.[x]]) {
        if (j === undefined || j === i) continue
        touches[i][j]++
        edge = true
      }
      if (edge) edges[i]++
    }
  }
  return { touches, edges }
}

function isBlend(i, kept, sources, counts, touches, { maxOffset, minTouch }) {
  const sides = touches[i].reduce((sum, n) => sum + n, 0)
  if (sides === 0) return false
  const big = kept.filter(k => k !== i && counts[k] > counts[i])

  for (const a of big) {
    for (const b of big) {
      if (b <= a || touches[i][a] + touches[i][b] === 0) continue
      if (offsetFromLine(sources[i], sources[a], sources[b]) > maxOffset) continue
      // A soft edge is often several blends wide: neighbours on the same line count too
      const along = kept.filter(k => k === a || k === b ||
        (k !== i && offsetFromLine(sources[k], sources[a], sources[b]) <= maxOffset))
      const touching = along.reduce((sum, k) => sum + touches[i][k], 0)
      if (touching >= minTouch * sides) return true
    }
  }
  return false
}

// Distance from c to the segment a–b, as a share of its length; Infinity outside the segment.
// Weighted like colourDistance (2/4/3), so the space matches colour matching.
function offsetFromLine(c, a, b) {
  const weights = [2, 4, 3]
  const ab = weights.map((w, k) => Math.sqrt(w) * (b[k] - a[k]))
  const ac = weights.map((w, k) => Math.sqrt(w) * (c[k] - a[k]))
  const length2 = ab.reduce((sum, v) => sum + v * v, 0)
  if (length2 === 0) return Infinity
  const t = ac.reduce((sum, v, k) => sum + v * ab[k], 0) / length2
  if (t <= 0 || t >= 1) return Infinity
  const off2 = ac.reduce((sum, v, k) => sum + (v - t * ab[k]) ** 2, 0)
  return Math.sqrt(off2 / length2)
}

function nearest(colour, indexes, sources) {
  return indexes.reduce((best, k) =>
    colourDistance(sources[k], colour) < colourDistance(sources[best], colour) ? k : best)
}

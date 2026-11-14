import { colourDistance } from "./colourDistance.js"

// Below this share of all stitches a colour is likely a soft edge between two others
export const MIN_SHARE = 0.005
// Closer than this (colourDistance) two colours look almost the same
export const NEAR_DISTANCE = 1200

// Detects colours a pattern probably does not need; changes nothing.
// → { suggested, extra: [palette indexes] }. suggested is never below 2.
export function yarnAdvice({ palette, grid }, { minShare = MIN_SHARE, nearDistance = NEAR_DISTANCE } = {}) {
  const counts = palette.map(() => 0)
  let total = 0
  for (const row of grid) {
    for (const index of row) {
      counts[index]++
      total++
    }
  }

  // Most used first, so a near-duplicate is the smaller one of the pair
  const order = palette.map((_, i) => i).sort((a, b) => counts[b] - counts[a] || a - b)
  const kept = []
  const extra = []

  for (const i of order) {
    const tiny = counts[i] < minShare * total
    const near = kept.some(k => colourDistance(palette[k].source, palette[i].source) < nearDistance)
    if (tiny || near) extra.push(i)
    else kept.push(i)
  }

  return { suggested: Math.max(2, kept.length), extra: extra.sort((a, b) => a - b) }
}

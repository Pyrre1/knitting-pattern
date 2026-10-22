import { colourDistance } from "./colourDistance.js"

export function mapToPalette(grid, palette) {
  if (palette.length === 0) {
    throw new Error('palette must contain at least one colour')
  }

  return grid.map(row => row.map(px => nearestIndex(px, palette)))
}

function nearestIndex(px, palette) {
  let best = 0
  let bestDistance = colourDistance(px, palette[0])

  for (let i = 1; i < palette.length; i++) {
    const distance = colourDistance(px, palette[i])

    if (distance < bestDistance) {
      best = i
      bestDistance = distance
    }
  }

  return best
}

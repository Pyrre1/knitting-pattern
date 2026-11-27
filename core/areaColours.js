import { basicColours } from "./pickColours.js"
import { nearestIndex } from "./mapToPalette.js"
import { colourDistance } from "./colourDistance.js"
import { NEAR_DISTANCE } from "./yarnAdvice.js"

// Colours picked per area, so a small motif keeps its own yarns instead of losing them to a big
// background. `mask` is `[y][x]` true = motif, same size as `pixels`.
// A colour in both areas (green grass, green leaves) would give two near-identical yarns: the one
// covering fewer pixels is dropped and its area picks one more colour, until nothing merges.
// → source colours, background first, then motif.
export function areaColours(pixels, mask, { motif, background }) {
  assertMask(pixels, mask)
  assertYarns(motif, 'motif')
  assertYarns(background, 'background')

  const areas = splitAreas(pixels, mask)
  if (areas.motif.length === 0) throw new Error('motif area is empty')
  if (areas.background.length === 0) throw new Error('background area is empty')

  const counts = { motif, background }
  let best = []

  // Each round gives back the merged yarns; stops when that adds no colour (area out of colours)
  for (let round = 0; round <= motif + background; round++) {
    const { colours, lost } = mergeNear(pickPerArea(areas, counts), areas)
    if (colours.length <= best.length) break
    best = colours
    if (lost.motif + lost.background === 0) break
    counts.motif += lost.motif
    counts.background += lost.background
  }

  return best
}

function pickPerArea(areas, counts) {
  // basicColours takes a grid; one row holding all pixels of the area works the same
  return {
    background: basicColours([areas.background], counts.background),
    motif: basicColours([areas.motif], counts.motif)
  }
}

function splitAreas(pixels, mask) {
  const areas = { motif: [], background: [] }
  pixels.forEach((row, y) => row.forEach((px, x) => {
    (mask[y][x] ? areas.motif : areas.background).push(px)
  }))
  return areas
}

// Motif colours near a background colour: the one covering more of its own area stays
function mergeNear(picked, areas) {
  const backgroundCoverage = coverage(areas.background, picked.background)
  const background = picked.background.map((colour, i) => ({ colour, pixels: backgroundCoverage[i] }))
  const motifCoverage = coverage(areas.motif, picked.motif)
  const motif = []
  const lost = { motif: 0, background: 0 }

  picked.motif.forEach((colour, i) => {
    const match = nearestEntry(colour, background)
    if (colourDistance(colour, match.colour) >= NEAR_DISTANCE) {
      motif.push(colour)
      return
    }
    if (motifCoverage[i] > match.pixels) {
      match.colour = colour
      match.pixels = motifCoverage[i]
      lost.background++
    } else {
      lost.motif++
    }
  })

  return { colours: [...background.map(entry => entry.colour), ...motif], lost }
}

function coverage(pixels, colours) {
  const counts = colours.map(() => 0)
  for (const px of pixels) counts[nearestIndex(px, colours)]++
  return counts
}

function nearestEntry(colour, entries) {
  return entries.reduce((best, entry) =>
    colourDistance(colour, entry.colour) < colourDistance(colour, best.colour) ? entry : best
  )
}

function assertMask(pixels, mask) {
  const fits = Array.isArray(mask) && mask.length === pixels.length &&
    mask.every((row, y) => Array.isArray(row) && row.length === pixels[y].length)
  if (!fits) throw new Error('mask must be the same size as the image')
}

function assertYarns(count, area) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`${area} yarns must be a positive integer`)
  }
}

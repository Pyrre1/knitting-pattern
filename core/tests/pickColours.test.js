import { pickColours, basicColours } from '../pickColours.js'
import { colourDistance } from '../colourDistance.js'
import { imageScaler } from '../imageScaler.js'

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const RED = [200, 0, 30]
const GREEN = [0, 140, 90]

// Averaging in some edge pixels shifts a colour slightly; pink is over 10 times farther from red
const CLOSE = 3000
const hasColour = (colours, colour) => colours.some(c => colourDistance(c, colour) < CLOSE)
const mix = (a, b, share) => a.map((v, i) => Math.round(v + (b[i] - v) * share))

// White background, red stripes with soft (blended) edges, a green block and a small black block
function softLogo() {
  const SIZE = 80
  const EDGE = [mix(WHITE, RED, 0.33), mix(WHITE, RED, 0.66)]
  const stripe = [...EDGE, ...Array(8).fill(RED), ...[...EDGE].reverse()]
  return Array.from({ length: SIZE }, (_, y) => Array.from({ length: SIZE }, (_, x) => {
    if (y < 20) return x < 40 ? GREEN : WHITE
    if (y >= 70 && x >= 70) return BLACK
    if (y >= 66) return WHITE
    return stripe[x % 20] ?? WHITE
  }))
}

describe('Pick colours', () => {
  test('a small distinct colour keeps its yarn instead of a soft edge', () => {
    const pixels = softLogo()
    const scaled = imageScaler(pixels, { stitches: 80, rows: 80 })

    // The problem this solves: the edges take the yarn
    expect(hasColour(basicColours(pixels, 4), BLACK)).toBe(false)

    const colours = pickColours(pixels, scaled, 4)
    expect(colours).toHaveLength(4)
    for (const colour of [WHITE, BLACK, RED, GREEN]) expect(hasColour(colours, colour)).toBe(true)
  })

  test('falls back to the basic colours when too few are flagged', () => {
    // Wide areas of every shade: no thin edges to drop
    const shades = [0, 36, 72, 108, 144, 180, 216, 252]
    const pixels = Array.from({ length: 16 }, () => shades.flatMap(v => [[v, v, v], [v, v, v], [v, v, v], [v, v, v]]))
    expect(pickColours(pixels, pixels, 4)).toEqual(basicColours(pixels, 4))
  })

  test('falls back when the image has no more colours than yarns', () => {
    const pixels = [[WHITE, RED], [WHITE, RED]]
    expect(pickColours(pixels, pixels, 4)).toEqual(basicColours(pixels, 4))
  })

  test('honours a yarn count at the trial limit', () => {
    const pixels = Array.from({ length: 4 }, (_, y) => Array.from({ length: 16 }, (_, x) => [x * 16, y * 60, 0]))
    expect(pickColours(pixels, pixels, 20)).toEqual(basicColours(pixels, 20))
  })
})

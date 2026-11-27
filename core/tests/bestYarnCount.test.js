import { bestYarnCount, trialColours, TRIAL_COLOURS } from "../bestYarnCount.js"

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const RED = [200, 0, 30]
const GREEN = [0, 140, 90]

// Equal-width columns, 4 rows
const columns = (colours, width) =>
  Array.from({ length: 4 }, () => colours.flatMap((colour) => Array(width).fill(colour)))

describe("Best yarn count", () => {
  test("counts every colour of a flat image", () => {
    const pixels = columns([WHITE, BLACK, RED, GREEN], 5)
    expect(bestYarnCount(trialColours(pixels), pixels)).toBe(4)
  })

  test("does not count soft edges", () => {
    const edge = [
      [237, 171, 181],
      [219, 87, 107],
    ]
    const pixels = Array.from({ length: 4 }, () => [
      ...Array(8).fill(WHITE),
      ...edge,
      ...Array(8).fill(RED),
      ...Array(8).fill(BLACK),
      ...Array(8).fill(GREEN),
    ])
    expect(bestYarnCount(trialColours(pixels), pixels)).toBe(4)
  })

  test("has no answer when every trial colour is distinct", () => {
    const shades = [0, 85, 170, 255]
    const colours = shades.flatMap((r) => shades.map((g) => [r, g, 128]))
    const pixels = columns(colours, 4)
    expect(trialColours(pixels)).toHaveLength(TRIAL_COLOURS)
    expect(bestYarnCount(trialColours(pixels), pixels)).toBeNull()
  })
})

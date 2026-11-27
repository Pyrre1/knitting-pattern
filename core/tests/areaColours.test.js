import { areaColours } from '../areaColours.js'

const RED = [220, 0, 0]
const YELLOW = [255, 220, 0]
const DARK_GREEN = [0, 100, 0]
const GREEN = [0, 150, 0]
const LIGHT_GREEN = [0, 200, 0]
const ALMOST_GREEN = [0, 152, 0]

const WIDTH = 20
const HEIGHT = 10
const MOTIF_FROM = 16

// Right 4 columns are the motif
const motifMask = Array.from({ length: HEIGHT }, () =>
  Array.from({ length: WIDTH }, (_, x) => x >= MOTIF_FROM))

const image = colourAt => Array.from({ length: HEIGHT }, (_, y) =>
  Array.from({ length: WIDTH }, (_, x) => colourAt(x, y)))

const redYellowMotif = (y) => y < HEIGHT / 2 ? RED : YELLOW

describe('areaColours', () => {
  test('picks the background colours first, then the motif colours, each from its own area', () => {
    const greens = [DARK_GREEN, GREEN, LIGHT_GREEN]
    const pixels = image((x, y) => x >= MOTIF_FROM ? redYellowMotif(y) : greens[y % 3])

    const colours = areaColours(pixels, motifMask, { motif: 2, background: 1 })

    // One background yarn = the average green (4 dark rows, 3 mid, 3 light)
    const averageGreen = [0, 145, 0]
    expect(colours).toEqual([averageGreen, RED, YELLOW])
  })

  test('drops a motif colour that is near a bigger background colour and picks another one', () => {
    // Motif: half grass green, a quarter red, a quarter yellow
    const motifColour = (x, y) => x < MOTIF_FROM + 2 ? GREEN : redYellowMotif(y)
    const pixels = image((x, y) => x >= MOTIF_FROM ? motifColour(x, y) : GREEN)

    const colours = areaColours(pixels, motifMask, { motif: 2, background: 1 })

    expect(colours).toEqual([GREEN, RED, YELLOW])
  })

  test('keeps the motif colour when it covers more pixels than the near background colour', () => {
    const smallMask = image((x, y) => !(y === 0 && x < 2))
    const pixels = image((x, y) => {
      if (!smallMask[y][x]) return ALMOST_GREEN
      return y < 2 ? RED : GREEN
    })

    const colours = areaColours(pixels, smallMask, { motif: 2, background: 1 })

    expect(colours).toEqual([GREEN, RED])
  })

  test('gives fewer colours when the areas run out of distinct colours', () => {
    const pixels = image(() => GREEN)

    expect(areaColours(pixels, motifMask, { motif: 1, background: 1 })).toEqual([GREEN])
  })

  test('fails when the mask does not match the image size', () => {
    const pixels = image(() => GREEN)
    const shortMask = motifMask.slice(1)

    expect(() => areaColours(pixels, shortMask, { motif: 1, background: 1 })).toThrow('same size')
  })

  test('fails when an area is empty', () => {
    const pixels = image(() => GREEN)
    const allMotif = image(() => true)
    const noMotif = image(() => false)

    expect(() => areaColours(pixels, allMotif, { motif: 1, background: 1 })).toThrow('background area is empty')
    expect(() => areaColours(pixels, noMotif, { motif: 1, background: 1 })).toThrow('motif area is empty')
  })

  test('fails when an area has no yarns', () => {
    const pixels = image(() => GREEN)

    expect(() => areaColours(pixels, motifMask, { motif: 0, background: 2 })).toThrow('motif yarns')
    expect(() => areaColours(pixels, motifMask, { motif: 1, background: 1.5 })).toThrow('background yarns')
  })
})

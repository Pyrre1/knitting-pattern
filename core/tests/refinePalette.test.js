import { refinePalette } from '../refinePalette.js'

const RED = [200, 0, 40]
const GREEN = [0, 140, 90]
const WHITE = [255, 255, 255]

describe('Refine Palette', () => {
  test('moves rough colours onto the actual image colours', () => {
    const grid = [
      [ RED, RED, RED ],
      [ WHITE, WHITE, WHITE ]
    ]

    expect(refinePalette(grid, [ [170, 40, 60], [230, 230, 230] ])).toEqual([ RED, WHITE ])
  })

  test('separates colours that a rough palette had blended together', () => {
    // A rough palette with a red/green blend and white
    const grid = [
      [ RED, RED, GREEN, GREEN ],
      [ WHITE, WHITE, WHITE, WHITE ]
    ]

    const result = refinePalette(grid, [ [180, 20, 50], [20, 130, 90], [250, 250, 250] ])

    expect(result).toEqual([ RED, GREEN, WHITE ])
  })

  test('keeps a colour unchanged when no pixel is nearest to it', () => {
    const grid = [ [ WHITE, WHITE ] ]

    expect(refinePalette(grid, [ WHITE, [0, 0, 0] ])).toEqual([ WHITE, [0, 0, 0] ])
  })

  test('returns the initial colours when maxIterations is 0', () => {
    const grid = [ [ RED ] ]

    expect(refinePalette(grid, [ [170, 40, 60] ], 0)).toEqual([ [170, 40, 60] ])
  })

  test('does not modify the initial palette', () => {
    const initial = [ [170, 40, 60] ]
    refinePalette([ [ RED ] ], initial)

    expect(initial).toEqual([ [170, 40, 60] ])
  })
})

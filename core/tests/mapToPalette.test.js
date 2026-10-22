import { mapToPalette } from '../mapToPalette.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]

describe('Map To Palette', () => {
  test('maps each pixel to the index of the nearest palette colour', () => {
    const grid = [
      [ [10, 10, 10], [250, 240, 245] ],
      [ [200, 210, 220], [30, 20, 0] ]
    ]

    expect(mapToPalette(grid, [ BLACK, WHITE ])).toEqual([
      [ 0, 1 ],
      [ 1, 0 ]
    ])
  })

  test('keeps the grid dimensions', () => {
    const grid = [
      [ BLACK, BLACK, BLACK ],
      [ BLACK, BLACK, BLACK ]
    ]

    const result = mapToPalette(grid, [ BLACK ])

    expect(result).toHaveLength(2)
    result.forEach(row => expect(row).toHaveLength(3))
  })

  test('uses weighted distance, not plain RGB distance', () => {
    // Plain RGB: [0,10,0] is nearer (100 vs 144)
    // Weighted:  [12,0,0] is nearer (288 vs 400)
    const grid = [ [ BLACK ] ]

    expect(mapToPalette(grid, [ [0, 10, 0], [12, 0, 0] ])).toEqual([ [ 1 ] ])
  })

  test('picks the lowest index on a tie', () => {
    const grid = [ [ [100, 100, 100] ] ]

    expect(mapToPalette(grid, [ [90, 100, 100], [110, 100, 100] ])).toEqual([ [ 0 ] ])
  })

  test('throws on an empty palette', () => {
    expect(() => mapToPalette([ [ BLACK ] ], [])).toThrow('palette must contain at least one colour')
  })
})

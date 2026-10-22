import { medianCut } from '../medianCut.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
const RED = [255, 0, 0]
const GREEN = [0, 255, 0]
const BLUE = [0, 0, 255]

describe('Median Cut', () => {
  test('returns the single colour of a one-colour image', () => {
    const grid = [
      [ RED, RED ],
      [ RED, RED ]
    ]

    expect(medianCut(grid, 1)).toEqual([ RED ])
  })

  test('returns fewer colours when the image has fewer distinct colours than requested', () => {
    const grid = [
      [ RED, RED ],
      [ RED, RED ]
    ]

    expect(medianCut(grid, 3)).toEqual([ RED ])
  })

  test('returns the average colour when count is 1', () => {
    const grid = [
      [ BLACK, WHITE ]
    ]

    expect(medianCut(grid, 1)).toEqual([ [128, 128, 128] ])
  })

  test('separates two distinct colours', () => {
    const grid = [
      [ BLACK, WHITE ],
      [ WHITE, BLACK ]
    ]

    const result = medianCut(grid, 2)

    expect(result).toHaveLength(2)
    expect(result).toEqual(expect.arrayContaining([ BLACK, WHITE ]))
  })

  test('does not split identical colours when the counts are uneven', () => {
    const grid = [
      [ BLACK, BLACK ],
      [ BLACK, WHITE ]
    ]

    const result = medianCut(grid, 2)

    expect(result).toHaveLength(2)
    expect(result).toEqual(expect.arrayContaining([ BLACK, WHITE ]))
  })

  test('keeps four distinct colours when count is 4', () => {
    const grid = [
      [ RED, GREEN ],
      [ BLUE, WHITE ]
    ]

    const result = medianCut(grid, 4)

    expect(result).toHaveLength(4)
    expect(result).toEqual(expect.arrayContaining([ RED, GREEN, BLUE, WHITE ]))
  })

  test('reduces similar shades to one averaged colour each', () => {
    const grid = [
      [ [250, 0, 0], [240, 10, 0], [0, 0, 250], [10, 0, 240] ]
    ]

    const result = medianCut(grid, 2)

    expect(result).toHaveLength(2)
    expect(result).toEqual(expect.arrayContaining([ [245, 5, 0], [5, 0, 245] ]))
  })

  test('rounds averaged channels to whole numbers', () => {
    const grid = [
      [ [0, 0, 0], [1, 1, 1] ]
    ]

    const [ colour ] = medianCut(grid, 1)

    colour.forEach(channel => expect(Number.isInteger(channel)).toBe(true))
  })

  test('throws when count is not a positive integer', () => {
    const grid = [ [ RED ] ]

    expect(() => medianCut(grid, 0)).toThrow('count must be a positive integer')
    expect(() => medianCut(grid, -1)).toThrow('count must be a positive integer')
    expect(() => medianCut(grid, 1.5)).toThrow('count must be a positive integer')
  })

  test('handles full-size images (200k pixels)', () => {
    const row = Array.from({ length: 500 }, (_, x) => x < 250 ? RED : WHITE)
    const grid = Array.from({ length: 400 }, () => row)

    const result = medianCut(grid, 2)

    expect(result).toEqual(expect.arrayContaining([ RED, WHITE ]))
  })

  test('throws on an empty grid', () => {
    expect(() => medianCut([], 2)).toThrow('grid must contain at least one pixel')
  })
})

import { createPattern } from '../createPattern.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
const BLUE = [0, 0, 255]
const YELLOW = [255, 255, 0]

// 4x4 image: left half black, right half white
const pixels = [
  [ BLACK, BLACK, WHITE, WHITE ],
  [ BLACK, BLACK, WHITE, WHITE ],
  [ BLACK, BLACK, WHITE, WHITE ],
  [ BLACK, BLACK, WHITE, WHITE ]
]

// Square stitches: 20 stitches and 20 rows per 10 cm
const squareSwatch = { unit: 'cm', width: 10, height: 10, stitches: 20, rows: 20 }

describe('Create Pattern', () => {
  test('builds a pattern from swatch, image, yarn count and width', () => {
    const pattern = createPattern({
      swatch: squareSwatch,
      pixels,
      yarnCount: 2,
      desiredWidth: { unit: 'stitches', value: 2 }
    })

    expect(pattern.size.stitches).toBe(2)
    expect(pattern.size.rows).toBe(2)
    expect(pattern.palette).toEqual([
      { source: BLACK, yarn: BLACK },
      { source: WHITE, yarn: WHITE }
    ])
    expect(pattern.grid).toEqual([
      [ 0, 1 ],
      [ 0, 1 ]
    ])
  })

  test('pairs the given yarns with the image colours without changing the grid', () => {
    const pattern = createPattern({
      swatch: squareSwatch,
      pixels,
      yarnCount: 2,
      yarns: [ YELLOW, BLUE ],
      desiredWidth: { unit: 'stitches', value: 2 }
    })

    expect(pattern.palette).toEqual([
      { source: BLACK, yarn: BLUE },
      { source: WHITE, yarn: YELLOW }
    ])
    expect(pattern.grid).toEqual([
      [ 0, 1 ],
      [ 0, 1 ]
    ])
  })

  test('adds rows when stitches are wider than tall', () => {
    // 20 stitches, 30 rows per 10 cm -> 1.5 rows per stitch width
    const pattern = createPattern({
      swatch: { unit: 'cm', width: 10, height: 10, stitches: 20, rows: 30 },
      pixels,
      yarnCount: 2,
      desiredWidth: { unit: 'stitches', value: 2 }
    })

    expect(pattern.size.rows).toBe(3)
    expect(pattern.grid).toHaveLength(3)
  })

  test('finds colours from the full image, not the averaged stitches', () => {
    const RED = [200, 0, 40]
    const GREEN = [0, 140, 90]

    // A 1 px red line between green and white blends away when averaged to 2 stitches
    const row = [ GREEN, GREEN, RED, WHITE, WHITE, WHITE ]
    const lined = Array.from({ length: 6 }, () => row)

    const pattern = createPattern({
      swatch: squareSwatch,
      pixels: lined,
      yarnCount: 3,
      desiredWidth: { unit: 'stitches', value: 2 }
    })

    expect(pattern.palette.map(entry => entry.source))
      .toEqual(expect.arrayContaining([ GREEN, RED, WHITE ]))
  })

  test('keeps the scaled pixels for later edits', () => {
    const pattern = createPattern({
      swatch: squareSwatch,
      pixels,
      yarnCount: 2,
      desiredWidth: { unit: 'stitches', value: 2 }
    })

    expect(pattern.pixels).toEqual([
      [ BLACK, WHITE ],
      [ BLACK, WHITE ]
    ])
  })
})

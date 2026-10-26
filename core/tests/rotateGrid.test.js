import { rotateGrid, rotateGauge } from '../rotateGrid.js'

// 2 rows × 3 stitches
const grid = [
  [ 1, 2, 3 ],
  [ 4, 5, 6 ]
]

describe('Rotate Grid', () => {
  describe('rotateGrid', () => {
    test('turns 90° right (clockwise): left column becomes top row', () => {
      expect(rotateGrid(grid, 'right')).toEqual([
        [ 4, 1 ],
        [ 5, 2 ],
        [ 6, 3 ]
      ])
    })

    test('turns 90° left (counter-clockwise): right column becomes top row', () => {
      expect(rotateGrid(grid, 'left')).toEqual([
        [ 3, 6 ],
        [ 2, 5 ],
        [ 1, 4 ]
      ])
    })

    test('returns the same grid for none', () => {
      expect(rotateGrid(grid, 'none')).toBe(grid)
    })

    test('keeps cell values as they are, e.g. RGB pixels', () => {
      const pixels = [ [ [ 1, 2, 3 ], [ 4, 5, 6 ] ] ]

      expect(rotateGrid(pixels, 'right')).toEqual([ [ [ 1, 2, 3 ] ], [ [ 4, 5, 6 ] ] ])
    })

    test('throws on an unknown turn', () => {
      expect(() => rotateGrid(grid, 'up')).toThrow("turn must be 'none', 'right' or 'left'")
    })
  })

  describe('rotateGauge', () => {
    test('swaps stitches and rows', () => {
      const gauge = { stitchesPerCm: 2, rowsPerCm: 3, stitchesPerInch: 5, rowsPerInch: 7 }

      expect(rotateGauge(gauge)).toEqual({ stitchesPerCm: 3, rowsPerCm: 2, stitchesPerInch: 7, rowsPerInch: 5 })
    })
  })
})

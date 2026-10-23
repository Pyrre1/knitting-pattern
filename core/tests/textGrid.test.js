import { toGlyph, composeText, fitRows, textPattern } from '../textGrid.js'

const W = [255, 255, 255]
const K = [0, 0, 0]

// 1 = ink, 0 = background
const glyphs = {
  I: [ [1], [1] ],
  L: [ [1, 0], [1, 1] ],
  ' ': [ [0], [0] ]
}

const swatch = { unit: 'cm', width: 10, height: 10, stitches: 20, rows: 40 }

describe('Text Grid', () => {
  describe('toGlyph', () => {
    test('downsamples to ink where the cell is darker than mid grey', () => {
      const pixels = [
        [ K, K, W, W ],
        [ K, K, W, W ]
      ]
      const square = { stitchesPerCm: 1, rowsPerCm: 1 }

      expect(toGlyph(pixels, 1, square)).toEqual([ [ 1, 0 ] ])
    })

    test('narrows the glyph when stitches are wider than rows are tall', () => {
      const pixels = Array.from({ length: 4 }, () => [ K, K, K, K ])
      // 2 rows per stitch width: a square letter of 4 rows is 2 stitches wide
      const gauge = { stitchesPerCm: 2, rowsPerCm: 4 }

      expect(toGlyph(pixels, 4, gauge)[0]).toHaveLength(2)
    })

    test('is at least one stitch wide', () => {
      const pixels = [ [ K ], [ K ], [ K ], [ K ] ]

      expect(toGlyph(pixels, 4, { stitchesPerCm: 1, rowsPerCm: 4 })).toEqual([ [1], [1], [1], [1] ])
    })
  })

  describe('composeText', () => {
    test('places glyphs with a fixed number of stitches between them', () => {
      expect(composeText(glyphs, 'IL', { spacing: 2 })).toEqual([
        [ 1, 0, 0, 1, 0 ],
        [ 1, 0, 0, 1, 1 ]
      ])
    })

    test('reuses the same glyph for repeated letters', () => {
      const grid = composeText(glyphs, 'LL', { spacing: 1 })

      expect(grid[1]).toEqual([ 1, 1, 0, 1, 1 ])
    })

    test('treats a space as a blank glyph with spacing on both sides', () => {
      expect(composeText(glyphs, 'I I', { spacing: 1 })[0]).toEqual([ 1, 0, 0, 0, 1 ])
    })

    test('fills a given width by spreading the spacing evenly', () => {
      // 4 spare stitches over 2 gaps: 2 each
      expect(composeText(glyphs, 'III', { width: 7 })[0]).toEqual([ 1, 0, 0, 1, 0, 0, 1 ])
    })

    test('throws when the text does not fit the width', () => {
      expect(() => composeText(glyphs, 'LL', { width: 3 })).toThrow('text is 4 stitches wide, more than 3')
    })

    test('stacks lines with blank rows between and centres shorter lines', () => {
      expect(composeText(glyphs, 'I\nIII', { spacing: 1, lineSpacing: 1 })).toEqual([
        [ 0, 0, 1, 0, 0 ],
        [ 0, 0, 1, 0, 0 ],
        [ 0, 0, 0, 0, 0 ],
        [ 1, 0, 1, 0, 1 ],
        [ 1, 0, 1, 0, 1 ]
      ])
    })

    test('throws on a character without a glyph', () => {
      expect(() => composeText(glyphs, 'IX', { spacing: 1 })).toThrow('no glyph for "X"')
    })
  })

  describe('fitRows', () => {
    test('returns the most rows whose width fits', () => {
      const widthAt = rows => rows * 3

      expect(fitRows(widthAt, 20, 50)).toBe(6)
    })

    test('does not go above max rows', () => {
      expect(fitRows(() => 1, 20, 50)).toBe(50)
    })

    test('throws when not even one row fits', () => {
      expect(() => fitRows(() => 30, 20, 50)).toThrow('text does not fit 20 stitches')
    })
  })

  describe('textPattern', () => {
    const grid = [ [ 0, 1 ], [ 1, 1 ] ]

    test('keeps the grid with background first and text second', () => {
      const pattern = textPattern({ swatch, grid })

      expect(pattern.grid).toEqual(grid)
      expect(pattern.palette).toEqual([ { source: W, yarn: W }, { source: K, yarn: K } ])
    })

    test('pairs given yarns with background and text', () => {
      const red = [ 200, 0, 0 ]
      const cream = [ 250, 240, 220 ]
      const pattern = textPattern({ swatch, grid, yarns: [ red, cream ] })

      expect(pattern.palette.map(entry => entry.yarn)).toEqual([ cream, red ])
    })

    test('reports size from the gauge', () => {
      expect(textPattern({ swatch, grid }).size).toEqual({ stitches: 2, rows: 2, widthCm: 1, heightCm: 0.5 })
    })
  })
})

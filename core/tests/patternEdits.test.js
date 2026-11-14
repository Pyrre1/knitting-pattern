import { buildPattern, setYarn, removeColour, addColour, paintCell, dropEmptyColours } from '../patternEdits.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
const GREY = [128, 128, 128]
const DARK_GREY = [60, 60, 60]
const BLUE = [0, 0, 255]

const pixels = [
  [ BLACK, DARK_GREY ],
  [ GREY, WHITE ]
]

const threeColours = () => buildPattern(pixels, [
  { source: BLACK, yarn: BLACK },
  { source: GREY, yarn: GREY },
  { source: WHITE, yarn: WHITE }
])

describe('Pattern Edits', () => {
  describe('buildPattern', () => {
    test('maps pixels to palette indexes by source colour', () => {
      const pattern = threeColours()

      expect(pattern.pixels).toBe(pixels)
      expect(pattern.grid).toEqual([
        [ 0, 0 ],
        [ 1, 2 ]
      ])
    })

    test('ignores yarn colours when mapping', () => {
      const pattern = buildPattern(pixels, [
        { source: BLACK, yarn: WHITE },
        { source: WHITE, yarn: BLACK }
      ])

      expect(pattern.grid).toEqual([
        [ 0, 0 ],
        [ 1, 1 ]
      ])
    })
  })

  describe('setYarn', () => {
    test('changes only the yarn and keeps the grid', () => {
      const pattern = threeColours()
      const result = setYarn(pattern, 0, BLUE)

      expect(result.palette[0]).toEqual({ source: BLACK, yarn: BLUE })
      expect(result.grid).toEqual(pattern.grid)
    })

    test('does not modify the original pattern', () => {
      const pattern = threeColours()
      setYarn(pattern, 0, BLUE)

      expect(pattern.palette[0].yarn).toEqual(BLACK)
    })

    test('throws on an invalid index', () => {
      expect(() => setYarn(threeColours(), 3, BLUE)).toThrow('no palette entry at index 3')
    })
  })

  describe('removeColour', () => {
    test('removes the entry and remaps its stitches to the nearest remaining source', () => {
      const result = removeColour(threeColours(), 1)

      expect(result.palette).toEqual([
        { source: BLACK, yarn: BLACK },
        { source: WHITE, yarn: WHITE }
      ])
      // GREY (128) is nearer WHITE than BLACK
      expect(result.grid).toEqual([
        [ 0, 0 ],
        [ 1, 1 ]
      ])
    })

    test('does not modify the original pattern', () => {
      const pattern = threeColours()
      removeColour(pattern, 1)

      expect(pattern.palette).toHaveLength(3)
    })

    test('throws when removing the last colour', () => {
      const pattern = buildPattern(pixels, [ { source: GREY, yarn: GREY } ])

      expect(() => removeColour(pattern, 0)).toThrow('cannot remove the last colour')
    })

    test('throws on an invalid index', () => {
      expect(() => removeColour(threeColours(), -1)).toThrow('no palette entry at index -1')
    })
  })

  describe('addColour', () => {
    test('appends the entry and remaps stitches', () => {
      const result = addColour(threeColours(), DARK_GREY, BLUE)

      expect(result.palette[3]).toEqual({ source: DARK_GREY, yarn: BLUE })
      expect(result.grid).toEqual([
        [ 0, 3 ],
        [ 1, 2 ]
      ])
    })

    test('uses the source as yarn when no yarn is given', () => {
      const result = addColour(threeColours(), DARK_GREY)

      expect(result.palette[3]).toEqual({ source: DARK_GREY, yarn: DARK_GREY })
    })
  })

  describe('paintCell', () => {
    test('sets one stitch to a palette index', () => {
      const result = paintCell(threeColours(), 1, 0, 2)

      expect(result.grid).toEqual([
        [ 0, 2 ],
        [ 1, 2 ]
      ])
    })

    test('does not modify the original pattern', () => {
      const pattern = threeColours()
      paintCell(pattern, 1, 0, 2)

      expect(pattern.grid[0]).toEqual([ 0, 0 ])
    })

    test('returns the same pattern when the stitch already has that colour', () => {
      const pattern = threeColours()

      expect(paintCell(pattern, 0, 0, 0)).toBe(pattern)
    })

    test('throws on an invalid palette index', () => {
      expect(() => paintCell(threeColours(), 0, 0, 3)).toThrow('no palette entry at index 3')
    })

    test('throws when the stitch is outside the grid', () => {
      expect(() => paintCell(threeColours(), 2, 0, 0)).toThrow('no stitch at 2, 0')
      expect(() => paintCell(threeColours(), 0, -1, 0)).toThrow('no stitch at 0, -1')
    })
  })

  describe('dropEmptyColours', () => {
    const entry = colour => ({ source: colour, yarn: colour })
    const withGrid = (palette, grid) => ({ pixels, palette: palette.map(entry), grid })

    test('drops colours without stitches and renumbers the grid', () => {
      const pattern = withGrid([BLACK, BLUE, GREY, DARK_GREY, WHITE], [[0, 2], [4, 4]])
      const { pattern: result, dropped } = dropEmptyColours(pattern)

      expect(dropped).toEqual([1, 3])
      expect(result.palette.map(e => e.source)).toEqual([BLACK, GREY, WHITE])
      expect(result.grid).toEqual([[0, 1], [2, 2]])
      expect(result.pixels).toBe(pixels)
    })

    test('returns the same pattern when every colour is used', () => {
      const pattern = threeColours()
      expect(dropEmptyColours(pattern)).toEqual({ pattern, dropped: [] })
    })

    test('keeps at least 2 colours, the earliest ones', () => {
      const pattern = withGrid([BLACK, GREY, WHITE, BLUE], [[0, 0], [0, 0]])
      const { pattern: result, dropped } = dropEmptyColours(pattern)

      expect(dropped).toEqual([2, 3])
      expect(result.palette.map(e => e.source)).toEqual([BLACK, GREY])
      expect(result.grid).toEqual([[0, 0], [0, 0]])
    })
  })
})

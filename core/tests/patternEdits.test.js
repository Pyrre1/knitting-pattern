import { buildPattern, setYarn, removeColour, addColour } from '../patternEdits.js'

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
})

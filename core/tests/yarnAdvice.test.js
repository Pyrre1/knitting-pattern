import { yarnAdvice } from '../yarnAdvice.js'

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const RED = [255, 0, 0]
const BLUE = [0, 0, 255]

const entry = colour => ({ source: colour, yarn: colour })

// Grid with `counts[i]` stitches of palette index i, in one row
const gridOf = counts => [counts.flatMap((count, i) => Array(count).fill(i))]

describe('Yarn advice', () => {
  test('keeps every colour that is used and distinct', () => {
    const palette = [WHITE, BLACK, RED, BLUE].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([40, 30, 20, 10]) })).toEqual({ suggested: 4, extra: [] })
  })

  test('flags colours with almost no stitches', () => {
    const palette = [WHITE, BLACK, RED].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([600, 399, 1]) })).toEqual({ suggested: 2, extra: [2] })
  })

  test('flags the smaller of two near-identical colours', () => {
    const palette = [WHITE, [250, 250, 250], BLACK, RED].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([30, 40, 20, 10]) })).toEqual({ suggested: 3, extra: [0] })
  })

  test('compares source colours, not chosen yarns', () => {
    const palette = [{ source: WHITE, yarn: RED }, { source: BLACK, yarn: RED }]
    expect(yarnAdvice({ palette, grid: gridOf([50, 50]) })).toEqual({ suggested: 2, extra: [] })
  })

  test('never suggests fewer than 2 yarns', () => {
    const palette = [WHITE, [254, 254, 254], [253, 253, 253]].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([50, 30, 20]) }).suggested).toBe(2)
  })

  test('limits are adjustable', () => {
    const palette = [WHITE, BLACK, RED].map(entry)
    const pattern = { palette, grid: gridOf([94, 4, 2]) }
    expect(yarnAdvice(pattern, { minShare: 0.05 }).extra).toEqual([1, 2])
  })
})

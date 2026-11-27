import { yarnAdvice } from "../yarnAdvice.js"

const WHITE = [255, 255, 255]
const BLACK = [0, 0, 0]
const RED = [255, 0, 0]
const BLUE = [0, 0, 255]
const GREY = [128, 128, 128]
const PINK = [255, 128, 128]

const entry = (colour) => ({ source: colour, yarn: colour })

// Grid with `counts[i]` stitches of palette index i, in one row
const gridOf = (counts) => [counts.flatMap((count, i) => Array(count).fill(i))]

// Rows from strings, one digit = palette index per stitch
const chart = (...rows) => rows.map((row) => [...row].map(Number))

describe("Yarn advice", () => {
  test("keeps every colour that is used and distinct", () => {
    const palette = [WHITE, BLACK, RED, BLUE].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([40, 30, 20, 10]) })).toMatchObject({ suggested: 4, extra: [] })
  })

  test("flags colours without stitches", () => {
    const palette = [WHITE, BLACK, RED].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([60, 40, 0]) })).toMatchObject({ suggested: 2, extra: [2] })
  })

  test("keeps a small colour that is not a blend", () => {
    const palette = [WHITE, BLACK, RED].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([600, 399, 1]) }).extra).toEqual([])
  })

  test("flags the smaller of two near-identical colours", () => {
    const palette = [WHITE, [250, 250, 250], BLACK, RED].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([30, 40, 20, 10]) })).toMatchObject({
      suggested: 3,
      extra: [0],
    })
  })

  test("flags a thin edge between two colours that lies between them in colour", () => {
    const palette = [WHITE, BLACK, GREY, RED].map(entry)
    const grid = chart("0000211113", "0000211113", "0000211113", "0000211113")
    expect(yarnAdvice({ palette, grid })).toMatchObject({ suggested: 3, extra: [2] })
  })

  test("keeps a thin line whose colour is not between its neighbours", () => {
    const palette = [WHITE, BLACK, RED, BLUE].map(entry)
    const grid = chart("0000211113", "0000211113", "0000211113", "0000211113")
    expect(yarnAdvice({ palette, grid }).extra).toEqual([])
  })

  test("keeps a filled area even when its colour lies between two others", () => {
    const palette = [WHITE, BLACK, GREY, RED].map(entry)
    const grid = chart("0002221113", "0002221113", "0002221113", "0002221113")
    expect(yarnAdvice({ palette, grid }).extra).toEqual([])
  })

  test("flags a soft edge several blends wide, one at a time", () => {
    const palette = [WHITE, RED, PINK, [255, 192, 192], BLACK].map(entry)
    const grid = chart("0000321114", "0000321114", "0000321114", "0000321114")
    expect(yarnAdvice({ palette, grid })).toMatchObject({ suggested: 3, extra: [2, 3] })
  })

  test("lists flagged colours in removal order, fewest stitches first", () => {
    const palette = [WHITE, [250, 250, 250], BLACK, RED, BLUE].map(entry)
    const advice = yarnAdvice({ palette, grid: gridOf([40, 10, 30, 20, 0]) })
    expect(advice.order).toEqual([4, 1])
    expect(advice.extra).toEqual([1, 4])
  })

  test("compares source colours, not chosen yarns", () => {
    const palette = [
      { source: WHITE, yarn: RED },
      { source: BLACK, yarn: RED },
    ]
    expect(yarnAdvice({ palette, grid: gridOf([50, 50]) })).toMatchObject({ suggested: 2, extra: [] })
  })

  test("never suggests fewer than 2 yarns", () => {
    const palette = [WHITE, [254, 254, 254], [253, 253, 253]].map(entry)
    expect(yarnAdvice({ palette, grid: gridOf([50, 30, 20]) }).suggested).toBe(2)
  })

  test("limits are adjustable", () => {
    const palette = [WHITE, [240, 240, 240], BLACK].map(entry)
    const pattern = { palette, grid: gridOf([50, 30, 20]) }
    expect(yarnAdvice(pattern).extra).toEqual([])
    expect(yarnAdvice(pattern, { nearDistance: 3000 }).extra).toEqual([1])
  })

  test("says why each colour is flagged and which colours it is like", () => {
    const palette = [WHITE, BLACK, GREY, [250, 250, 250], RED].map(entry)
    const grid = chart("0000211114", "0000211114", "0000211114", "3000211114")
    const withEmpty = { palette: [...palette, entry(BLUE)], grid }
    expect(yarnAdvice(withEmpty).flags).toEqual([
      { index: 2, reason: "blend", with: [0, 1] },
      { index: 3, reason: "near", with: [0] },
      { index: 5, reason: "empty", with: [] },
    ])
  })
})

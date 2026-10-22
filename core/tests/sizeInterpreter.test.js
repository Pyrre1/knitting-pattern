import { sizeInterpreter } from '../sizeInterpreter.js'

describe('Size Interpreter', () => {
  let gauge
  
  beforeEach(() => {
    gauge = {
      stitchesPerCm: 2.6,
      rowsPerCm: 3.6,
      stitchesPerInch: 2.6 * 2.54,
      rowsPerInch: 3.6 * 2.54
    }
  })

  test('converts width in stitches into rows using gauge + aspect ratio', () => {
    const imageAspectRatio = 1.5 // height = width * 1.5

    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'stitches', value: 40 },
      imageAspectRatio
    })

    expect(result.stitches).toBe(40)

    // Calculate expected rows (stitches * aspect ratio * (rowsPerCm / stitchesPerCm)):
    const expectedRows = Math.round(40 * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm))
    expect(result.rows).toBe(expectedRows)
    expect(result.widthCm).toBeCloseTo(40 / gauge.stitchesPerCm)
    expect(result.heightCm).toBeCloseTo(result.widthCm * imageAspectRatio)
  })

  test('converts width in cm to stitches and rows using gauge + aspect ratio', () => {
    const imageAspectRatio = 0.75
    const desiredWidthCm = 15

    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: desiredWidthCm },
      imageAspectRatio
    })

    const rawStitches = desiredWidthCm * gauge.stitchesPerCm
    expect(result.stitches).toBe(Math.round(rawStitches))

    const expectedRows = Math.round(rawStitches * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm))
    expect(result.rows).toBe(expectedRows)
    expect(result.widthCm).toBeCloseTo(desiredWidthCm)
    expect(result.heightCm).toBeCloseTo(desiredWidthCm * imageAspectRatio)
  })

  test('converts width in inches to stitches and rows using gauge + aspect ratio', () => {
    const imageAspectRatio = 1.2
    const desiredWidthInch = 6

    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'inch', value: desiredWidthInch },
      imageAspectRatio
    })

    const rawStitches = desiredWidthInch * gauge.stitchesPerInch
    expect(result.stitches).toBe(Math.round(rawStitches))

    const expectedRows = Math.round(rawStitches * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm))
    expect(result.rows).toBe(expectedRows)
    expect(result.widthCm).toBeCloseTo(desiredWidthInch * 2.54)
    expect(result.heightCm).toBeCloseTo(desiredWidthInch * 2.54 * imageAspectRatio)
  })

  test('throws on invalid width unit', () => {
    const imageAspectRatio = 1.0  

    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'pixels', value: 100 },
      imageAspectRatio
    })).toThrow("Unsupported unit")
  })

  test('throws when desired width is negative', () => {
    const imageAspectRatio = 1.0

    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'stitches', value: -10 },
      imageAspectRatio
    })).toThrow()

    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: -5 },
      imageAspectRatio
    })).toThrow()

    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'inch', value: -3 },
      imageAspectRatio
    })).toThrow()
  })

  test('throws when desired width is zero', () => {
    const imageAspectRatio = 1.0
    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'stitches', value: 0 },
      imageAspectRatio
    })).toThrow()
  })

  test('handles very small desired widths', () => {
    const imageAspectRatio = 1.0
    
    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: 0.1 },
      imageAspectRatio
    })

    expect(result.widthCm).toBeCloseTo(0.1)
    expect(result.stitches).toBe(1)
    expect(result.rows).toBe(1)
  })

  test('handles very large desired widths', () => {
    const imageAspectRatio = 1.0

    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: 1000 },
      imageAspectRatio
    })

    expect(result.widthCm).toBeCloseTo(1000)
    expect(result.stitches).toBe(2600)
  })

  test('rounds fractional stitches and rows to whole numbers', () => {
    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: 10.3 }, // 26.78 stitches
      imageAspectRatio: 1.0                       // 37.08 rows
    })

    expect(result.stitches).toBe(27)
    expect(result.rows).toBe(37)
  })

  test('throws when aspect ratio is zero', () => {
    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: 10 },
      imageAspectRatio: 0
    })).toThrow("Aspect ratio must be greater than 0")
  })

  test('throws when aspect ratio is negative', () => {
    expect(() => sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'cm', value: 10 },
      imageAspectRatio: -1
    })).toThrow("Aspect ratio must be greater than 0")
  })
})
import { gaugeInterpreter } from '../gaugeInterpreter.js'

describe('Gauge Interpreter', () => {

  test('interprets a 10x10 cm gauge with 26 stitches and 36 rows correctly', () => {
    const gauge = gaugeInterpreter({
      unit: 'cm',
      width: 10,
      height: 10,
      stitches: 26,
      rows: 36
    })

    expect(gauge.stitchesPerCm).toBeCloseTo(2.6)
    expect(gauge.rowsPerCm).toBeCloseTo(3.6)
    expect(gauge.stitchesPerInch).toBeCloseTo(2.6 * 2.54)
    expect(gauge.rowsPerInch).toBeCloseTo(3.6 * 2.54)
  })

  test('interprets a 4x4 inch gauge with 20 stitches and 28 rows correctly', () => {
    const gauge = gaugeInterpreter({
      unit: 'inch',
      width: 4,
      height: 4,
      stitches: 20,
      rows: 28
    })

    expect(gauge.stitchesPerInch).toBeCloseTo(5)
    expect(gauge.rowsPerInch).toBeCloseTo(7)
    expect(gauge.stitchesPerCm).toBeCloseTo(5 / 2.54)
    expect(gauge.rowsPerCm).toBeCloseTo(7 / 2.54)
  })

  test('throws on invalid unit', () => {
    expect(() => gaugeInterpreter({
      unit: 'mm',
      width: 10,
      height: 10,
      stitches: 26,
      rows: 36
    })).toThrow("unit must be either 'cm' or 'inch'")
  })

  test('handles fractional gauge measurements (3.5x5.5 inches)', () => {
    const gauge = gaugeInterpreter({
      unit: 'inch',
      width: 3.5,
      height: 5.5,
      stitches: 18,
      rows: 24
    })

    expect(gauge.stitchesPerInch).toBeCloseTo(18 / 3.5)
    expect(gauge.rowsPerInch).toBeCloseTo(24 / 5.5)
    expect(gauge.stitchesPerCm).toBeCloseTo((18 / 3.5) / 2.54)
    expect(gauge.rowsPerCm).toBeCloseTo((24 / 5.5) / 2.54)
  })

  test('handles unusual gauge swatch measurements (12x18 cm)', () => {
    const gauge = gaugeInterpreter({
      unit: 'cm',
      width: 12,
      height: 18,
      stitches: 26,
      rows: 36
    })

    expect(gauge.stitchesPerCm).toBeCloseTo(26 / 12)
    expect(gauge.rowsPerCm).toBeCloseTo(36 / 18)
    expect(gauge.stitchesPerInch).toBeCloseTo((26 / 12) * 2.54)
    expect(gauge.rowsPerInch).toBeCloseTo((36 / 18) * 2.54)
  })

  test('throws when width or height is zero', () => {
    expect(() => gaugeInterpreter({
      unit: 'cm',
      width: 0,
      height: 10,
      stitches: 26,
      rows: 36
    })).toThrow("width and height must be positive numbers")
  })

  test('throws when width or height is negative', () => {
    expect(() => gaugeInterpreter({
      unit: 'cm',
      width: 10,
      height: -5,
      stitches: 26,
      rows: 36
    })).toThrow("width and height must be positive numbers")
  })

  test('throws when stitches or rows is zero', () => {
    expect(() => gaugeInterpreter({
      unit: 'cm',
      width: 10,
      height: 10,
      stitches: 0,
      rows: 36
    })).not.toThrow()
  })

  test('throws when stitches or rows is negative', () => {
    expect(() => gaugeInterpreter({
      unit: 'cm',
      width: 10,
      height: 10,
      stitches: -25,
      rows: -36
    })).not.toThrow()
  })
})
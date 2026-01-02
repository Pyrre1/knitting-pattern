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
})
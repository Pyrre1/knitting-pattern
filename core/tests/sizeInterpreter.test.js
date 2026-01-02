import { sizeInterpreter } from '../sizeInterpreter.js'

describe('Size Interpreter', () => {

  test('converts width in stitches into rows using gauge + aspect ratio', () => {
    const gauge = {
      stitchesPerCm: 2.6,
      rowsPerCm: 3.6,
      stitchesPerInch: 2.6 * 2.54,
      rowsPerInch: 3.6 * 2.54
    }

    const imageAspectRatio = 1.5 // height = width * 1.5

    const result = sizeInterpreter({
      gauge,
      desiredWidth: { unit: 'stitches', value: 40 },
      imageAspectRatio: imageAspectRatio
    })

    expect(result.stitches).toBe(40)

    // Calculate expected rows (stitches * aspect ratio * (rowsPerCm / stitchesPerCm)):
    const expectedRows = result.stitches * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm)
    expect(result.rows).toBeCloseTo(expectedRows)
    expect(result.widthCm).toBeCloseTo(40 / gauge.stitchesPerCm)
    expect(result.heightCm).toBeCloseTo(result.widthCm * imageAspectRatio)
  })
})
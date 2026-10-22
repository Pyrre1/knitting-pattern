import { colourDistance } from '../colourDistance.js'

describe('Colour Distance', () => {
  test('is 0 for identical colours', () => {
    expect(colourDistance([12, 34, 56], [12, 34, 56])).toBe(0)
  })

  test('is symmetric', () => {
    const a = [10, 200, 30]
    const b = [90, 20, 250]

    expect(colourDistance(a, b)).toBe(colourDistance(b, a))
  })

  test('weights channels 2 (red), 4 (green), 3 (blue) on squared differences', () => {
    const origin = [0, 0, 0]

    expect(colourDistance(origin, [10, 0, 0])).toBe(200)
    expect(colourDistance(origin, [0, 10, 0])).toBe(400)
    expect(colourDistance(origin, [0, 0, 10])).toBe(300)
  })
})

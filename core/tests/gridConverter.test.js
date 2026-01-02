import { gridConverter } from "../gridConverter.js"

describe('Grid Converter', () => {

  test('converts a simple 200x150 image to a 10x5 grid', () => {
    const mockedImage = { width: 150, height: 160 }
    const result = gridConverter(mockedImage, 5, 8)

    expect(result.cellWidths).toEqual(new Array(5).fill(30))
    expect(result.cellHeights).toEqual(new Array(8).fill(20))
  })

  test('uses accumulator for fractional cell sizes', () => {
    const mockedImage = { width: 98, height: 78 }
    const result = gridConverter(mockedImage, 10, 7)
  
    expect(result.cellWidths.reduce((a,b)=>a+b,0)).toBe(98)
    expect(result.cellWidths).toEqual([10,10,10,10,9,10,10,10,10,9])
    expect(result.cellHeights.reduce((a,b)=>a+b,0)).toBe(78)
    expect(result.cellHeights).toEqual([12,11,11,11,11,11,11])
  })

  test('throws when stitches or rows are zero', () => {
    const mockedImage = { width: 100, height: 100 }
    expect(() => gridConverter(mockedImage, 0, 5)).toThrow('cellCount must be greater than 0')
    expect(() => gridConverter(mockedImage, 5, 0)).toThrow('cellCount must be greater than 0')
  })

  test('handles tiny images', () => {
    const mockedImage = { width: 1, height: 1 }
    const result = gridConverter(mockedImage, 5, 4)

    expect(result.cellWidths.reduce((a,b)=>a+b,0)).toBe(1)
    expect(result.cellHeights.reduce((a,b)=>a+b,0)).toBe(1)
  })
})
import { gridConverter } from "../gridConverter.js"

describe('Grid Converter', () => {

  test('converts a simple 200x150 image to a 10x5 grid', () => {
    const mockedImage = { width: 150, height: 160 }
    const result = gridConverter(mockedImage, 5, 8)

    expect(result.cellWidths).toEqual(new Array(5).fill(30))
    expect(result.cellHeights).toEqual(new Array(8).fill(20))
  })
})
import { fromImageData } from '../fromImageData.js'

describe('From Image Data', () => {
  test('converts flat RGBA data into a [y][x] grid of RGB pixels', () => {
    const imageData = {
      width: 2,
      height: 2,
      data: new Uint8ClampedArray([
        255, 0, 0, 255,    0, 255, 0, 255,
        0, 0, 255, 255,    10, 20, 30, 255
      ])
    }

    expect(fromImageData(imageData)).toEqual([
      [ [255, 0, 0], [0, 255, 0] ],
      [ [0, 0, 255], [10, 20, 30] ]
    ])
  })

  test('blends transparent pixels onto white', () => {
    const imageData = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([
        0, 0, 0, 0,    0, 0, 0, 51
      ])
    }

    // alpha 0 -> white; alpha 51 (20%) -> 255 * 0.8 = 204
    expect(fromImageData(imageData)).toEqual([
      [ [255, 255, 255], [204, 204, 204] ]
    ])
  })
})

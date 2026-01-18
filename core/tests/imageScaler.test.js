import { imageScaler } from '../imageScaler.js'

describe('Image Scaler', () => {
  
  test('scales a 4x4 image down to 2x2 by by averaging "pixels"', () => {
    const inputImage = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16]
    ]
    
    const result = imageScaler(inputImage, { stitches: 2, rows: 2 })

    expect(result).toEqual([
      [
        (1 + 2 + 5 + 6) / 4,
        (3 + 4 + 7 + 8) / 4
      ],
      [
        (9 + 10 + 13 + 14) / 4,
        (11 + 12 + 15 + 16) / 4
      ]
    ])
  })
})


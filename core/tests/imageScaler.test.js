import { imageScaler } from '../imageScaler.js'

describe('Image Scaler', () => {
  test('scales a 2x2 RGB image down to 1x1 by averaging RGB channels', () => {
    const inputImage = [
      [ [255, 0, 0], [0, 255, 0] ],
      [ [0, 0, 255], [255, 255, 0] ]
    ]

    const result = imageScaler(inputImage, { stitches: 1, rows: 1 })

    expect(result).toEqual([
      [
        [
          (255 + 0 + 0 + 255) / 4,
          (0 + 255 + 0 + 255) / 4,
          (0 + 0 + 255 + 0) / 4
        ]
      ]
    ])
  })

  test('scales a 4x4 RGB image down to 2x2 by averaging RGB channels', () => {
    const inputImage = [
      [ [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0] ],
      [ [0, 0, 255], [255, 255, 0], [255, 0, 0], [0, 255, 0] ],
      [ [0, 0, 255], [255, 255, 0], [255, 0, 0], [0, 255, 0] ],
      [ [0, 0, 255], [255, 255, 0], [255, 0, 0], [0, 255, 0] ]
    ]

    const result = imageScaler(inputImage, { stitches: 2, rows: 2 })

    expect(result).toEqual([
      [
        [(255 + 0 + 0 + 255) / 4, (0 + 255 + 0 + 255) / 4, (0 + 0 + 255 + 0) / 4 ],
        [(255 + 0 + 255 + 0) / 4, (0 + 255 + 0 + 255) / 4, (0 + 0 + 0 + 0) / 4 ]
        
      ],
      [
        [(0 + 255 + 0 + 255) / 4, (0 + 0 + 255 + 0) / 4, (255 + 255 + 0 + 255) / 4 ],
        [(0 + 255 + 255 + 0) / 4, (0 + 0 + 0 + 255) / 4, (255 + 0 + 0 + 0) / 4 ]
      ]
    ])
  })
})


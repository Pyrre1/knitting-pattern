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
        [(0 + 255 + 0 + 255) / 4, (0 + 255 + 0 + 255) / 4, (255 + 0 + 0 + 0) / 4 ]
        
      ],
      [
        [(0 + 255 + 0 + 255) / 4, (0 + 255 + 0 + 255) / 4, (255 + 0 + 255 + 0) / 4 ],
        [(255 + 0 + 255 + 0) / 4, (0 + 255 + 0 + 255) / 4, (0 + 0 + 0 + 0) / 4 ]
      ]
    ])
  })

  test('splits uneven sizes using computeCellSizes (remainder goes to first cells)', () => {
    // 3 px wide into 2 stitches -> cell widths [2, 1]
    const inputImage = [
      [ [0, 0, 0], [100, 100, 100], [200, 200, 200] ]
    ]

    const result = imageScaler(inputImage, { stitches: 2, rows: 1 })

    expect(result).toEqual([
      [ [50, 50, 50], [200, 200, 200] ]
    ])
  })

  test('throws when the grid has more stitches than the image has pixels', () => {
    const inputImage = [
      [ [0, 0, 0], [255, 255, 255] ]
    ]

    expect(() => imageScaler(inputImage, { stitches: 3, rows: 1 }))
      .toThrow('Grid (3x1) is larger than image (2x1)')
  })

  test('throws when the grid has more rows than the image has pixels', () => {
    const inputImage = [
      [ [0, 0, 0], [255, 255, 255] ]
    ]

    expect(() => imageScaler(inputImage, { stitches: 2, rows: 2 }))
      .toThrow('Grid (2x2) is larger than image (2x1)')
  })
})

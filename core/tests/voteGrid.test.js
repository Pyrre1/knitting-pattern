import { voteGrid } from '../voteGrid.js'
import { mapToPalette } from '../mapToPalette.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
// Nearest of these three to the average of black and white
const GREEN = [100, 160, 100]
const colours = [ BLACK, WHITE, GREEN ]

describe('voteGrid', () => {
  test('each stitch takes the colour most of its pixels are nearest to', () => {
    // Two stitches of 3 pixels: mostly black, mostly white
    const image = [[ BLACK, WHITE, BLACK, WHITE, WHITE, BLACK ]]

    expect(voteGrid(image, { stitches: 2, rows: 1 }, colours, [[ 2, 2 ]])).toEqual([[ 0, 1 ]])
  })

  test('thin black on white never becomes the colour nearest to their average', () => {
    const image = [[ BLACK, WHITE, BLACK ]]
    const averaged = mapToPalette([[[ 85, 85, 85 ]]], colours)

    expect(averaged).toEqual([[ 2 ]])
    expect(voteGrid(image, { stitches: 1, rows: 1 }, colours, averaged)).toEqual([[ 0 ]])
  })

  test('a tie keeps the colour from averaging', () => {
    const image = [[ BLACK, WHITE ]]

    expect(voteGrid(image, { stitches: 1, rows: 1 }, colours, [[ 1 ]])).toEqual([[ 1 ]])
    expect(voteGrid(image, { stitches: 1, rows: 1 }, colours, [[ 0 ]])).toEqual([[ 0 ]])
  })

  test('splits uneven images into cells like imageScaler', () => {
    // 5 pixels into 2 stitches: widths 3 and 2
    const image = [[ BLACK, BLACK, WHITE, WHITE, WHITE ], [ BLACK, BLACK, WHITE, WHITE, WHITE ]]

    expect(voteGrid(image, { stitches: 2, rows: 1 }, colours, [[ 2, 2 ]])).toEqual([[ 0, 1 ]])
  })
})

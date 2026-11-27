import { computeCellSizes } from "./accumulator.js"

// Splits a chart into page tiles for printing in scale. Units are free, but
// cellWidth/cellHeight and areaWidth/areaHeight must share them.
// Tiles are as even as possible and never cut a cell. Tile rows are named
// A, B … from the top, columns 1, 2 … from the left: A1, A2, B1 …
// firstAreaWidth (default areaWidth) narrows the first column, leaving room beside A1 on page 1.
export function planTiles({
  stitches,
  rows,
  cellWidth,
  cellHeight,
  areaWidth,
  areaHeight,
  firstAreaWidth = areaWidth,
}) {
  const perTileStitches = Math.max(1, Math.floor(areaWidth / cellWidth))
  const perTileRows = Math.max(1, Math.floor(areaHeight / cellHeight))
  const widths = columnWidths(stitches, perTileStitches, Math.max(1, Math.floor(firstAreaWidth / cellWidth)))
  const heights = computeCellSizes(rows, Math.ceil(rows / perTileRows))

  const tiles = []
  let y = 0
  heights.forEach((tileRows, down) => {
    let x = 0
    widths.forEach((tileStitches, across) => {
      tiles.push({ name: tileName(down, across), x, y, stitches: tileStitches, rows: tileRows })
      x += tileStitches
    })
    y += tileRows
  })
  return { across: widths.length, down: heights.length, tiles }
}

// Fewest columns, as even as possible, with the first one at most firstMax
function columnWidths(stitches, max, firstMax) {
  if (stitches <= firstMax) return [stitches]
  const count = 1 + Math.ceil((stitches - firstMax) / max)
  const even = computeCellSizes(stitches, count)
  if (even[0] <= firstMax) return even
  return [firstMax, ...computeCellSizes(stitches - firstMax, count - 1)]
}

// A … Z, then AA, AB …
function tileName(down, across) {
  let letters = ""
  for (let n = down + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters
  }
  return `${letters}${across + 1}`
}

import { computeCellSizes } from "./accumulator.js"

export function gridConverter(image, stitches, rows) {
  const cellWidths = computeCellSizes(image.width, stitches)
  const cellHeights = computeCellSizes(image.height, rows)

  return {
    cellWidths,
    cellHeights,
    stitches,
    rows
  }
}
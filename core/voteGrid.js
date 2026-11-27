import { computeCellSizes } from "./accumulator.js"
import { nearestIndex } from "./mapToPalette.js"

// Majority vote per stitch: each image pixel goes to its nearest colour, the stitch takes the most
// common one. Averaging first would turn thin black-on-white lines grey, and grey may be nearest
// to a third colour (e.g. green). Ties keep the colour from `averagedGrid` (deterministic).
// Cells are split like imageScaler (computeCellSizes), so stitch [row][stitch] covers the same pixels.
export function voteGrid(image, { stitches, rows }, colours, averagedGrid) {
  const cellWidths = computeCellSizes(image[0].length, stitches)
  const cellHeights = computeCellSizes(image.length, rows)

  const grid = []
  let yStart = 0
  for (let row = 0; row < rows; row++) {
    const gridRow = []
    let xStart = 0
    for (let stitch = 0; stitch < stitches; stitch++) {
      const votes = countVotes(
        image,
        colours,
        xStart,
        xStart + cellWidths[stitch],
        yStart,
        yStart + cellHeights[row],
      )
      gridRow.push(winner(votes, averagedGrid[row][stitch]))
      xStart += cellWidths[stitch]
    }
    grid.push(gridRow)
    yStart += cellHeights[row]
  }
  return grid
}

function countVotes(image, colours, xStart, xEnd, yStart, yEnd) {
  const votes = colours.map(() => 0)
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) votes[nearestIndex(image[y][x], colours)]++
  }
  return votes
}

function winner(votes, tieBreak) {
  let best = tieBreak
  votes.forEach((count, index) => {
    if (count > votes[best]) best = index
  })
  return best
}

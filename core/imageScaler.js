import { computeCellSizes } from "./accumulator.js"

export function imageScaler(imageData, { stitches, rows }) {
  const height = imageData.length
  const width = imageData[0].length

  if (stitches > width || rows > height) {
    throw new Error(`Grid (${stitches}x${rows}) is larger than image (${width}x${height})`)
  }

  const cellWidths = computeCellSizes(width, stitches)
  const cellHeights = computeCellSizes(height, rows)

  const result = []

  let yStart = 0
  for (let row = 0; row < rows; row++) {
    const scaledRow = []
    const yEnd = yStart + cellHeights[row]

    let xStart = 0
    for (let stitch = 0; stitch < stitches; stitch++) {
      const xEnd = xStart + cellWidths[stitch]

      let sumR = 0, sumG = 0, sumB = 0
      let count = 0

      for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
          const px = imageData[y][x]

          sumR += px[0]
          sumG += px[1]
          sumB += px[2]

          count++
        }
      }

      scaledRow.push([
        sumR / count,
        sumG / count,
        sumB / count
      ])

      xStart = xEnd
    }

    result.push(scaledRow)
    yStart = yEnd
  }

  return result
}

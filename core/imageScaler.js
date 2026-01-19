export function imageScaler(imageData, { stitches, rows }) {
  const height = imageData.length
  const width = imageData[0].length

  const blockWidth = width / stitches
  const blockHeight = height / rows

  const result = []

  for (let row = 0; row < rows; row++) {
    const scaledRow = []

    const yStart = Math.floor(row * blockHeight)
    const yEnd = Math.floor((row + 1) * blockHeight)

    for (let stitch = 0; stitch < stitches; stitch++) {
      const xStart = Math.floor(stitch * blockWidth)
      const xEnd = Math.floor((stitch + 1) * blockWidth)

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
    }

    result.push(scaledRow)
  }

  return result
}
export function imageScaler(imageData, { stitches, rows }) {
  const blockWidth = imageData[0].length / stitches
  const blockHeight = imageData.length / rows

  const result = []

  for (let row = 0; row < rows; row++) {
    const scaledRow = []
    for (let stitch = 0; stitch < stitches; stitch++) {
      let sum = 0
      let count = 0

      for (let y = row * blockHeight; y < (row + 1) * blockHeight; y++) {
        for (let x = stitch * blockWidth; x < (stitch + 1) * blockWidth; x++) {
          sum += imageData[y][x]
          count++
        }
      }

      scaledRow.push(sum / count)
    }
    result.push(scaledRow)
  }

  return result
}
export function computeCellSizes(totalPixels, cellCount) {
  if (cellCount <= 0) {
    throw new Error('cellCount must be greater than 0')
  }

  const base = Math.floor(totalPixels / cellCount)
  const remainder = totalPixels % cellCount

  const result = new Array(cellCount).fill(base)

  // Distribute the remainder evenly across the cells
  for (let i = 0; i < remainder; i++) {
    const index = Math.floor(i * cellCount / remainder)
    result[index] += 1
  }

  return result
}
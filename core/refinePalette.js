import { nearestIndex } from "./mapToPalette.js"

// k-means refinement: seeded by a rough palette (e.g. medianCut), so the result is deterministic
export function refinePalette(grid, initial, maxIterations = 20) {
  const pixels = grid.flat()
  let palette = initial.map(colour => [...colour])

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const sums = palette.map(() => [0, 0, 0, 0])

    for (const px of pixels) {
      const sum = sums[nearestIndex(px, palette)]
      sum[0] += px[0]
      sum[1] += px[1]
      sum[2] += px[2]
      sum[3]++
    }

    // A colour no pixel is nearest to stays where it is
    const next = sums.map((sum, i) =>
      sum[3] === 0 ? palette[i] : sum.slice(0, 3).map(channel => Math.round(channel / sum[3]))
    )

    const converged = next.every((colour, i) => colour.every((channel, c) => channel === palette[i][c]))
    palette = next
    if (converged) break
  }

  return palette
}

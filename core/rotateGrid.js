// Turns a grid 90° so a design can be knitted sideways (e.g. text along a scarf).
// Works on any cell values: pixels [r, g, b] or palette indexes.
export function rotateGrid(grid, turn) {
  if (turn === 'none') return grid
  if (turn !== 'right' && turn !== 'left') {
    throw new Error("turn must be 'none', 'right' or 'left'")
  }

  const rows = grid.length
  const stitches = grid[0]?.length ?? 0

  return Array.from({ length: stitches }, (_, y) =>
    Array.from({ length: rows }, (_, x) =>
      turn === 'right' ? grid[rows - 1 - x][y] : grid[x][stitches - 1 - y]
    )
  )
}

// Gauge seen from a grid that is turned 90°: its rows run across the stitches
export function rotateGauge({ stitchesPerCm, rowsPerCm, stitchesPerInch, rowsPerInch }) {
  return { stitchesPerCm: rowsPerCm, rowsPerCm: stitchesPerCm, stitchesPerInch: rowsPerInch, rowsPerInch: stitchesPerInch }
}

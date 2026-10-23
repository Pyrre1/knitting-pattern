// Turns the display grid (top row first, right side view) into knitting order.
// Bottom up: RS rows read the chart right → left. Top down: the fabric hangs upside down,
// so RS rows read the chart left → right. WS rows (flat only) read the other way.
export function rowInstructions(grid, { start = 'bottom', method = 'flat' } = {}) {
  if (start !== 'bottom' && start !== 'top') {
    throw new Error("start must be 'bottom' or 'top'")
  }
  if (method !== 'flat' && method !== 'round') {
    throw new Error("method must be 'flat' or 'round'")
  }

  const rsDirection = start === 'bottom' ? 'rtl' : 'ltr'
  const wsDirection = start === 'bottom' ? 'ltr' : 'rtl'

  return grid.map((_, i) => {
    const displayRow = start === 'bottom' ? grid.length - 1 - i : i
    const side = method === 'round' || i % 2 === 0 ? 'RS' : 'WS'
    const direction = side === 'RS' ? rsDirection : wsDirection
    const row = grid[displayRow]
    const stitches = direction === 'rtl' ? [...row].reverse() : row

    return {
      kind: method === 'round' ? 'round' : 'row',
      number: i + 1,
      displayRow,
      side,
      direction,
      runs: toRuns(stitches)
    }
  })
}

// Rows/rounds 1 and 2 are spelled out; later ones keep only the number (and side when flat)
export function formatInstruction({ kind, number, side, direction, runs }, labels) {
  const arrow = direction === 'rtl' ? 'read chart right → left' : 'read chart left → right'
  const full = number <= 2
  const heading = kind === 'round'
    ? (full ? `Round ${number} (${arrow})` : `${number}`)
    : (full ? `Row ${number} (${side}, ${arrow})` : `${number} (${side})`)

  return `${heading}: ${runs.map(run => `${run.count} ${labels[run.index]}`).join(', ')}`
}

function toRuns(stitches) {
  const runs = []

  for (const index of stitches) {
    const last = runs[runs.length - 1]
    if (last && last.index === index) {
      last.count++
    } else {
      runs.push({ index, count: 1 })
    }
  }

  return runs
}

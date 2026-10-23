import { rowInstructions, formatInstruction } from '../rowInstructions.js'

// Display grid (top row first), as seen on the right side of the fabric
const grid = [
  [ 0, 0, 1 ],
  [ 1, 0, 0 ],
  [ 1, 1, 1 ]
]

describe('Row Instructions', () => {
  test('defaults to bottom up, back and forth', () => {
    const result = rowInstructions(grid)

    expect(result).toEqual([
      { kind: 'row', number: 1, displayRow: 2, side: 'RS', direction: 'rtl', runs: [ { index: 1, count: 3 } ] },
      { kind: 'row', number: 2, displayRow: 1, side: 'WS', direction: 'ltr', runs: [ { index: 1, count: 1 }, { index: 0, count: 2 } ] },
      { kind: 'row', number: 3, displayRow: 0, side: 'RS', direction: 'rtl', runs: [ { index: 1, count: 1 }, { index: 0, count: 2 } ] }
    ])
  })

  test('reads every round right to left when knitting in the round', () => {
    const result = rowInstructions(grid, { method: 'round' })

    expect(result.map(r => [r.kind, r.side, r.direction])).toEqual([
      [ 'round', 'RS', 'rtl' ],
      [ 'round', 'RS', 'rtl' ],
      [ 'round', 'RS', 'rtl' ]
    ])
    // Round 2 is display row [1, 0, 0] read right to left
    expect(result[1].runs).toEqual([ { index: 0, count: 2 }, { index: 1, count: 1 } ])
  })

  test('knitting top down starts at the top row and reads RS rows left to right', () => {
    // Fabric hangs upside down, so the knitter's right is the chart's left
    const result = rowInstructions(grid, { start: 'top' })

    expect(result.map(r => [r.number, r.displayRow, r.side, r.direction])).toEqual([
      [ 1, 0, 'RS', 'ltr' ],
      [ 2, 1, 'WS', 'rtl' ],
      [ 3, 2, 'RS', 'ltr' ]
    ])
    // Top display row [0, 0, 1] read left to right
    expect(result[0].runs).toEqual([ { index: 0, count: 2 }, { index: 1, count: 1 } ])
    // Display row [1, 0, 0] read right to left on the WS
    expect(result[1].runs).toEqual([ { index: 0, count: 2 }, { index: 1, count: 1 } ])
  })

  test('reads every round left to right when knitting top down in the round', () => {
    const result = rowInstructions(grid, { start: 'top', method: 'round' })

    expect(result.every(r => r.direction === 'ltr')).toBe(true)
  })

  test('throws on unknown options', () => {
    expect(() => rowInstructions(grid, { start: 'middle' })).toThrow("start must be 'bottom' or 'top'")
    expect(() => rowInstructions(grid, { method: 'crochet' })).toThrow("method must be 'flat' or 'round'")
  })
})

describe('Format Instruction', () => {
  const labels = [ 'A', 'B' ]

  test('formats a flat row with side and direction', () => {
    const instruction = { kind: 'row', number: 2, side: 'WS', direction: 'ltr', runs: [ { index: 1, count: 1 }, { index: 0, count: 2 } ] }

    expect(formatInstruction(instruction, labels)).toBe('Row 2 (WS, read chart left → right): 1 B, 2 A')
  })

  test('formats a round without side', () => {
    const instruction = { kind: 'round', number: 1, side: 'RS', direction: 'rtl', runs: [ { index: 0, count: 3 } ] }

    expect(formatInstruction(instruction, labels)).toBe('Round 1 (read chart right → left): 3 A')
  })

  test('shortens flat rows after row 2 to number and side', () => {
    const instruction = { kind: 'row', number: 3, side: 'RS', direction: 'rtl', runs: [ { index: 0, count: 3 } ] }

    expect(formatInstruction(instruction, labels)).toBe('3 (RS): 3 A')
  })

  test('shortens rounds after round 2 to number only', () => {
    const instruction = { kind: 'round', number: 3, side: 'RS', direction: 'rtl', runs: [ { index: 0, count: 3 } ] }

    expect(formatInstruction(instruction, labels)).toBe('3: 3 A')
  })
})

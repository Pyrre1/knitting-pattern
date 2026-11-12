import { planTiles } from '../printTiles.js'

describe('Print Tiles', () => {
  test('a chart that fits is one tile, A1', () => {
    const plan = planTiles({ stitches: 20, rows: 30, cellWidth: 5, cellHeight: 4, areaWidth: 190, areaHeight: 250 })
    expect(plan).toEqual({ across: 1, down: 1, tiles: [{ name: 'A1', x: 0, y: 0, stitches: 20, rows: 30 }] })
  })

  test('splits across and down, rows named A, B from the top, columns 1, 2 from the left', () => {
    // 10 stitches per tile across, 10 rows per tile down
    const plan = planTiles({ stitches: 20, rows: 15, cellWidth: 10, cellHeight: 10, areaWidth: 100, areaHeight: 100 })
    expect(plan.across).toBe(2)
    expect(plan.down).toBe(2)
    expect(plan.tiles.map(t => t.name)).toEqual(['A1', 'A2', 'B1', 'B2'])
    expect(plan.tiles[3]).toMatchObject({ x: 10, y: 8 })
  })

  test('tiles are as even as possible and cover the chart exactly', () => {
    // At most 60 per tile: 100 stitches → 50 + 50, not 60 + 40
    const plan = planTiles({ stitches: 100, rows: 1, cellWidth: 1, cellHeight: 1, areaWidth: 60, areaHeight: 60 })
    expect(plan.tiles.map(t => t.stitches)).toEqual([50, 50])
  })

  test('never cuts a cell: partial cells do not fit', () => {
    const plan = planTiles({ stitches: 10, rows: 1, cellWidth: 3, cellHeight: 1, areaWidth: 14.9, areaHeight: 10 })
    expect(Math.max(...plan.tiles.map(t => t.stitches)) * 3).toBeLessThanOrEqual(14.9)
  })

  test('a cell larger than the area still gets one cell per tile', () => {
    const plan = planTiles({ stitches: 2, rows: 1, cellWidth: 50, cellHeight: 50, areaWidth: 40, areaHeight: 40 })
    expect(plan.across).toBe(2)
  })

  test('a narrower first column leaves room beside A1; the rest stay even', () => {
    const plan = planTiles({ stitches: 130, rows: 1, cellWidth: 1, cellHeight: 1, areaWidth: 60, areaHeight: 60, firstAreaWidth: 40 })
    expect(plan.tiles.map(t => t.stitches)).toEqual([40, 45, 45])
  })

  test('the first column is only narrowed as much as needed', () => {
    // Even split 50 + 50 already fits under 55
    const plan = planTiles({ stitches: 100, rows: 1, cellWidth: 1, cellHeight: 1, areaWidth: 60, areaHeight: 60, firstAreaWidth: 55 })
    expect(plan.tiles.map(t => t.stitches)).toEqual([50, 50])
  })

  test('more than 26 tile rows continue with AA', () => {
    const plan = planTiles({ stitches: 1, rows: 27, cellWidth: 1, cellHeight: 1, areaWidth: 1, areaHeight: 1 })
    expect(plan.tiles.at(-1).name).toBe('AA1')
  })
})

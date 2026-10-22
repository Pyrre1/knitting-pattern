import { pairYarns } from '../pairYarns.js'

const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]
const RED = [255, 0, 0]
const BLUE = [0, 0, 255]
const YELLOW = [255, 255, 0]

describe('Pair Yarns', () => {
  test('uses the source colour as yarn when no yarns are given', () => {
    expect(pairYarns([ RED, WHITE ])).toEqual([
      { source: RED, yarn: RED },
      { source: WHITE, yarn: WHITE }
    ])
    expect(pairYarns([ RED ], [])).toEqual([
      { source: RED, yarn: RED }
    ])
  })

  test('pairs matching colours regardless of yarn order', () => {
    expect(pairYarns([ RED, WHITE ], [ WHITE, RED ])).toEqual([
      { source: RED, yarn: RED },
      { source: WHITE, yarn: WHITE }
    ])
  })

  test('pairs a red/white logo with blue/yellow yarn as red→blue, white→yellow', () => {
    expect(pairYarns([ RED, WHITE ], [ YELLOW, BLUE ])).toEqual([
      { source: RED, yarn: BLUE },
      { source: WHITE, yarn: YELLOW }
    ])
  })

  test('minimises total distance rather than picking greedily per source', () => {
    // Greedy would give A the nearest yarn (111) and leave B with 0
    const A = [100, 0, 0]
    const B = [110, 0, 0]

    expect(pairYarns([ A, B ], [ [111, 0, 0], [0, 0, 0] ])).toEqual([
      { source: A, yarn: [0, 0, 0] },
      { source: B, yarn: [111, 0, 0] }
    ])
  })

  test('picks the best subset when there are more yarns than sources', () => {
    expect(pairYarns([ BLACK ], [ WHITE, [20, 20, 20] ])).toEqual([
      { source: BLACK, yarn: [20, 20, 20] }
    ])
  })

  test('throws when there are fewer yarns than sources', () => {
    expect(() => pairYarns([ RED, WHITE ], [ BLUE ]))
      .toThrow('need at least as many yarns as source colours')
  })
})

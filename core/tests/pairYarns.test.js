import { pairYarns } from '../pairYarns.js'
import { colourDistance } from '../colourDistance.js'

function bruteForce(sources, yarns, used = new Set(), i = 0) {
  if (i === sources.length) return 0
  let best = Infinity
  for (let y = 0; y < yarns.length; y++) {
    if (used.has(y)) continue
    used.add(y)
    best = Math.min(best, colourDistance(sources[i], yarns[y]) + bruteForce(sources, yarns, used, i + 1))
    used.delete(y)
  }
  return best
}

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

  test('pairs 20 shuffled yarns back to their own colours quickly', () => {
    const sources = Array.from({ length: 20 }, (_, i) => [i * 12, 255 - i * 12, (i * 37) % 256])
    const yarns = [...sources].reverse()

    const start = Date.now()
    const palette = pairYarns(sources, yarns)

    expect(Date.now() - start).toBeLessThan(100)
    expect(palette.map(e => e.yarn)).toEqual(sources)
  })

  test('matches brute force on random 6-colour sets', () => {
    let seed = 1
    const random = () => (seed = (seed * 16807) % 2147483647) % 256
    const colour = () => [random(), random(), random()]
    const total = palette => palette.reduce((sum, e) => sum + colourDistance(e.source, e.yarn), 0)

    for (let round = 0; round < 20; round++) {
      const sources = Array.from({ length: 5 }, colour)
      const yarns = Array.from({ length: 6 }, colour)
      expect(total(pairYarns(sources, yarns))).toBe(bruteForce(sources, yarns))
    }
  })

  test('throws when there are fewer yarns than sources', () => {
    expect(() => pairYarns([ RED, WHITE ], [ BLUE ]))
      .toThrow('need at least as many yarns as source colours')
  })
})

import { colourDistance } from "./colourDistance.js"

export function pairYarns(sources, yarns = []) {
  if (yarns.length === 0) {
    return sources.map((source) => ({ source, yarn: source }))
  }
  if (yarns.length < sources.length) {
    throw new Error("need at least as many yarns as source colours")
  }

  const cost = sources.map((source) => yarns.map((yarn) => colourDistance(source, yarn)))
  const assignment = minCostAssignment(cost)

  return sources.map((source, i) => ({ source, yarn: yarns[assignment[i]] }))
}

// Hungarian algorithm (potentials), O(n² m) for n rows ≤ m columns.
// Returns the column assigned to each row with minimum total cost.
function minCostAssignment(cost) {
  const n = cost.length
  const m = cost[0].length
  // 1-based; row 0 / column 0 are the virtual start
  const u = new Array(n + 1).fill(0)
  const v = new Array(m + 1).fill(0)
  const rowOf = new Array(m + 1).fill(0)
  const way = new Array(m + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    rowOf[0] = i
    let j0 = 0
    const minv = new Array(m + 1).fill(Infinity)
    const used = new Array(m + 1).fill(false)

    do {
      used[j0] = true
      const i0 = rowOf[j0]
      let delta = Infinity
      let j1 = 0

      for (let j = 1; j <= m; j++) {
        if (used[j]) continue
        const reduced = cost[i0 - 1][j - 1] - u[i0] - v[j]
        if (reduced < minv[j]) {
          minv[j] = reduced
          way[j] = j0
        }
        if (minv[j] < delta) {
          delta = minv[j]
          j1 = j
        }
      }

      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[rowOf[j]] += delta
          v[j] -= delta
        } else {
          minv[j] -= delta
        }
      }
      j0 = j1
    } while (rowOf[j0] !== 0)

    do {
      const j1 = way[j0]
      rowOf[j0] = rowOf[j1]
      j0 = j1
    } while (j0 !== 0)
  }

  const assignment = new Array(n)
  for (let j = 1; j <= m; j++) {
    if (rowOf[j] !== 0) assignment[rowOf[j] - 1] = j - 1
  }
  return assignment
}

import { colourDistance } from "./colourDistance.js"

export function pairYarns(sources, yarns = []) {
  if (yarns.length === 0) {
    return sources.map(source => ({ source, yarn: source }))
  }
  if (yarns.length < sources.length) {
    throw new Error('need at least as many yarns as source colours')
  }

  // Try every assignment of distinct yarns to sources; few yarns, so brute force is fine
  let bestAssignment = null
  let bestCost = Infinity

  const assign = (sourceIndex, used, assignment, cost) => {
    if (cost >= bestCost) return

    if (sourceIndex === sources.length) {
      bestAssignment = [...assignment]
      bestCost = cost
      return
    }

    for (let y = 0; y < yarns.length; y++) {
      if (used.has(y)) continue

      used.add(y)
      assignment.push(y)
      assign(sourceIndex + 1, used, assignment, cost + colourDistance(sources[sourceIndex], yarns[y]))
      assignment.pop()
      used.delete(y)
    }
  }

  assign(0, new Set(), [], 0)

  return sources.map((source, i) => ({ source, yarn: yarns[bestAssignment[i]] }))
}

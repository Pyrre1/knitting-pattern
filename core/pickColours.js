import { medianCut } from "./medianCut.js"
import { refinePalette } from "./refinePalette.js"
import { mapToPalette } from "./mapToPalette.js"
import { yarnAdvice } from "./yarnAdvice.js"

// Trial colours per yarn. Measured on samples/: 1.5 misses small colours, 3 splits edges into
// so many blends that too few are flagged
export const OVERPICK = 2
export const MAX_TRIAL_COLOURS = 20

// Image colours for `yarnCount` yarns, picked from all pixels
export function basicColours(pixels, yarnCount) {
  return refinePalette(pixels, medianCut(pixels, yarnCount))
}

// Like basicColours, but soft edges do not take yarns from small distinct colours (e.g. thin text):
// picks too many colours, then drops the ones yarnAdvice flags on the scaled grid.
// Too few flagged (e.g. photos) → same as basicColours.
export function pickColours(pixels, scaled, yarnCount) {
  const trial = basicColours(pixels, Math.max(yarnCount, Math.min(MAX_TRIAL_COLOURS, yarnCount * OVERPICK)))
  const surplus = trial.length - yarnCount
  if (surplus <= 0) return basicColours(pixels, yarnCount)

  const { order } = yarnAdvice({
    palette: trial.map(source => ({ source })),
    grid: mapToPalette(scaled, trial)
  })
  if (order.length < surplus) return basicColours(pixels, yarnCount)

  const dropped = new Set(order.slice(0, surplus))
  return refinePalette(pixels, trial.filter((_, i) => !dropped.has(i)))
}

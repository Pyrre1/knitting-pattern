import { basicColours } from "./pickColours.js"
import { mapToPalette } from "./mapToPalette.js"
import { yarnAdvice } from "./yarnAdvice.js"

// Trial colours to look for distinct ones among. Measured on samples/: with 10 or more,
// soft edges start to count as colours and the suggestion goes up and down
export const TRIAL_COLOURS = 8

// Slow (all pixels), but the same for every size and yarn count: compute once per image
export function trialColours(pixels) {
  return basicColours(pixels, TRIAL_COLOURS)
}

// How many distinct colours the image has on the scaled grid, or null when there is no clear
// answer (e.g. photos: every trial colour is distinct, so more would be too)
export function bestYarnCount(trial, scaled) {
  const { suggested, extra } = yarnAdvice({
    palette: trial.map(source => ({ source })),
    grid: mapToPalette(scaled, trial)
  })
  return trial.length === TRIAL_COLOURS && extra.length === 0 ? null : suggested
}

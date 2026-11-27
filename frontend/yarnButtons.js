import { yarnAdvice } from "../core/yarnAdvice.js"
import { bestYarnCount, trialColours, TRIAL_COLOURS } from "../core/bestYarnCount.js"
import { translate } from "./i18n.js"

// Advice only from this many yarns: 2 yarns cannot go lower
const ADVICE_FROM = 3
const MIN_YARNS = 2

const byId = (id) => document.getElementById(id)

// Image patterns: − yarn / + yarn / Auto improve (best yarn count, up or down) under the palette,
// and Undo, shown once there is a change to undo.
// changeCount(count, { fineTune }) recalculates with that count; false when the user cancelled.
// saveColours() → colour choices to go back to, restoreColours(saved) → goes back (false = cancelled).
export function initYarnButtons({ yarnCount, changeCount, saveColours, restoreColours }) {
  // Colour choices before each button change, newest last; a manual count change clears it
  let history = []
  // { best } yarn count for Auto improve (null = none found), or null when not an image pattern
  let state = null

  // Per image: trial colours are slow to find
  const trials = new WeakMap()

  async function step(count, options) {
    history.push(saveColours())
    if (!(await changeCount(count, options))) history.pop()
  }

  byId("yarn-less").addEventListener("click", () => step(yarnCount.read() - 1))
  byId("yarn-more").addEventListener("click", async () => {
    const count = yarnCount.read() + 1
    if (await yarnCount.allow(count)) await step(count)
  })
  byId("yarn-auto").addEventListener("click", async () => {
    const { best } = state
    if (best < yarnCount.read()) return step(best)
    // Without fine-tuning a soft edge can take the added yarn, and the next click would remove it again
    if (await yarnCount.allow(best)) await step(best, { fineTune: true })
  })
  byId("yarn-undo").addEventListener("click", async () => {
    const saved = history.pop()
    if (!(await restoreColours(saved))) history.push(saved)
  })

  // Detection only: the pattern stays as calculated until a button is used
  // image = its full pixels, or null for text
  function update(pattern, image) {
    if (!pattern || !image) {
      state = null
      return
    }
    state = { best: fewerYarns(pattern) ?? moreYarns(pattern, image) }
  }

  function fewerYarns(pattern) {
    const count = pattern.palette.length
    if (count < ADVICE_FROM) return null
    const { suggested } = yarnAdvice(pattern)
    return suggested < count ? suggested : null
  }

  function moreYarns(pattern, image) {
    const count = yarnCount.read()
    if (count >= TRIAL_COLOURS) return null
    if (!trials.has(image)) trials.set(image, trialColours(image))
    const best = bestYarnCount(trials.get(image), pattern.pixels)
    return best !== null && best > count ? best : null
  }

  function clear() {
    history = []
  }

  function render() {
    byId("yarn-buttons").hidden = !state
    if (!state) return

    const count = yarnCount.read()
    byId("yarn-less").disabled = count <= MIN_YARNS
    byId("yarn-more").disabled = count >= yarnCount.max
    byId("yarn-undo").hidden = history.length === 0

    const auto = byId("yarn-auto")
    auto.disabled = state.best === null
    auto.title =
      state.best === null
        ? translate("yarnAutoNone")
        : translate(state.best < count ? "yarnAutoFewer" : "yarnAutoMore", { best: state.best })
  }

  return { update, clear, render }
}

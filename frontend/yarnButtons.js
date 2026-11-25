import { yarnAdvice } from '../core/yarnAdvice.js'
import { translate } from './i18n.js'

// Advice only from this many yarns: 2 yarns cannot go lower
const ADVICE_FROM = 3
const MIN_YARNS = 2

const byId = id => document.getElementById(id)

// Image patterns: − yarn / + yarn / Auto improve (best yarn count by yarnAdvice) under the palette,
// and Undo, shown once there is a change to undo.
// changeCount(count) recalculates with that count; false when the user cancelled.
// saveColours() → colour choices to go back to, restoreColours(saved) → goes back (false = cancelled).
export function initYarnButtons({ yarnCount, changeCount, saveColours, restoreColours }) {
  // Colour choices before each button change, newest last; a manual count change clears it
  let history = []
  // { count, suggested } for the shown pattern, or null when not an image pattern
  let state = null

  async function step(count) {
    history.push(saveColours())
    if (!await changeCount(count)) history.pop()
  }

  byId('yarn-less').addEventListener('click', () => step(yarnCount.read() - 1))
  byId('yarn-more').addEventListener('click', async () => {
    const count = yarnCount.read() + 1
    if (await yarnCount.allow(count)) await step(count)
  })
  byId('yarn-auto').addEventListener('click', () => step(state.suggested))
  byId('yarn-undo').addEventListener('click', async () => {
    const saved = history.pop()
    if (!await restoreColours(saved)) history.push(saved)
  })

  // Detection only: the pattern stays as calculated until a button is used
  function update(pattern, isImage) {
    if (!pattern || !isImage) {
      state = null
      return
    }
    const count = pattern.palette.length
    state = { count, suggested: count >= ADVICE_FROM ? yarnAdvice(pattern).suggested : count }
  }

  function clear() {
    history = []
  }

  function render() {
    byId('yarn-buttons').hidden = !state
    if (!state) return

    const count = yarnCount.read()
    byId('yarn-less').disabled = count <= MIN_YARNS
    byId('yarn-more').disabled = count >= yarnCount.max
    byId('yarn-undo').hidden = history.length === 0

    const auto = byId('yarn-auto')
    const canImprove = state.suggested < state.count
    auto.disabled = !canImprove
    auto.title = canImprove ? translate('yarnAutoTitle', { best: state.suggested }) : translate('yarnAutoNone')
  }

  return { update, clear, render }
}

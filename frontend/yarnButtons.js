import { yarnAdvice } from '../core/yarnAdvice.js'
import { translate } from './i18n.js'

// Advice only from this many yarns: 2 yarns cannot go lower
const ADVICE_FROM = 3
const MIN_YARNS = 2

const byId = id => document.getElementById(id)

// Image patterns: − yarn / + yarn / undo under the palette, and "Use N yarns" when fewer seem enough.
// changeCount(count) recalculates with that count; false when the user cancelled.
export function initYarnButtons({ yarnCount, changeCount }) {
  // Yarn counts before each button change, newest last; a manual count change clears it
  let history = []
  // { count, suggested } for the shown pattern, or null when not an image pattern
  let state = null

  async function step(count) {
    history.push(yarnCount.read())
    if (!await changeCount(count)) history.pop()
  }

  byId('yarn-less').addEventListener('click', () => step(yarnCount.read() - 1))
  byId('yarn-more').addEventListener('click', async () => {
    const count = yarnCount.read() + 1
    if (await yarnCount.allow(count)) await step(count)
  })
  byId('yarn-best').addEventListener('click', () => step(state.suggested))
  byId('yarn-undo').addEventListener('click', async () => {
    const count = history.pop()
    if (!await changeCount(count)) history.push(count)
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
    byId('yarn-advice').hidden = !state || state.suggested >= state.count
    if (!state) return

    const count = yarnCount.read()
    byId('yarn-less').disabled = count <= MIN_YARNS
    byId('yarn-more').disabled = count >= yarnCount.max
    byId('yarn-undo').disabled = history.length === 0

    const { suggested } = state
    byId('yarn-advice-text').textContent = translate('yarnAdvice', {
      count: state.count, extra: state.count - suggested, best: suggested
    })
    byId('yarn-best').textContent = translate('yarnAdviceBest', { best: suggested })
  }

  return { update, clear, render }
}

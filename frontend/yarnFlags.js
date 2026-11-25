import { yarnAdvice } from '../core/yarnAdvice.js'
import { removeColours } from '../core/patternEdits.js'
import { translate } from './i18n.js'
import { rgbToHex } from './chart.js'

const MIN_YARNS = 2

const byId = id => document.getElementById(id)

// Advanced, image patterns: the yarns yarnAdvice flags, each with a tick box; unticked = left out
// (removeColours: its stitches go to the nearest yarn left). Left-out yarns are remembered by source
// colour, so a change that keeps the colours (size, gauge) keeps them out; reset on a new colour set.
// onToggle(apply) asks about painted stitches, then calls apply() and recalculates.
export function initYarnFlags({ onToggle }) {
  let base = null
  let flags = []
  let leftOut = new Set()

  // Pattern as calculated → pattern shown (flagged yarns left out)
  function apply(pattern, isImage) {
    base = isImage ? pattern : null
    flags = base && base.palette.length > MIN_YARNS ? yarnAdvice(base).flags : []
    const flagged = new Set(flags.map(flag => key(flag.index)))
    leftOut = new Set([...leftOut].filter(colour => flagged.has(colour)))
    if (!base) return pattern
    const indexes = base.palette.flatMap((_, i) => leftOut.has(key(i)) ? [i] : [])
    return removeColours(base, indexes)
  }

  function reset() {
    leftOut = new Set()
  }

  function key(index) {
    return rgbToHex(base.palette[index].source)
  }

  function load(saved) {
    leftOut = new Set(saved)
  }

  function render() {
    byId('yarn-flags').hidden = flags.length === 0
    if (flags.length === 0) return

    const counts = base.palette.map(() => 0)
    base.grid.flat().forEach(index => counts[index]++)
    const kept = base.palette.length - leftOut.size

    byId('yarn-flags-list').replaceChildren(...flags.map(flag => {
      const colour = key(flag.index)
      const out = leftOut.has(colour)
      const box = document.createElement('input')
      box.type = 'checkbox'
      box.checked = !out
      box.disabled = !out && kept <= MIN_YARNS
      box.addEventListener('change', () => onToggle(() => {
        if (out) leftOut.delete(colour)
        else leftOut.add(colour)
      }))

      const label = document.createElement('label')
      label.append(box, swatch(flag.index), ...reason(flag), ` ${translate('stitchCount', { n: counts[flag.index] })}`)
      const li = document.createElement('li')
      li.append(label)
      return li
    }))
  }

  function reason(flag) {
    if (flag.reason === 'empty') return [` ${translate('flagEmpty')}`]
    if (flag.reason === 'near') return [` ${translate('flagNear')} `, swatch(flag.with[0])]
    return [` ${translate('flagBlend')} `, swatch(flag.with[0]), ` ${translate('flagAnd')} `, swatch(flag.with[1])]
  }

  function swatch(index) {
    const span = document.createElement('span')
    span.className = 'swatch'
    span.style.background = rgbToHex(base.palette[index].yarn)
    return span
  }

  return { apply, reset, save: () => [...leftOut], load, render }
}

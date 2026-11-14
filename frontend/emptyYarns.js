import { dropEmptyColours } from '../core/patternEdits.js'
import { translate } from './i18n.js'

const byId = id => document.getElementById(id)

// Yarns that got no stitches are dropped, with a notice; "Keep X anyway" keeps them for painting by hand.
// Keeping lasts until reset (new image or another yarn count).
export function initEmptyYarns({ onToggle }) {
  let keep = false
  // { chosen, used } when the last pattern had empty yarns, else null
  let notice = null

  byId('empty-yarns-toggle').addEventListener('click', () => onToggle(() => { keep = !keep }))

  function apply(pattern) {
    const { pattern: dropped, dropped: empty } = dropEmptyColours(pattern)
    notice = empty.length > 0 ? { chosen: pattern.palette.length, used: dropped.palette.length } : null
    return keep ? pattern : dropped
  }

  function reset() {
    keep = false
    notice = null
  }

  function render() {
    byId('empty-yarns').hidden = !notice
    if (!notice) return
    const { chosen, used } = notice
    byId('empty-yarns-text').textContent = translate(keep ? 'emptyYarnsKept' : 'emptyYarnsDropped', { chosen, used, empty: chosen - used })
    byId('empty-yarns-toggle').textContent = translate(keep ? 'emptyYarnsDrop' : 'emptyYarnsKeep', { chosen, used })
  }

  return { apply, reset, render }
}

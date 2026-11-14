// Number of yarns: first select 2–4 or "More…", second select 5–8 or "Max…" (unlocks 9–20).
// Warnings are asked once per visit; nothing is stored.
const FIRST_MAX = 4
const MORE_MAX = 8
const MAX_YARNS = 20

const byId = id => document.getElementById(id)

export function initYarnCount({ ask }) {
  const first = byId('yarn-count')
  const more = byId('yarn-count-more')
  let warned = false
  let unlocked = false
  let previous = { first: first.value, more: more.value }

  function read() {
    return Number(first.value === 'more' ? more.value : first.value)
  }

  // Shows the second select when "More…" is chosen and remembers the values for a cancel
  function sync() {
    more.hidden = first.value !== 'more'
    previous = { first: first.value, more: more.value }
  }

  function set(count) {
    if (count > MORE_MAX) unlock()
    first.value = count > FIRST_MAX ? 'more' : String(count)
    if (count > FIRST_MAX) more.value = String(count)
    sync()
  }

  function setDisabled(disabled) {
    first.disabled = disabled
    more.disabled = disabled
  }

  function unlock() {
    if (unlocked) return
    unlocked = true
    more.querySelector('[value="max"]').remove()
    for (let n = MORE_MAX + 1; n <= MAX_YARNS; n++) more.add(new Option(String(n), String(n)))
  }

  // Asks before many yarns; false (form put back) when cancelled
  async function confirm(target) {
    if (target === first && first.value === 'more' && !warned) {
      if (!await ask(['yarnMoreWarn'], 'yarnMoreTitle')) return revert()
      warned = true
    }
    if (target === more && more.value === 'max') {
      if (!await ask(['yarnMaxWarn'], 'yarnMaxTitle')) return revert()
      if (!await ask(['yarnMaxSure', 'yarnMaxHint'], 'yarnMaxTitle')) return revert()
      unlock()
      more.value = String(MORE_MAX + 1)
    }
    sync()
    return true
  }

  // Same warnings as the selects, for a count set by a button; false when cancelled
  async function allow(count) {
    if (count > FIRST_MAX && !warned) {
      if (!await ask(['yarnMoreWarn'], 'yarnMoreTitle')) return false
      warned = true
    }
    if (count > MORE_MAX && !unlocked) {
      if (!await ask(['yarnMaxWarn'], 'yarnMaxTitle')) return false
      if (!await ask(['yarnMaxSure', 'yarnMaxHint'], 'yarnMaxTitle')) return false
      unlock()
    }
    return true
  }

  function revert() {
    first.value = previous.first
    more.value = previous.more
    sync()
    return false
  }

  sync()
  return { read, set, sync, setDisabled, confirm, allow, max: MAX_YARNS }
}

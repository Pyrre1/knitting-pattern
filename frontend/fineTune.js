const byId = id => document.getElementById(id)

// Advanced settings, image patterns: tick box that recalculates with fine-tuned colours (createPattern `fineTune`).
// onToggle(apply) asks about painted stitches, then calls apply() and recalculates.
export function initFineTune({ onToggle }) {
  let on = false
  // Colours without fine-tuning, to tell when it makes no difference; null = not known
  let plainColours = null
  let unchanged = false

  byId('fine-tune').addEventListener('change', () => onToggle(() => { on = !on }))

  function update(pattern) {
    const colours = pattern.palette.map(entry => entry.source.join()).sort().join(' ')
    if (!on) plainColours = colours
    unchanged = on && colours === plainColours
  }

  function reset() {
    load({ on: false })
  }

  // Other image or yarn count with fine-tuning on: the known plain colours no longer apply
  function load(saved) {
    on = saved.on
    plainColours = null
    unchanged = false
  }

  function render() {
    byId('fine-tune').checked = on
    byId('fine-tune-unchanged').hidden = !unchanged
  }

  return { isOn: () => on, save: () => ({ on }), load, update, reset, render }
}

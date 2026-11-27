import { translate } from "./i18n.js"

const byId = (id) => document.getElementById(id)

// "Advanced settings" button (in #yarn-buttons) that opens and hides the box with clean-up tools.
// Image patterns only; hiding the box keeps its settings.
export function initAdvanced() {
  let available = false
  let open = false

  byId("advanced-toggle").addEventListener("click", () => {
    open = !open
    render()
  })

  function update(isImage) {
    available = isImage
  }

  function render() {
    byId("advanced").hidden = !available || !open
    byId("advanced-toggle").setAttribute("aria-expanded", String(open))
    byId("advanced-toggle").textContent = translate(open ? "advancedHide" : "advancedTitle")
  }

  return { update, render }
}

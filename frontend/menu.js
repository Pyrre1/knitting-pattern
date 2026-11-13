// Menu row: shows one view (#pattern, #about, #changes) and hides the others.
// Views stay in the page, so switching keeps the current pattern. Back/forward follow the hash.
const VIEWS = ['pattern', 'about', 'changes']

export function initMenu() {
  window.addEventListener('hashchange', () => {
    showView()
    window.scrollTo(0, 0)
  })
  showView()
}

export function currentView() {
  const name = location.hash.slice(1)
  return VIEWS.includes(name) ? name : 'pattern'
}

function showView() {
  const current = currentView()
  for (const name of VIEWS) document.getElementById(`view-${name}`).hidden = name !== current
  for (const link of document.querySelectorAll('#menu a')) {
    if (link.dataset.view === current) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  }
}

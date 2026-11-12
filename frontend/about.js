import { FEEDBACK_EMAIL, FUTURE_URL } from './config.js'

const SEEN_KEY = 'aboutSeen'

// Prototype notice: shown on the first visit, reopened from the footer
export function initAbout() {
  const dialog = document.getElementById('about')
  fillLink('about-email', FEEDBACK_EMAIL && `mailto:${FEEDBACK_EMAIL}?subject=Knitting%20pattern%20feedback`, FEEDBACK_EMAIL)
  fillLink('about-future', FUTURE_URL, FUTURE_URL)

  document.getElementById('about-open').addEventListener('click', () => dialog.showModal())
  dialog.addEventListener('close', () => {
    try { localStorage.setItem(SEEN_KEY, '1') } catch { }
  })

  let seen = false
  try { seen = localStorage.getItem(SEEN_KEY) === '1' } catch { }
  if (!seen) dialog.showModal()
}

// Hides the link's paragraph when there is no address
function fillLink(id, href, text) {
  const link = document.getElementById(id)
  link.closest('p').hidden = !href
  if (!href) return
  link.href = href
  link.textContent = text
}

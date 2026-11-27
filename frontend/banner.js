import { FEEDBACK_EMAIL } from "./config.js"
import { LAST_UPDATE } from "./version.js"

// Permanent prototype banner above the settings: feedback address and last update date
export function initBanner() {
  // Banner and About page share the feedback address
  document.getElementById("banner-mail").hidden = !FEEDBACK_EMAIL
  document.getElementById("about-page-mail").hidden = !FEEDBACK_EMAIL
  for (const link of document.querySelectorAll(".feedback-email")) {
    link.href = `mailto:${FEEDBACK_EMAIL}?subject=Knitting%20pattern%20feedback`
    link.textContent = FEEDBACK_EMAIL
  }

  document.getElementById("banner-update").hidden = !LAST_UPDATE
  if (LAST_UPDATE) {
    const date = document.getElementById("banner-date")
    date.dateTime = LAST_UPDATE
    date.textContent = LAST_UPDATE
  }
}

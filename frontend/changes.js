import { getLanguage, translate } from './i18n.js'
import { LAST_UPDATE } from './version.js'

// Dates the site was published (deployed), newest first. Add one at each deploy.
// The live build date (version.js) counts too, so a missing newest date still shows.
const PUBLISHED = ['2026-11-22', '2026-11-12', '2026-11-09']

// Hand-written changelog, newest first. Each entry needs en and sv; kinds: add, fix, remove.
const CHANGES = [
  {
    date: '2026-11-25',
    en: {
      add: [
        '"Auto improve" beside the yarn buttons goes straight to the best number of yarns; "Undo yarn change" goes back. It replaces the tip box.',
        '"Advanced settings" opens a box with the clean-up tools, so the page is less crowded.',
        'Advanced: "Fine-tune colours", so small colours such as thin text keep their yarn instead of a soft edge colour.'
      ],
      fix: ['Leaving out a yarn in the list showed an error instead of changing the pattern.']
    },
    sv: {
      add: [
        '”Förbättra automatiskt” bredvid garnknapparna går direkt till bästa antalet garner; ”Ångra garnändring” går tillbaka. Ersätter tipsrutan.',
        '”Avancerade inställningar” öppnar en ruta med verktygen, så att sidan blir mindre rörig.',
        'Avancerat: ”Finjustera färger”, så att små färger, t.ex. tunn text, behåller sitt garn i stället för en mjuk kantfärg.'
      ],
      fix: ['Att ta bort ett garn i listan visade ett fel i stället för att ändra mönstret.']
    }
  },
  {
    date: '2026-11-14',
    en: {
      add: [
        'Up to 20 yarns: choose "More…" for 5 to 8, or "Max" for up to 20.',
        'Buttons under the yarns: − yarn, + yarn and undo.',
        'Tip when an image needs fewer yarns than chosen (unused yarns, near-identical ones, soft edges): "Use N yarns" jumps to the best fit.',
        'Changes page shows when each update was published.',
        'Advanced: a list of the yarns the tip found (unused, near-identical, soft edges); untick one to leave it out, tick to bring it back.'
      ],
      fix: [
        'Painting help now says keys 1–9 and A–T pick a yarn (it said 1–4 and A–D).'
      ]
    },
    sv: {
      add: [
        'Upp till 20 garner: välj ”Fler…” för 5 till 8, eller ”Max” för upp till 20.',
        'Knappar under garnerna: − garn, + garn och ångra.',
        'Tips när en bild behöver färre garner än valt (oanvända, nästan likadana, mjuka kanter): ”Använd N garner” går direkt till bästa antalet.',
        'Sidan Ändringar visar när varje uppdatering publicerades.',
        'Avancerat: en lista över garnerna som tipset hittade (oanvända, nästan likadana, mjuka kanter); bocka ur för att ta bort, bocka i för att ta tillbaka.'
      ],
      fix: [
        'Hjälptexten för målning säger nu att tangenterna 1–9 och A–T väljer garn (det stod 1–4 och A–D).'
      ]
    }
  },
  {
    date: '2026-11-13',
    en: {
      add: [
        'Menu with About and Changes pages.',
        'Icon in the browser tab.',
        'Error page (404) for addresses that do not exist.',
        'Info button explaining stitch view.',
        'Note that images are processed on your device and never uploaded; the file name shows beside the image button.',
        'Default swatch is now 22 stitches × 28 rows.'
      ],
      fix: [
        'Sharper chart in print.',
        'Print in scale: the page map on page 1 shows portrait pages as portrait.'
      ]
    },
    sv: {
      add: [
        'Meny med sidorna Om och Ändringar.',
        'Ikon i webbläsarfliken.',
        'Felsida (404) för adresser som inte finns.',
        'Infoknapp som förklarar maskvyn.',
        'Information om att bilder behandlas på din enhet och aldrig laddas upp; filnamnet visas bredvid bildknappen.',
        'Provlappen är nu 22 maskor × 28 varv från början.'
      ],
      fix: [
        'Skarpare diagram vid utskrift.',
        'Utskrift i skala: sidkartan på sida 1 visar stående sidor som stående.'
      ]
    }
  },
  {
    date: '2026-11-12',
    en: {
      add: [
        'First test version online.',
        'Print in scale: the chart in real knitted size, split over several pages to tape together.',
        'Upside-down option for a turned-up brim or folded-down cuff.',
        'Prototype banner with feedback address.'
      ]
    },
    sv: {
      add: [
        'Första testversionen på nätet.',
        'Utskrift i skala: diagrammet i verklig stickad storlek, uppdelat på flera sidor att tejpa ihop.',
        'Upp och ner, för en uppvikt mudd eller nedvikt kant.',
        'Prototypbanner med adress för synpunkter.'
      ]
    }
  },
  {
    date: '2026-10-29',
    en: {
      add: [
        'First prototype: chart from an image, logo or text, sized to your gauge.',
        'Colours reduced to 2-4 yarns, optionally matched to your own yarn colours.',
        'Paint single stitches, undo, stitch view, row help.',
        'Row-by-row instructions, flat or in the round, bottom up or top down; sideways knitting.',
        'Print, PDF and PNG; English and Swedish.'
      ]
    },
    sv: {
      add: [
        'Första prototypen: diagram från bild, logga eller text, anpassat efter din stickfasthet.',
        'Färgerna minskas till 2-4 garner, kan matchas mot dina egna garnfärger.',
        'Måla enskilda maskor, ångra, maskvy, varvhjälp.',
        'Instruktioner varv för varv, fram och tillbaka eller runt, nerifrån eller uppifrån; sidledes stickning.',
        'Utskrift, PDF och PNG; engelska och svenska.'
      ]
    }
  }
]

const KINDS = { add: 'changeAdd', fix: 'changeFix', remove: 'changeRemove' }

export function initChanges() {
  renderChanges()
  document.addEventListener('languageswitch', renderChanges)
}

function renderChanges() {
  const groups = groupByRelease(CHANGES, releases())
  const nodes = groups.flatMap(({ release, changes }) => [
    releaseHeading(release),
    ...changes.map(renderChange)
  ])
  document.getElementById('changes-list').replaceChildren(...nodes)
}

// Newest first; the live build date is the newest release when it is not listed yet
function releases() {
  return LAST_UPDATE > PUBLISHED[0] ? [LAST_UPDATE, ...PUBLISHED] : PUBLISHED
}

// Each change belongs to the first release on or after its date; later ones are unpublished (release null)
function groupByRelease(changes, dates) {
  const groups = []
  for (const change of changes) {
    const release = dates.filter(date => date >= change.date).at(-1) ?? null
    if (groups.at(-1)?.release !== release) groups.push({ release, changes: [] })
    groups.at(-1).changes.push(change)
  }
  return groups
}

function releaseHeading(release) {
  const heading = document.createElement('h3')
  heading.className = 'release'
  if (release === null) {
    heading.textContent = translate('releaseNone')
    return heading
  }
  const latest = release === releases()[0]
  const time = document.createElement('time')
  time.dateTime = release
  time.textContent = release
  heading.append(`${translate(latest ? 'releaseLatest' : 'releaseOlder')} `, time)
  return heading
}

function renderChange(change) {
  const article = document.createElement('article')
  article.className = 'change'
  const heading = document.createElement('h4')
  const time = document.createElement('time')
  time.dateTime = change.date
  time.textContent = change.date
  heading.append(time)
  const list = document.createElement('ul')
  const text = change[getLanguage()] ?? change.en
  for (const [kind, key] of Object.entries(KINDS)) {
    for (const line of text[kind] ?? []) {
      const item = document.createElement('li')
      const label = document.createElement('span')
      label.className = 'change-kind'
      label.textContent = `${translate(key)}: `
      item.append(label, line)
      list.append(item)
    }
  }
  article.append(heading, list)
  return article
}

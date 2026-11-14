import { getLanguage, translate } from './i18n.js'

// Hand-written changelog, newest first. Each entry needs en and sv; kinds: add, fix, remove.
const CHANGES = [
  {
    date: '2026-11-14',
    en: {
      add: [
        'Up to 20 yarns: choose "More…" for 5 to 8, or "Max" for up to 20.',
        'Tip when an image might not need all chosen yarns: remove one at a time, and restore if it looked better.'
      ]
    },
    sv: {
      add: [
        'Upp till 20 garner: välj ”Fler…” för 5 till 8, eller ”Max” för upp till 20.',
        'Tips när en bild kanske inte behöver alla valda garner: ta bort ett i taget och återställ om det blev bättre förut.'
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
  const entries = CHANGES.map(change => {
    const article = document.createElement('article')
    article.className = 'change'
    const heading = document.createElement('h3')
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
  })
  document.getElementById('changes-list').replaceChildren(...entries)
}

// UI strings per language. Static text uses data-i18n attributes; dynamic text calls translate().
const STRINGS = {
  en: {
    title: 'Knitting Pattern',
    language: 'Language',
    image: 'Image',
    chooseImage: 'Choose image',
    text: 'Text',
    textPlaceholder: 'Type text',
    font: 'Font',
    bold: 'Bold',
    swatch: 'Swatch (gauge)',
    unit: 'Unit',
    width: 'Width',
    height: 'Height',
    stitches: 'Stitches',
    rows: 'Rows',
    unitStitches: 'stitches',
    unitInch: 'inch',
    textSize: 'Text size',
    textFix: 'Set',
    fixHeight: 'height + spacing',
    fixWidth: 'width + spacing',
    fixFill: 'height + width (fill)',
    letterRows: 'Letter height (rows)',
    letterSpacing: 'Spacing (stitches)',
    letterSpacingRows: 'Spacing (rows)',
    letterStitches: 'Letter height (stitches)',
    rotate: 'Rotate',
    rotateNone: 'no',
    rotateRight: '90° right',
    rotateLeft: '90° left',
    rotateHint: 'Rotated: the chart is shown as knitted, e.g. text along a scarf. Width is across the knitting.',
    textLayout: 'Letters',
    layoutRow: 'side by side',
    layoutColumn: 'on top of each other',
    linkSize: 'Same width and height. Click to set them separately.',
    unlinkSize: 'Separate width and height. Click to link them.',
    letterCm: '≈ {cm} cm per letter',
    letterReduced: ' (reduced to fit width)',
    finalSize: 'Final size',
    yarns: 'Yarns',
    yarnCount: 'Number of yarns',
    useYarns: 'I know my yarn colours',
    yarnN: 'Yarn {n}',
    confirmTitle: 'Recalculate the pattern?',
    removeImage: 'The image will be removed.',
    removeText: 'The text will be removed.',
    losePainted: 'Your painted stitches will be lost.',
    cancel: 'Cancel',
    continue: 'Continue',
    sizeInfo: 'Estimated size of finished fabric: {stitches} stitches × {rows} rows · {width} × {height} cm',
    paintHint: 'To paint in missed stitches, click a letter and paint in the preview. Right-click (on touch: press and hold) restores the original stitch.',
    paintWith: 'Paint with this yarn',
    yarnColour: 'Yarn colour',
    imageColour: 'Colour from the image. Click to restore it',
    selectToPaint: 'Select to paint:',
    stitchCount: '{n} stitches',
    knit: 'Knit',
    flat: 'back and forth',
    round: 'in the round',
    startFrom: 'Start from',
    bottomUp: 'bottom up',
    topDown: 'top down',
    rowHelp: 'Row help',
    rowHelpTitle: 'Shade wrong-side rows',
    stitchView: 'Stitch view (preview)',
    stitchViewTitle: 'Draws each stitch as a V. Very small charts stay flat.',
    print: 'Print',
    savePng: 'Save PNG',
    printInstructions: 'Include instructions in print',
    undo: 'Undo',
    instructions: 'Instructions'
  },
  sv: {
    title: 'Stickmönster',
    language: 'Språk',
    image: 'Bild',
    chooseImage: 'Välj bild',
    text: 'Text',
    textPlaceholder: 'Skriv text',
    font: 'Typsnitt',
    bold: 'Fet',
    swatch: 'Provlapp (masktäthet)',
    unit: 'Enhet',
    width: 'Bredd',
    height: 'Höjd',
    stitches: 'Maskor',
    rows: 'Varv',
    unitStitches: 'maskor',
    unitInch: 'tum',
    textSize: 'Textstorlek',
    textFix: 'Ange',
    fixHeight: 'höjd + mellanrum',
    fixWidth: 'bredd + mellanrum',
    fixFill: 'höjd + bredd (fyll ut)',
    letterRows: 'Bokstavshöjd (varv)',
    letterSpacing: 'Mellanrum (maskor)',
    letterSpacingRows: 'Mellanrum (varv)',
    letterStitches: 'Bokstavshöjd (maskor)',
    rotate: 'Rotera',
    rotateNone: 'nej',
    rotateRight: '90° höger',
    rotateLeft: '90° vänster',
    rotateHint: 'Roterat: diagrammet visas som det stickas, t.ex. text längs en halsduk. Bredd är tvärs över stickningen.',
    textLayout: 'Bokstäver',
    layoutRow: 'bredvid varandra',
    layoutColumn: 'ovanpå varandra',
    linkSize: 'Samma bredd och höjd. Klicka för att ange dem var för sig.',
    unlinkSize: 'Bredd och höjd var för sig. Klicka för att koppla ihop dem.',
    letterCm: '≈ {cm} cm per bokstav',
    letterReduced: ' (minskad för att få plats i bredden)',
    finalSize: 'Färdig storlek',
    yarns: 'Garn',
    yarnCount: 'Antal garner',
    useYarns: 'Jag vet mina garnfärger',
    yarnN: 'Garn {n}',
    confirmTitle: 'Räkna om mönstret?',
    removeImage: 'Bilden tas bort.',
    removeText: 'Texten tas bort.',
    losePainted: 'Dina målade maskor försvinner.',
    cancel: 'Avbryt',
    continue: 'Fortsätt',
    sizeInfo: 'Beräknad storlek på färdigt projekt: {stitches} maskor × {rows} varv · {width} × {height} cm',
    paintHint: 'Klicka på en bokstav och måla i förhandsvisningen för att fylla i missade maskor. Högerklicka (pekskärm: håll kvar) för att återställa ursprunglig maska.',
    paintWith: 'Måla med det här garnet',
    yarnColour: 'Garnfärg',
    imageColour: 'Färg från bilden. Klicka för att återställa den',
    selectToPaint: 'Välj färg att måla med:',
    stitchCount: '{n} maskor',
    knit: 'Sticka',
    flat: 'fram och tillbaka',
    round: 'runt',
    startFrom: 'Börja',
    bottomUp: 'nerifrån och upp',
    topDown: 'uppifrån och ner',
    rowHelp: 'Varvhjälp',
    rowHelpTitle: 'Skugga avigvarven',
    stitchView: 'Maskvy (förhandsvisning)',
    stitchViewTitle: 'Ritar varje maska som ett V. Mycket små diagram visas platta.',
    print: 'Skriv ut',
    savePng: 'Spara PNG',
    printInstructions: 'Ta med instruktioner i utskrift',
    undo: 'Ångra',
    instructions: 'Instruktioner'
  }
}

// formatInstruction terms; English is also core's default
const INSTRUCTION_TERMS = {
  en: {
    row: 'Row',
    round: 'Round',
    sides: { RS: 'RS', WS: 'WS' },
    shortSides: { RS: 'RS', WS: 'WS' },
    arrows: { rtl: 'read chart right → left', ltr: 'read chart left → right' }
  },
  sv: {
    row: 'Varv',
    round: 'Varv',
    sides: { RS: 'rät', WS: 'avig' },
    shortSides: { RS: 'r', WS: 'a' },
    arrows: { rtl: 'läs diagrammet höger → vänster', ltr: 'läs diagrammet vänster → höger' }
  }
}

// Known core errors; anything else is shown as thrown
const ERRORS = {
  sv: [
    [/^text has no visible letters$/, 'texten har inga synliga bokstäver'],
    [/^text is (\d+) stitches wide, more than (\d+)$/, 'texten är $1 maskor bred, mer än $2'],
    [/^text does not fit (\d+) stitches$/, 'texten får inte plats på $1 maskor'],
    [/^Grid \((\d+)x(\d+)\) is larger than image \((\d+)x(\d+)\)$/, 'mönstret ($1×$2) är större än bilden ($3×$4)'],
    [/^width and height must be positive numbers$/, 'bredd och höjd måste vara positiva tal'],
    [/^stitches and rows must be greater than 0$/, 'maskor och varv måste vara större än 0'],
    [/^Width must be greater than 0$/, 'bredden måste vara större än 0'],
    [/^need at least as many yarns as source colours$/, 'det behövs minst lika många garner som färger']
  ]
}

const STORAGE_KEY = 'language'
export const LANGUAGES = Object.keys(STRINGS)

let language = initialLanguage()

// Saved choice first, then the browser language, then English
function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (STRINGS[saved]) return saved
  } catch {}
  const preferred = (navigator.languages ?? [navigator.language])
    .map(tag => tag.slice(0, 2).toLowerCase())
    .find(code => STRINGS[code])
  return preferred ?? 'en'
}

export function getLanguage() {
  return language
}

export function setLanguage(code) {
  language = code
  try { localStorage.setItem(STORAGE_KEY, code) } catch {}
  translatePage()
}

export function translate(key, values = {}) {
  const text = STRINGS[language][key] ?? STRINGS.en[key]
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name])
}

export function instructionTerms() {
  return INSTRUCTION_TERMS[language]
}

export function translateError(message) {
  for (const [pattern, translation] of ERRORS[language] ?? []) {
    if (pattern.test(message)) return message.replace(pattern, translation)
  }
  return message
}

export function formatNumber(value, decimals) {
  return value.toLocaleString(language, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function translatePage() {
  document.documentElement.lang = language
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = translate(element.dataset.i18n) })
  document.querySelectorAll('[data-i18n-title]').forEach(element => { element.title = translate(element.dataset.i18nTitle) })
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.placeholder = translate(element.dataset.i18nPlaceholder) })
}

// UI strings per language. Static text uses data-i18n attributes; dynamic text calls translate().
const STRINGS = {
  en: {
    title: "Knitting Pattern",
    language: "Language",
    image: "Image",
    chooseImage: "Choose image",
    imageLocal: "All processing happens on your device; no image is uploaded.",
    text: "Text",
    textPlaceholder: "Type text",
    font: "Font",
    bold: "Bold",
    swatch: "Swatch (gauge)",
    unit: "Unit",
    width: "Width",
    height: "Height",
    stitches: "Stitches",
    rows: "Rows",
    unitStitches: "stitches",
    unitInch: "inch",
    textSize: "Text size",
    textFix: "Set",
    fixHeight: "height + spacing",
    fixWidth: "width + spacing",
    fixFill: "height + width (fill)",
    letterRows: "Letter height (rows)",
    letterSpacing: "Spacing (stitches)",
    letterSpacingRows: "Spacing (rows)",
    letterStitches: "Letter height (stitches)",
    rotate: "Rotate",
    rotateNone: "no",
    rotateRight: "90° right",
    rotateLeft: "90° left",
    rotateFlip: "upside down (180°)",
    flipHint:
      "Upside down: for a turned-up brim or folded-down cuff. Knit this part with the motif's right side facing the inside (e.g. turn the work inside out), so it reads right once folded.",
    rotateHint:
      "Rotated: the chart is shown as knitted, e.g. text along a scarf. Width is across the knitting.",
    textLayout: "Letters",
    layoutRow: "side by side",
    layoutColumn: "on top of each other",
    linkSize: "Same width and height. Click to set them separately.",
    unlinkSize: "Separate width and height. Click to link them.",
    letterCm: "≈ {cm} cm per letter",
    letterReduced: " (reduced to fit width)",
    finalSize: "Goal size",
    yarns: "Yarns",
    yarnCount: "Number of yarns",
    useYarns: "I know my yarn colours",
    yarnN: "Yarn {n}",
    yarnMore: "More…",
    yarnCountMore: "More yarns",
    yarnMax: "Max (up to 20)…",
    yarnMoreTitle: "More than 4 yarns?",
    yarnMoreWarn:
      "More yarns make each recalculation slower (a second or more on phones). Many colours per row are also hard to knit.",
    yarnMaxTitle: "Up to 20 yarns?",
    yarnMaxWarn: "This unlocks 9 to 20 yarns.",
    yarnMaxSure: "Are you sure? Recalculating may take several seconds on slower devices.",
    yarnMaxHint:
      "Best suited for embroidery, e.g. duplicate stitch (Swiss darning) on finished knitting, rather than knitting all colours in.",
    yarnAuto: "Auto improve",
    yarnAutoFewer: "Use {best} yarns: the rest look unnecessary for this image",
    yarnAutoMore: "Use {best} yarns and fine-tune: the image seems to have more colours than now",
    yarnAutoNone: "No better number of yarns found for this image",
    advancedTitle: "Advanced settings",
    advancedHide: "Hide advanced settings",
    fineTune: "Fine-tune colours",
    fineTuneHelp: "For when a small part, such as thin text, got the wrong colour. May take a few seconds.",
    fineTuneUnchanged: "No difference for this image.",
    yarnFlagsTitle: "Choose which yarns to leave out",
    yarnFlagsHelp: "Untick a yarn this image may not need: its stitches get the closest yarn that is left.",
    flagEmpty: "has no stitches",
    flagNear: "looks almost the same as",
    flagBlend: "is only a soft edge between",
    flagAnd: "and",
    yarnLess: "− yarn",
    yarnMoreButton: "+ yarn",
    yarnUndo: "Undo yarn change",
    confirmTitle: "Recalculate the pattern?",
    removeImage: "The image will be removed.",
    removeText: "The text will be removed.",
    losePainted: "Your painted stitches will be lost.",
    cancel: "Cancel",
    continue: "Continue",
    close: "Close",
    aboutTitle: "Prototype under test",
    aboutTest:
      "This is a first prototype under test. If something does not work, anything is unclear or you miss a function, please mail me and I will see if I can solve it.",
    aboutMail: "Feedback:",
    aboutDev: "The site is under development and will later be replaced by the real one at another address.",
    aboutFuture: "New address:",
    bannerText: "This is a prototype.",
    bannerMail: "Please email feedback or suggestions to",
    bannerUpdate: "Last update:",
    menuLabel: "Menu",
    menuPattern: "Pattern",
    menuAbout: "About",
    menuChanges: "Changes",
    menuLiveView: "Live view",
    aboutPageTitle: "About",
    aboutDataTitle: "Your data",
    aboutNoAccount:
      "There is no account and nothing is stored on a server. All calculations happen on your device, and images are never uploaded.",
    aboutNoSave:
      "The app does not save your work: if you reload the page, the pattern is lost. Print it or save a PDF or PNG to keep it.",
    aboutStorageTitle: "Saving in the browser",
    aboutStorage:
      "By saving a pattern or using live view you allow this site to store data in your browser (local storage). The pattern is not saved by us and may be lost if you clear your browser data.",
    aboutStorageMore:
      "Saved data stays on your device and is never sent to us. Clearing site data or cookies removes it; a plain cache clear may not.",
    aboutPrototypeTitle: "Under development",
    aboutExamplesTitle: "Examples",
    changesTitle: "Changes",
    changesIntro: "What has changed, newest first.",
    releaseLatest: "Last update:",
    releaseOlder: "Update:",
    releaseNone: "Not published yet",
    changeAdd: "Added",
    changeFix: "Fixed",
    changeRemove: "Removed",
    sizeInfo: "Estimated size of finished fabric: {stitches} stitches × {rows} rows · {width} × {height} cm",
    paletteHint:
      "These are the colours that best match your design. Click Change to pick another yarn colour, or click the colour next to it to restore the matched colour.",
    paintHint:
      "To paint in missed stitches, pick a letter in the “Select to paint” section below (or press 1–9 or A–T, Esc to stop) and paint in the chart. Right-click (on touch: press and hold) restores the original stitch. Ctrl+Z undoes.",
    swapHint: "⇄ (or S) flips stitches to the other yarn.",
    changeColour: "Change",
    paintWith: "Paint with this yarn",
    swapBrush: "Flip stitches to the other yarn (S)",
    yarnColour: "Yarn colour",
    imageColour: "Matched colour. Click to restore it",
    selectToPaint: "Select to paint:",
    stitchCount: "{n} stitches",
    knit: "Knit",
    flat: "back and forth",
    round: "in the round",
    startFrom: "Start from",
    bottomUp: "bottom up",
    topDown: "top down",
    rowHelp: "Row help",
    rowHelpTitle: "Shade wrong-side rows",
    stitchView: "Stitch view (preview)",
    stitchViewTitle: "Draws each stitch as a V. Paused while you paint or change a colour.",
    stitchViewInfo: "With stitches shown, print preview and changes take longer.",
    stitchViewTooLarge:
      "This chart is too wide to show stitches clearly, so stitch view is turned off. It works on charts up to about 140 stitches wide.",
    print: "Print / Save PDF",
    savePng: "Save PNG",
    paper: "Paper",
    portrait: "portrait",
    landscape: "landscape",
    pngInfo: "Include info in PNG",
    infoGauge: "Gauge",
    infoGaugeValue: "{stitches} stitches × {rows} rows on {width} × {height} {unit}",
    infoSize: "Size",
    infoSizeValue: "{stitches} stitches × {rows} rows · {width} × {height} {unit}",
    infoLetter: "Letter height",
    infoLetterRows: "{n} rows · ≈ {length} {unit}",
    infoLetterStitches: "{n} stitches · ≈ {length} {unit}",
    infoUpsideDown: "Upside down (hem)",
    infoRotated: "Rotated",
    infoSetup: "Knitting",
    yes: "yes",
    prototype: "(currently just a prototype)",
    createdAt: "This pattern was created at {site}",
    printInstructions: "Include instructions in print",
    printInScale: "Print in scale",
    paperSize: "Paper size",
    pngHint:
      "To print, use Print / Save PDF: it prints faster and sharper, since printers do not treat it as a photo. PNG suits viewing on a phone or iPad.",
    printScale: "Scale %",
    printScaleTitle:
      "100 % = each square is the size of a real stitch. Larger charts are split over several pages to tape together.",
    printScaleCaption: "Chart at {scale} %",
    tileCaption: "{name} · rows {rows} · stitches {stitches} · {scale} %",
    tileOverview:
      "The chart is split over {count} pages. Cut along the chart edge and tape them together like this:",
    printPagesTitle: "Print many pages?",
    printPages: "This print needs about {pages} pages.",
    duplexTip:
      "Tip: without two-sided printing, print the odd pages, turn the stack over and print the even pages. In the print dialog, keep scale at 100 % (Default) so stitches print at the right size.",
    undo: "Undo",
    instructions: "Instructions",
  },
  sv: {
    title: "Stickmönster",
    language: "Språk",
    image: "Bild",
    chooseImage: "Välj bild",
    imageLocal: "All bearbetning sker på din enhet; ingen bild laddas upp.",
    text: "Text",
    textPlaceholder: "Skriv text",
    font: "Typsnitt",
    bold: "Fet",
    swatch: "Provlapp (stickfasthet)",
    unit: "Enhet",
    width: "Bredd",
    height: "Höjd",
    stitches: "Maskor",
    rows: "Varv",
    unitStitches: "maskor",
    unitInch: "tum",
    textSize: "Textstorlek",
    textFix: "Ange",
    fixHeight: "höjd + mellanrum",
    fixWidth: "bredd + mellanrum",
    fixFill: "höjd + bredd (fyll ut)",
    letterRows: "Bokstavshöjd (varv)",
    letterSpacing: "Mellanrum (maskor)",
    letterSpacingRows: "Mellanrum (varv)",
    letterStitches: "Bokstavshöjd (maskor)",
    rotate: "Rotera",
    rotateNone: "nej",
    rotateRight: "90° höger",
    rotateLeft: "90° vänster",
    rotateFlip: "upp och ner (180°)",
    flipHint:
      "Upp och ner: för en uppvikt mudd eller nedvikt kant. Sticka den delen med mönstrets rätsida inåt (t.ex. vänd arbetet ut och in), så blir mönstret rättvänt när kanten viks.",
    rotateHint:
      "Roterat: diagrammet visas som det stickas, t.ex. text längs en halsduk. Bredd är tvärs över stickningen.",
    textLayout: "Bokstäver",
    layoutRow: "bredvid varandra",
    layoutColumn: "ovanpå varandra",
    linkSize: "Samma bredd och höjd. Klicka för att ange dem var för sig.",
    unlinkSize: "Bredd och höjd var för sig. Klicka för att koppla ihop dem.",
    letterCm: "≈ {cm} cm per bokstav",
    letterReduced: " (minskad för att få plats i bredden)",
    finalSize: "Önskad storlek",
    yarns: "Garn",
    yarnCount: "Antal garner",
    useYarns: "Jag vet mina garnfärger",
    yarnN: "Garn {n}",
    yarnMore: "Fler…",
    yarnCountMore: "Fler garner",
    yarnMax: "Max (upp till 20)…",
    yarnMoreTitle: "Fler än 4 garner?",
    yarnMoreWarn:
      "Fler garner gör varje omräkning långsammare (en sekund eller mer på mobilen). Många färger per varv är också svårt att sticka.",
    yarnMaxTitle: "Upp till 20 garner?",
    yarnMaxWarn: "Det här låser upp 9 till 20 garner.",
    yarnMaxSure: "Är du säker? Omräkningen kan ta flera sekunder på långsammare enheter.",
    yarnMaxHint:
      "Passar bäst för broderi, t.ex. maskstygn på färdig stickning, snarare än att sticka in alla färger.",
    yarnAuto: "Förbättra automatiskt",
    yarnAutoFewer: "Använd {best} garner: resten verkar onödiga för den här bilden",
    yarnAutoMore: "Använd {best} garner och finjustera: bilden verkar ha fler färger än nu",
    yarnAutoNone: "Inget bättre antal garner hittades för den här bilden",
    advancedTitle: "Avancerade inställningar",
    advancedHide: "Dölj avancerade inställningar",
    fineTune: "Finjustera färger",
    fineTuneHelp: "När en liten del, t.ex. tunn text, fick fel färg. Kan ta några sekunder.",
    fineTuneUnchanged: "Ingen skillnad för den här bilden.",
    yarnFlagsTitle: "Välj vilka garner som ska bort",
    yarnFlagsHelp:
      "Bocka ur ett garn som bilden kanske inte behöver: dess maskor får det närmaste garnet som är kvar.",
    flagEmpty: "har inga maskor",
    flagNear: "ser nästan likadant ut som",
    flagBlend: "är bara en mjuk kant mellan",
    flagAnd: "och",
    yarnLess: "− garn",
    yarnMoreButton: "+ garn",
    yarnUndo: "Ångra garnändring",
    confirmTitle: "Räkna om mönstret?",
    removeImage: "Bilden tas bort.",
    removeText: "Texten tas bort.",
    losePainted: "Dina målade maskor försvinner.",
    cancel: "Avbryt",
    continue: "Fortsätt",
    close: "Stäng",
    aboutTitle: "Prototyp under test",
    aboutTest:
      "Det här är en första prototyp under test. Om något inte fungerar, är otydligt eller om du saknar en funktion - mejla mig så ser jag om jag kan lösa det.",
    aboutMail: "Synpunkter:",
    aboutDev: "Sidan är under utveckling och ersätts senare av den riktiga sidan på en annan adress.",
    aboutFuture: "Ny adress:",
    bannerText: "Detta är en prototyp.",
    bannerMail: "Mejla gärna synpunkter eller förslag till",
    bannerUpdate: "Senast uppdaterad:",
    menuLabel: "Meny",
    menuPattern: "Mönster",
    menuAbout: "Om",
    menuChanges: "Ändringar",
    menuLiveView: "Liveläge",
    aboutPageTitle: "Om",
    aboutDataTitle: "Dina uppgifter",
    aboutNoAccount:
      "Det finns inget konto och inget sparas på någon server. Alla beräkningar görs på din enhet och bilder laddas aldrig upp.",
    aboutNoSave:
      "Appen sparar inte ditt arbete: laddar du om sidan försvinner mönstret. Skriv ut det eller spara som PDF eller PNG för att behålla det.",
    aboutStorageTitle: "Spara i webbläsaren",
    aboutStorage:
      "Genom att spara ett mönster eller använda liveläget tillåter du att den här sidan lagrar data i din webbläsare (local storage). Mönstret sparas inte av oss och kan försvinna om du rensar webbläsarens data.",
    aboutStorageMore:
      "Sparad data stannar på din enhet och skickas aldrig till oss. Rensar du webbplatsdata eller cookies försvinner den; en vanlig cache-rensning tar kanske inte bort den.",
    aboutPrototypeTitle: "Under utveckling",
    aboutExamplesTitle: "Exempel",
    changesTitle: "Ändringar",
    changesIntro: "Vad som har ändrats, nyast först.",
    releaseLatest: "Senast uppdaterad:",
    releaseOlder: "Uppdatering:",
    releaseNone: "Inte publicerat än",
    changeAdd: "Nytt",
    changeFix: "Rättat",
    changeRemove: "Borttaget",
    sizeInfo: "Beräknad storlek på färdigt projekt: {stitches} maskor × {rows} varv · {width} × {height} cm",
    paletteHint:
      "Det här är färgerna som bäst matchar din design. Klicka på Byt för att välja en annan garnfärg, eller på färgen bredvid för att återställa den matchade färgen.",
    paintHint:
      "Välj en bokstav i ”Välj färg att måla med”-sektionen nedan (eller tryck 1–9 eller A–T, Esc för att sluta) och måla i diagrammet för att fylla i missade maskor. Högerklicka (pekskärm: håll kvar) för att återställa ursprunglig maska. Ctrl+Z ångrar.",
    swapHint: "⇄ (eller S) byter maskor till det andra garnet.",
    changeColour: "Byt",
    paintWith: "Måla med det här garnet",
    swapBrush: "Byt maskor till det andra garnet (S)",
    yarnColour: "Garnfärg",
    imageColour: "Matchad färg. Klicka för att återställa den",
    selectToPaint: "Välj färg att måla med:",
    stitchCount: "{n} maskor",
    knit: "Sticka",
    flat: "fram och tillbaka",
    round: "runt",
    startFrom: "Börja",
    bottomUp: "nerifrån och upp",
    topDown: "uppifrån och ner",
    rowHelp: "Varvhjälp",
    rowHelpTitle: "Skugga avigvarven",
    stitchView: "Maskvy (förhandsvisning)",
    stitchViewTitle: "Ritar varje maska som ett V. Pausas medan du målar eller byter färg.",
    stitchViewInfo: "När maskorna visas tar förhandsvisning för utskrift och ändringar längre tid.",
    stitchViewTooLarge:
      "Diagrammet är för brett för att visa maskor tydligt, så maskvyn är avstängd. Den fungerar på diagram upp till cirka 140 maskor breda.",
    print: "Skriv ut / Spara PDF",
    savePng: "Spara PNG",
    paper: "Papper",
    portrait: "stående",
    landscape: "liggande",
    pngInfo: "Ta med info i PNG",
    infoGauge: "Stickfasthet",
    infoGaugeValue: "{stitches} maskor × {rows} varv på {width} × {height} {unit}",
    infoSize: "Storlek",
    infoSizeValue: "{stitches} maskor × {rows} varv · {width} × {height} {unit}",
    infoLetter: "Bokstavshöjd",
    infoLetterRows: "{n} varv · ≈ {length} {unit}",
    infoLetterStitches: "{n} maskor · ≈ {length} {unit}",
    infoUpsideDown: "Upp och ner (kant)",
    infoRotated: "Roterad",
    infoSetup: "Stickning",
    yes: "ja",
    prototype: "(för närvarande bara en prototyp)",
    createdAt: "Mönstret är skapat på {site}",
    printInstructions: "Ta med instruktioner i utskrift",
    printInScale: "Skriv ut i skala",
    paperSize: "Pappersstorlek",
    pngHint:
      "För utskrift, använd Skriv ut / Spara PDF: det skrivs ut snabbare och skarpare, eftersom skrivare inte behandlar det som ett foto. PNG passar för att titta på i mobil eller iPad.",
    printScale: "Skala %",
    printScaleTitle:
      "100 % = varje ruta är lika stor som en riktig maska. Större diagram delas upp på flera sidor att tejpa ihop.",
    printScaleCaption: "Diagram i {scale} %",
    tileCaption: "{name} · varv {rows} · maskor {stitches} · {scale} %",
    tileOverview:
      "Diagrammet är uppdelat på {count} sidor. Klipp längs diagramkanten och tejpa ihop dem så här:",
    printPagesTitle: "Skriva ut många sidor?",
    printPages: "Utskriften blir ungefär {pages} sidor.",
    duplexTip:
      "Tips: utan dubbelsidig utskrift, skriv ut udda sidor, vänd bunten och skriv ut jämna sidor. Behåll skala 100 % (Standard) i utskriftsdialogen så att maskorna blir rätt storlek.",
    undo: "Ångra",
    instructions: "Instruktioner",
  },
}

// formatInstruction terms; English is also core's default
const INSTRUCTION_TERMS = {
  en: {
    row: "Row",
    round: "Round",
    sides: { RS: "RS", WS: "WS" },
    shortSides: { RS: "RS", WS: "WS" },
    arrows: { rtl: "read chart right → left", ltr: "read chart left → right" },
  },
  sv: {
    row: "Varv",
    round: "Varv",
    sides: { RS: "rät", WS: "avig" },
    shortSides: { RS: "r", WS: "a" },
    arrows: { rtl: "läs diagrammet höger → vänster", ltr: "läs diagrammet vänster → höger" },
  },
}

// Known core errors; anything else is shown as thrown
const ERRORS = {
  sv: [
    [/^text has no visible letters$/, "texten har inga synliga bokstäver"],
    [/^text is (\d+) stitches wide, more than (\d+)$/, "texten är $1 maskor bred, mer än $2"],
    [/^text does not fit (\d+) stitches$/, "texten får inte plats på $1 maskor"],
    [
      /^Grid \((\d+)x(\d+)\) is larger than image \((\d+)x(\d+)\)$/,
      "mönstret ($1×$2) är större än bilden ($3×$4)",
    ],
    [/^width and height must be positive numbers$/, "bredd och höjd måste vara positiva tal"],
    [/^stitches and rows must be greater than 0$/, "maskor och varv måste vara större än 0"],
    [/^Width must be greater than 0$/, "bredden måste vara större än 0"],
    [/^need at least as many yarns as source colours$/, "det behövs minst lika många garner som färger"],
  ],
}

const STORAGE_KEY = "language"
export const LANGUAGES = Object.keys(STRINGS)

let language = initialLanguage()

// Saved choice first, then the browser language, then English
function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (STRINGS[saved]) return saved
  } catch {
    // storage blocked (e.g. private mode): use the browser language
  }
  const preferred = (navigator.languages ?? [navigator.language])
    .map((tag) => tag.slice(0, 2).toLowerCase())
    .find((code) => STRINGS[code])
  return preferred ?? "en"
}

export function getLanguage() {
  return language
}

export function setLanguage(code) {
  language = code
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    // storage blocked (e.g. private mode): the choice lasts this visit only
  }
  translatePage()
  // For text built in code (e.g. the changes list)
  document.dispatchEvent(new Event("languageswitch"))
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
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n)
  })
  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = translate(element.dataset.i18nTitle)
  })
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nAriaLabel))
  })
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder)
  })
}

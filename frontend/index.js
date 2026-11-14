import { createPattern } from "../core/createPattern.js"
import { fromImageData } from "../core/fromImageData.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { setYarn, paintCell } from "../core/patternEdits.js"
import { rowInstructions, formatInstruction } from "../core/rowInstructions.js"
import { toGlyph, composeText, fitRows, textPattern } from "../core/textGrid.js"
import { rotateGrid, rotateGauge } from "../core/rotateGrid.js"
import { translate, translatePage, getLanguage, setLanguage, instructionTerms, translateError, formatNumber } from "./i18n.js"
import { initAbout } from "./about.js"
import { initBanner } from "./banner.js"
import { initMenu } from "./menu.js"
import { initChanges } from "./changes.js"
import { initPrint } from "./print.js"
import { initYarnCount } from "./yarnCount.js"
import { initYarnButtons } from "./yarnButtons.js"
import { drawChart, drawCell, fitCellSize, rgbToHex, isLight, LABEL_MARGIN, MIN_STITCH_CELL } from "./chart.js"

// Longest image side kept after load; caps both work and max stitch count
const MAX_IMAGE_SIDE = 600

// Letters are drawn once at this size, then downsampled per letter height
const GLYPH_FONT_SIZE = 300
const MAX_LETTER_ROWS = 200
const CM_PER_INCH = 2.54
// Touch: holding a stitch this long restores it instead of painting
const HOLD_MS = 500

const byId = id => document.getElementById(id)

let pixels = null
let pattern = null
// 'image' or 'text'; text mode always uses 2 yarns and restores the image count after
let source = 'image'
let imageYarnCount = null
const glyphCache = new Map()
// Painting: selected palette index or 'swap' (2 yarns), grids before each stroke, cell size of the last draw
let brush = null
// Swap brush: yarn the current stroke paints, set by its first stitch
let swapTarget = null
let undoStack = []
let painting = false
let layout = null
// Grid as generated, for restoring stitches; stroke is 'paint' or 'restore'
let generatedGrid = null
let stroke = null
let hold = null
// Form values of the current pattern; a cancelled change returns to them
let settled = null
// Kept so a language switch can re-render them
let letterInfo = null
let errorMessage = null
// Stitch view switched off by an edit; it comes back when editing stops
let stitchViewPaused = false
// Own yarn colours ever chosen per picker, so fewer then more yarns keeps them
let yarnMemory = []

byId('image').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return
  if (!await confirmChange(source === 'text' && hasText() ? 'removeText' : null)) {
    event.target.value = ''
    return
  }

  yarnButtons.clear()
  // One source at a time: an image replaces typed text
  byId('text').value = ''
  byId('image-name').textContent = file.name
  source = 'image'
  pixels = await loadPixels(file)
  generate()
})

byId('text').addEventListener('input', async () => {
  if (await confirmChange(source === 'image' && pixels ? 'removeImage' : null)) loadText()
})

// Linked swatch: width and height stay equal; relinking copies width to height
byId('swatch-width').addEventListener('input', () => {
  if (swatchLinked()) byId('swatch-height').value = byId('swatch-width').value
})
byId('swatch-height').addEventListener('input', () => {
  if (swatchLinked()) byId('swatch-width').value = byId('swatch-height').value
})
byId('swatch-link').addEventListener('click', async () => {
  const linked = !swatchLinked()
  const changesSize = linked && byId('swatch-height').value !== byId('swatch-width').value
  if (changesSize && !await confirmChange(null)) return

  byId('swatch-link').setAttribute('aria-pressed', String(linked))
  renderLinkTitle()
  if (changesSize) {
    byId('swatch-height').value = byId('swatch-width').value
    generate()
  } else {
    settled = readSettings()
  }
})

// Any other input change regenerates the pattern, once confirmed
byId('inputs').addEventListener('change', async event => {
  const { id } = event.target
  if (id === 'image' || id === 'text') return
  // Font only matters for text
  if ((id === 'font' || id === 'bold') && source !== 'text') {
    settled = readSettings()
    return
  }
  const isCount = id === 'yarn-count' || id === 'yarn-count-more'
  if (isCount && !await yarnCount.confirm(event.target)) return
  if (!await confirmChange(null)) return
  if (isCount) yarnButtons.clear()

  if (id === 'swatch-inch') convertSwatchUnit()
  if (id === 'use-yarns') byId('yarn-pickers').hidden = !byId('use-yarns').checked
  if (id === 'use-yarns' || id === 'yarn-count' || id === 'yarn-count-more') renderYarnPickers()
  generate()
})

// Knitting options only change numbering and instructions, not the pattern
byId('knit-method').addEventListener('change', () => {
  // Row help shades wrong-side rows, which only exist when knitting back and forth
  byId('row-help-option').hidden = byId('knit-method').value !== 'flat'
  drawGrid()
  renderInstructions()
})
byId('knit-start').addEventListener('change', () => { drawGrid(); renderInstructions() })
byId('row-help').addEventListener('change', () => drawGrid())
byId('stitch-view-info').addEventListener('click', () => notify('stitchViewInfo'))
byId('stitch-view').addEventListener('change', () => {
  stitchViewPaused = false
  drawGrid()
})

byId('grid').addEventListener('pointerdown', startStroke)
byId('grid').addEventListener('pointermove', moveStroke)
byId('grid').addEventListener('pointerup', endStroke)
byId('grid').addEventListener('pointercancel', endStroke)
// Right-click and long press restore stitches; no context menu
byId('grid').addEventListener('contextmenu', event => event.preventDefault())

// Keys pick a brush: 1-9 or A-T a yarn, S swap, Esc none; same key again deselects.
// Ctrl+Z undoes a stroke. Fields keep their own keys.
document.addEventListener('keydown', event => {
  if (!pattern || byId('result').hidden || byId('view-pattern').hidden || painting) return
  if (event.target.closest('input, select, textarea, dialog')) return

  const key = event.key.toLowerCase()
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && key === 'z') {
    if (!byId('undo').disabled) byId('undo').click()
    event.preventDefault()
    return
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return
  if (key === 'escape') {
    if (brush !== null) selectBrush(brush)
    return
  }
  const index = '123456789'.includes(key) ? Number(key) - 1 : 'abcdefghijklmnopqrst'.indexOf(key)
  if (key === 's' && pattern.palette.length === 2) selectBrush('swap')
  else if (key.length === 1 && index >= 0 && index < pattern.palette.length) selectBrush(index)
  else return
  event.preventDefault()
})

byId('undo').addEventListener('click', () => {
  pattern = { ...pattern, grid: undoStack.pop() }
  updateLock()
  render()
})


byId('language').addEventListener('change', () => {
  setLanguage(byId('language').value)
  renderLinkTitle()
  renderYarnPickers()
  renderLetterInfo()
  showError(errorMessage)
  if (pattern) render()
})


byId('language').value = getLanguage()
const yarnCount = initYarnCount({ ask })
translatePage()
renderLinkTitle()
renderYarnPickers()
previewFonts()
settled = readSettings()
initAbout()
initBanner()
initMenu()
initChanges()
const updatePaper = initPrint({ getInfo: printInfo, chart: chartSettings, ask })

const yarnButtons = initYarnButtons({ yarnCount, changeCount: changeYarnCount })

// Counts here were already confirmed (More… / Max), so only painted stitches are asked about
async function changeYarnCount(count) {
  if (!await confirmChange(null)) return false
  yarnCount.set(count)
  renderYarnPickers()
  generate()
  return true
}

async function loadPixels(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)

  return fromImageData(ctx.getImageData(0, 0, width, height))
}

// Each option, and the closed select, shows its own font
function previewFonts() {
  const select = byId('font')
  for (const option of select.options) option.style.fontFamily = option.value
  const update = () => { select.style.fontFamily = select.value }
  select.addEventListener('change', update)
  update()
}

function loadText() {
  // One source at a time: typed text replaces an image
  byId('image').value = ''
  byId('image-name').textContent = ''
  pixels = null
  source = 'text'
  generate()
}

// Pixels of each character, cropped to its ink; all share one height so baselines line up
function glyphPixels(chars, family, bold) {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `${bold ? 'bold ' : ''}${GLYPH_FONT_SIZE}px ${family}`
  const font = ctx.font
  const metrics = Object.fromEntries(chars.map(char => [char, ctx.measureText(char)]))
  const inked = chars.filter(char => char.trim())
  if (inked.length === 0) throw new Error('text has no visible letters')

  const ascent = Math.ceil(Math.max(...inked.map(char => metrics[char].actualBoundingBoxAscent)))
  const descent = Math.ceil(Math.max(...inked.map(char => metrics[char].actualBoundingBoxDescent)))

  return Object.fromEntries(chars.map(char => {
    const key = `${font}|${ascent}|${descent}|${char}`
    if (!glyphCache.has(key)) {
      const charMetrics = metrics[char]
      // A space has no ink; use its advance width instead
      const width = char.trim() ? charMetrics.actualBoundingBoxLeft + charMetrics.actualBoundingBoxRight : charMetrics.width
      const canvas = ctx.canvas
      canvas.width = Math.max(1, Math.ceil(width))
      canvas.height = ascent + descent
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'
      ctx.font = font
      ctx.fillText(char, charMetrics.actualBoundingBoxLeft, ascent)
      glyphCache.set(key, fromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height)))
    }
    return [char, glyphCache.get(key)]
  }))
}

function createTextPattern() {
  const text = byId('text').value.trim()
  const swatch = readSwatch()
  const gauge = gaugeInterpreter(swatch)
  const chars = [...new Set(text.replace(/\n/g, ''))]
  const pixelsByChar = glyphPixels(chars, byId('font').value, byId('bold').checked)
  const maxRows = Math.min(MAX_LETTER_ROWS, Object.values(pixelsByChar)[0].length)

  // Text turned 90° is composed upright with stitches and rows swapped, then turned,
  // so its height runs across the stitches of the knitted fabric. 180° keeps the gauge.
  const turn = byId('rotate').value
  const quarterTurn = isQuarterTurn(turn)
  const textGauge = quarterTurn ? rotateGauge(gauge) : gauge
  const across = grid => quarterTurn ? grid.length : grid[0].length
  const textLayout = byId('text-layout').value
  const compose = (rows, options) => {
    const glyphs = Object.fromEntries(chars.map(char => [char, toGlyph(pixelsByChar[char], rows, textGauge)]))
    return composeText(glyphs, text, { ...options, layout: textLayout, lineSpacing: Math.max(1, Math.round(rows * 0.3)) })
  }

  const sizeMode = byId('text-fix').value
  const spacing = Math.max(0, Math.round(Number(byId('letter-spacing').value)))
  const requested = Math.min(maxRows, Math.max(1, Math.round(Number(byId('letter-rows').value))))
  let rows = sizeMode === 'width'
    ? fitRows(letterRows => across(compose(letterRows, { spacing })), readWidthStitches(gauge), maxRows)
    : requested
  // Fill: height is a maximum; shrink letters until they fit the width with no spacing
  if (sizeMode === 'fill') {
    rows = Math.min(rows, fitRows(letterRows => compose(letterRows, { spacing: 0 })[0].length, readWidthStitches(gauge), maxRows))
  }
  const grid = sizeMode === 'fill' ? compose(rows, { width: readWidthStitches(gauge) }) : compose(rows, { spacing })

  byId('letter-rows').value = rows
  letterInfo = { cm: rows / textGauge.rowsPerCm, reduced: sizeMode === 'fill' && rows < requested }
  renderLetterInfo()
  return textPattern({ swatch, grid: rotateGrid(grid, turn), yarns: readYarns() })
}

function renderLetterInfo() {
  byId('letter-cm').textContent = letterInfo
    ? translate('letterCm', { cm: formatNumber(letterInfo.cm, 1) }) + (letterInfo.reduced ? translate('letterReduced') : '')
    : ''
}

function readWidthStitches(gauge) {
  const value = Number(byId('width-value').value)
  const perUnit = { stitches: 1, cm: gauge.stitchesPerCm, inch: gauge.stitchesPerInch }[byId('width-unit').value]
  return Math.max(1, Math.round(value * perUnit))
}

// Show text settings only for typed text; enable only the inputs the chosen mode uses
function updateSourceInputs() {
  const isText = source === 'text'
  const hasText = byId('text').value.trim() !== ''
  // Stacked or rotated letters have nothing to spread across the width. Stacking and
  // rotating each turn spacing from stitches into rows; rotating measures height in stitches.
  const isColumn = byId('text-layout').value === 'column'
  const isTurned = isQuarterTurn(byId('rotate').value)
  byId('rotate-hint').hidden = !isTurned
  byId('flip-hint').hidden = byId('rotate').value !== '180'
  byId('text-fix').querySelector('[value="fill"]').disabled = isColumn || isTurned
  if ((isColumn || isTurned) && byId('text-fix').value === 'fill') byId('text-fix').value = 'height'
  setLabel('letter-spacing-label', isColumn !== isTurned ? 'letterSpacingRows' : 'letterSpacing')
  setLabel('letter-rows-label', isTurned ? 'letterStitches' : 'letterRows')

  const sizeMode = byId('text-fix').value
  byId('text-size').hidden = !(isText && hasText)

  if (isText && imageYarnCount === null) {
    imageYarnCount = yarnCount.read()
    yarnCount.set(2)
    renderYarnPickers()
  } else if (!isText && imageYarnCount !== null) {
    yarnCount.set(imageYarnCount)
    imageYarnCount = null
    renderYarnPickers()
  }
  yarnCount.setDisabled(isText)

  byId('letter-rows').disabled = isText && sizeMode === 'width'
  byId('letter-spacing').disabled = isText && sizeMode === 'fill'
  byId('width-value').disabled = isText && sizeMode === 'height'
  byId('width-unit').disabled = isText && sizeMode === 'height'
}

function setLabel(id, key) {
  byId(id).dataset.i18n = key
  byId(id).textContent = translate(key)
}

// Swatch size and final width follow the swatch unit, converted so the size stays the same.
// A final width counted in stitches is left alone.
function convertSwatchUnit() {
  const unit = swatchUnit()
  convertLength('swatch-width', unit)
  convertLength('swatch-height', unit)

  const widthUnit = byId('width-unit').value
  if (widthUnit === 'stitches' || widthUnit === unit) return
  convertLength('width-value', unit)
  byId('width-unit').value = unit
}

// Inches keep two decimals so converting back lands on the same cm (10 cm → 3.94 in → 10 cm)
function convertLength(inputId, toUnit) {
  const value = Number(byId(inputId).value)
  const converted = toUnit === 'inch' ? value / CM_PER_INCH : value * CM_PER_INCH
  const decimals = toUnit === 'inch' ? 2 : 1
  byId(inputId).value = Number(converted.toFixed(decimals))
}

function swatchUnit() {
  return byId('swatch-inch').checked ? 'inch' : 'cm'
}

function swatchLinked() {
  return byId('swatch-link').getAttribute('aria-pressed') === 'true'
}

function renderLinkTitle() {
  byId('swatch-link').title = translate(swatchLinked() ? 'linkSize' : 'unlinkSize')
}

function readSwatch() {
  return {
    unit: swatchUnit(),
    width: Number(byId('swatch-width').value),
    height: Number(byId('swatch-height').value),
    stitches: Number(byId('swatch-stitches').value),
    rows: Number(byId('swatch-rows').value)
  }
}

function readYarns() {
  if (!byId('use-yarns').checked) return []
  return [...byId('yarn-pickers').querySelectorAll('input')].map(input => hexToRgb(input.value))
}

function readKnitOptions() {
  return { method: byId('knit-method').value, start: byId('knit-start').value }
}

function yarnLabel(index) {
  return String.fromCharCode(65 + index)
}

function renderYarnPickers() {
  const container = byId('yarn-pickers')
  const count = yarnCount.read()
  const defaults = ['#ffffff', '#000000', '#cc0000', '#0044cc', '#ffcc00', '#008833', '#ff8800', '#8833aa',
    '#66ccff', '#ff99cc', '#884400', '#888888', '#99cc33', '#003366', '#cc6666', '#ffffaa',
    '#006666', '#cc99ff', '#444444', '#ffcc99']

  // Keep colours already chosen
  const current = [...container.querySelectorAll('input')].map(input => input.value)
  yarnMemory = [...current, ...yarnMemory.slice(current.length)]

  container.replaceChildren(...Array.from({ length: count }, (_, i) => {
    const input = document.createElement('input')
    input.type = 'color'
    input.value = yarnMemory[i] ?? defaults[i]
    input.title = translate('yarnN', { n: i + 1 })
    return input
  }))
}

function generate() {
  settled = readSettings()
  updateSourceInputs()
  if (source === 'image' ? !pixels : !byId('text').value.trim()) {
    // Switching source can leave nothing to show; drop the old pattern
    pattern = null
    yarnButtons.update(null)
    letterInfo = null
    renderLetterInfo()
    byId('result').hidden = true
    showError(null)
    return
  }

  try {
    pattern = source === 'text' ? createTextPattern() : createPattern({
      swatch: readSwatch(),
      pixels: rotateGrid(pixels, byId('rotate').value),
      yarnCount: yarnCount.read(),
      yarns: readYarns(),
      desiredWidth: { unit: byId('width-unit').value, value: Number(byId('width-value').value) }
    })
    generatedGrid = pattern.grid
    yarnButtons.update(pattern, source === 'image')
    // Fewer yarns than before can leave the brush pointing at a missing colour
    if (brush === 'swap' ? pattern.palette.length !== 2 : brush !== null && brush >= pattern.palette.length) brush = null
    showError(null)
    render()
  } catch (error) {
    showError(error.message)
  }
}

function render() {
  const { size, palette } = pattern

  byId('result').hidden = false
  updatePaper()
  byId('size-info').textContent = translate('sizeInfo', {
    stitches: size.stitches,
    rows: size.rows,
    width: formatNumber(size.widthCm, 1),
    height: formatNumber(size.heightCm, 1)
  })

  const counts = palette.map(() => 0)
  pattern.grid.flat().forEach(index => counts[index]++)

  const brushes = palette.map((entry, i) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = i === brush ? 'yarn-label selected' : 'yarn-label'
    button.dataset.brush = i
    button.textContent = yarnLabel(i)
    button.title = translate('paintWith')
    paintBrush(button, entry.yarn)
    button.addEventListener('click', () => selectBrush(i))
    return button
  })
  // With two yarns a stroke can flip stitches to the other yarn
  const swap = []
  if (palette.length === 2) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = brush === 'swap' ? 'yarn-label selected' : 'yarn-label'
    button.dataset.brush = 'swap'
    button.textContent = `${yarnLabel(0)} ⇄ ${yarnLabel(1)}`
    button.title = translate('swapBrush')
    button.addEventListener('click', () => selectBrush('swap'))
    swap.push(button)
  }
  byId('brushes').replaceChildren(...brushes, ...swap)
  byId('swap-hint').hidden = swap.length === 0

  byId('palette').replaceChildren(...palette.map((entry, i) => {
    const li = document.createElement('li')

    const label = document.createElement('strong')
    label.textContent = yarnLabel(i)

    const yarnSwatch = document.createElement('span')
    yarnSwatch.className = 'swatch print-only'
    yarnSwatch.style.background = rgbToHex(entry.yarn)

    // Native colour input made invisible over a labelled button in the yarn colour
    const yarnPicker = document.createElement('input')
    yarnPicker.type = 'color'
    yarnPicker.value = rgbToHex(entry.yarn)
    const pickerButton = document.createElement('label')
    pickerButton.className = 'colour-button no-print'
    pickerButton.title = translate('yarnColour')
    pickerButton.append(translate('changeColour'), yarnPicker)
    paintBrush(pickerButton, entry.yarn)
    yarnPicker.addEventListener('input', () => {
      pattern = setYarn(pattern, i, hexToRgb(yarnPicker.value))
      yarnSwatch.style.background = yarnPicker.value
      paintBrush(brushes[i], pattern.palette[i].yarn)
      paintBrush(pickerButton, pattern.palette[i].yarn)
      pauseStitchView()
      drawGrid()
    })
    // Picker closed: back to stitch view unless a brush keeps editing going
    yarnPicker.addEventListener('change', () => {
      if (brush === null && resumeStitchView()) drawGrid()
    })

    const imageSwatch = document.createElement('button')
    imageSwatch.type = 'button'
    imageSwatch.className = 'swatch no-print'
    imageSwatch.style.background = rgbToHex(entry.source)
    imageSwatch.title = translate('imageColour')
    imageSwatch.addEventListener('click', () => {
      pattern = setYarn(pattern, i, entry.source)
      render()
    })

    li.append(label, yarnSwatch, pickerButton, imageSwatch, ` ${translate('stitchCount', { n: counts[i] })}`)
    return li
  }))

  yarnButtons.render()
  byId('grid').classList.toggle('painting', brush !== null)
  drawGrid()
  renderInstructions()
}


function renderInstructions() {
  const labels = pattern.palette.map((_, i) => yarnLabel(i))

  byId('instructions').replaceChildren(...rowInstructions(pattern.grid, readKnitOptions()).map(instruction => {
    const li = document.createElement('li')
    li.textContent = formatInstruction(instruction, labels, instructionTerms())
    return li
  }))
}

function drawGrid() {
  const cells = fitCellSize(pattern.size.stitches, gaugeInterpreter(readSwatch()))
  // Too large, whether just switched on or the chart grew: switch off and say why
  if (byId('stitch-view').checked && cells.cellWidth < MIN_STITCH_CELL) {
    byId('stitch-view').checked = false
    stitchViewPaused = false
    notify('stitchViewTooLarge')
  }
  layout = drawChart(byId('grid'), { ...chartSettings(), ...cells })
}

// Everything drawChart needs except cell size; print tiles reuse it
function chartSettings() {
  return {
    grid: pattern.grid,
    palette: pattern.palette,
    options: readKnitOptions(),
    rowHelp: byId('row-help').checked,
    stitchView: byId('stitch-view').checked
  }
}

function isQuarterTurn(turn) {
  return turn === 'right' || turn === 'left'
}

// Settings for the print info block and PNG strip
function printInfo() {
  const rotate = byId('rotate').value
  return {
    swatch: readSwatch(),
    size: pattern.size,
    widthUnit: byId('width-unit').value,
    letter: source === 'text' && letterInfo
      ? { count: Number(byId('letter-rows').value), cm: letterInfo.cm, inStitches: isQuarterTurn(rotate) }
      : null,
    rotate,
    options: readKnitOptions()
  }
}

// Button in its yarn colour, with readable text
function paintBrush(button, yarn) {
  button.style.background = rgbToHex(yarn)
  button.style.color = isLight(yarn) ? '#222' : '#fff'
}

// Stitch view is for looking only: redrawing it on every edit lags on big charts.
// Both return whether the view changed.
function pauseStitchView() {
  if (!byId('stitch-view').checked) return false
  byId('stitch-view').checked = false
  stitchViewPaused = true
  return true
}

function resumeStitchView() {
  if (!stitchViewPaused) return false
  byId('stitch-view').checked = true
  stitchViewPaused = false
  return true
}

function selectBrush(index) {
  brush = brush === index ? null : index
  if (brush !== null ? pauseStitchView() : resumeStitchView()) drawGrid()
  byId('brushes').querySelectorAll('.yarn-label').forEach(label => {
    label.classList.toggle('selected', label.dataset.brush === String(brush))
  })
  byId('grid').classList.toggle('painting', brush !== null)
}

// Left button paints with the brush, right button restores the generated stitch.
// Touch: a tap paints; holding still on a stitch switches the stroke to restore.
function startStroke(event) {
  const restore = event.button === 2
  const touch = event.pointerType === 'touch'
  if (event.button !== 0 && !restore) return
  if (brush === null && !restore && !touch) return

  // A touch tap without a brush paints nothing, so it keeps the view
  if ((brush !== null || restore) && pauseStitchView()) drawGrid()
  byId('grid').setPointerCapture(event.pointerId)
  undoStack.push(pattern.grid)
  painting = true
  stroke = restore ? 'restore' : 'paint'
  swapTarget = null
  paintAt(event)

  const cell = cellAt(event)
  if (touch && !restore && cell) {
    hold = { cell, timer: setTimeout(() => { stroke = 'restore'; paintCellAt(cell) }, HOLD_MS) }
  }
}

function moveStroke(event) {
  if (!painting) return
  // Moving to another stitch before the hold time makes it a paint stroke
  const cell = cellAt(event)
  if (hold && (cell?.x !== hold.cell?.x || cell?.y !== hold.cell?.y)) cancelHold()
  paintAt(event)
}

function cancelHold() {
  if (!hold) return
  clearTimeout(hold.timer)
  hold = null
}

function endStroke() {
  cancelHold()
  if (!painting) return
  painting = false

  // A stroke that changed nothing is not worth an undo step
  if (undoStack[undoStack.length - 1] === pattern.grid) undoStack.pop()

  updateLock()
  // A restore stroke without a brush is over once released
  if (brush === null) resumeStitchView()
  render()
}

// Stitch under the pointer, or null outside the grid
function cellAt(event) {
  const canvas = byId('grid')
  const rect = canvas.getBoundingClientRect()
  const gridX = (event.clientX - rect.left) * (canvas.width / rect.width) - LABEL_MARGIN
  const gridY = (event.clientY - rect.top) * (canvas.height / rect.height) - LABEL_MARGIN
  const x = Math.floor(gridX / layout.cellWidth)
  const y = Math.floor(gridY / layout.cellHeight)

  if (x < 0 || y < 0 || x >= pattern.size.stitches || y >= pattern.size.rows) return null
  return { x, y }
}

function paintAt(event) {
  const cell = cellAt(event)
  if (cell) paintCellAt(cell)
}

// Paint or restore one stitch; only that cell is redrawn until the stroke ends
function paintCellAt({ x, y }) {
  if (stroke === 'paint' && brush === 'swap' && swapTarget === null) swapTarget = 1 - pattern.grid[y][x]
  const index = stroke === 'restore' ? generatedGrid[y][x] : brush === 'swap' ? swapTarget : brush
  if (index === null) return

  const next = paintCell(pattern, x, y, index)
  if (next === pattern) return
  pattern = next

  drawCell(byId('grid'), layout, pattern.palette, { x, y, index })
}

function updateLock() {
  byId('undo').disabled = undoStack.length === 0
}

function hasText() {
  return byId('text').value.trim() !== ''
}

// A change that recalculates the pattern asks first when it would lose painted stitches
// or the other source ('removeImage' / 'removeText'). Cancel puts the form back.
async function confirmChange(removes) {
  const reasons = [removes, undoStack.length > 0 && 'losePainted'].filter(Boolean)
  if (reasons.length > 0 && !await ask(reasons)) {
    restoreSettings(settled)
    return false
  }
  undoStack = []
  updateLock()
  return true
}

function notify(key) {
  const dialog = byId('notice')
  byId('notice-text').textContent = translate(key)
  if (!dialog.open) dialog.showModal()
}

// A click on the backdrop (outside the dialog box) closes the notice
byId('notice').addEventListener('click', event => {
  const box = event.currentTarget.getBoundingClientRect()
  const inside = event.clientX >= box.left && event.clientX <= box.right &&
    event.clientY >= box.top && event.clientY <= box.bottom
  if (!inside) event.currentTarget.close()
})

// Each reason is a string key or [key, values]
function ask(reasons, title = 'confirmTitle') {
  const dialog = byId('confirm')
  byId('confirm-title').textContent = translate(title)
  byId('confirm-reasons').replaceChildren(...reasons.map(reason => {
    const [key, values] = [reason].flat()
    const p = document.createElement('p')
    p.textContent = translate(key, values)
    return p
  }))
  dialog.returnValue = ''
  dialog.showModal()
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'ok'), { once: true })
  })
}

function readSettings() {
  return {
    controls: [...byId('inputs').querySelectorAll('input:not([type="file"]), select, textarea')]
      .filter(control => control.id)
      .map(control => [control, control.type === 'checkbox' ? control.checked : control.value]),
    yarns: [...byId('yarn-pickers').querySelectorAll('input')].map(input => input.value),
    linked: swatchLinked()
  }
}

function restoreSettings({ controls, yarns, linked }) {
  for (const [control, value] of controls) {
    if (control.type === 'checkbox') control.checked = value
    else control.value = value
  }
  byId('swatch-link').setAttribute('aria-pressed', String(linked))
  renderLinkTitle()
  byId('yarn-pickers').hidden = !byId('use-yarns').checked
  yarnCount.sync()
  renderYarnPickers()
  byId('yarn-pickers').querySelectorAll('input').forEach((input, i) => { if (yarns[i]) input.value = yarns[i] })
}

function showError(message) {
  errorMessage = message
  byId('error').hidden = !message
  byId('error').textContent = message ? translateError(message) : ''
}

function hexToRgb(hex) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
}

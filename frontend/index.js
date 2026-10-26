import { createPattern } from "../core/createPattern.js"
import { fromImageData } from "../core/fromImageData.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { setYarn, paintCell } from "../core/patternEdits.js"
import { rowInstructions, formatInstruction } from "../core/rowInstructions.js"
import { toGlyph, composeText, fitRows, textPattern } from "../core/textGrid.js"
import { rotateGrid, rotateGauge } from "../core/rotateGrid.js"
import { translate, translatePage, getLanguage, setLanguage, instructionTerms, translateError, formatNumber } from "./i18n.js"

// Longest image side kept after load; caps both work and max stitch count
const MAX_IMAGE_SIDE = 600
const MAX_CANVAS_WIDTH = 900
const MAX_CELL_WIDTH = 24
// Margin on every side for row and stitch numbers
const LABEL_MARGIN = 32
const LABEL_FONT = '11px system-ui, sans-serif'
// Guide lines: every 5th between the plain grid line (0.15) and the every 10th
const GUIDES = [
  { step: 5, colour: 'rgba(0, 0, 0, 0.25)', width: 1 },
  { step: 10, colour: 'rgba(0, 0, 0, 0.38)', width: 1.5 }
]

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
// Painting: selected palette index, grids before each stroke, cell size of the last draw
let brush = null
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

byId('image').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return
  if (!await confirmChange(source === 'text' && hasText() ? 'removeText' : null)) {
    event.target.value = ''
    return
  }

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
  if (!await confirmChange(null)) return

  if (id === 'swatch-inch') convertSwatchUnit()
  if (id === 'use-yarns') byId('yarn-pickers').hidden = !byId('use-yarns').checked
  if (id === 'use-yarns' || id === 'yarn-count') renderYarnPickers()
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
byId('row-help').addEventListener('change', drawGrid)

byId('grid').addEventListener('pointerdown', startStroke)
byId('grid').addEventListener('pointermove', moveStroke)
byId('grid').addEventListener('pointerup', endStroke)
byId('grid').addEventListener('pointercancel', endStroke)
// Right-click and long press restore stitches; no context menu
byId('grid').addEventListener('contextmenu', event => event.preventDefault())

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

byId('print').addEventListener('click', () => window.print())
byId('save-png').addEventListener('click', savePng)

byId('language').value = getLanguage()
translatePage()
renderLinkTitle()
renderYarnPickers()
previewFonts()
settled = readSettings()

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

  // Rotated text is composed upright with stitches and rows swapped, then turned,
  // so its height runs across the stitches of the knitted fabric
  const turn = byId('rotate').value
  const textGauge = turn === 'none' ? gauge : rotateGauge(gauge)
  const across = grid => turn === 'none' ? grid[0].length : grid.length
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
  const isTurned = byId('rotate').value !== 'none'
  byId('rotate-hint').hidden = !isTurned
  byId('text-fix').querySelector('[value="fill"]').disabled = isColumn || isTurned
  if ((isColumn || isTurned) && byId('text-fix').value === 'fill') byId('text-fix').value = 'height'
  setLabel('letter-spacing-label', isColumn !== isTurned ? 'letterSpacingRows' : 'letterSpacing')
  setLabel('letter-rows-label', isTurned ? 'letterStitches' : 'letterRows')

  const sizeMode = byId('text-fix').value
  byId('text-size').hidden = !(isText && hasText)

  if (isText && imageYarnCount === null) {
    imageYarnCount = byId('yarn-count').value
    byId('yarn-count').value = '2'
    renderYarnPickers()
  } else if (!isText && imageYarnCount !== null) {
    byId('yarn-count').value = imageYarnCount
    imageYarnCount = null
    renderYarnPickers()
  }
  byId('yarn-count').disabled = isText

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
  const count = Number(byId('yarn-count').value)
  const defaults = ['#ffffff', '#000000', '#cc0000', '#0044cc']

  // Keep colours already chosen
  const current = [...container.querySelectorAll('input')].map(input => input.value)

  container.replaceChildren(...Array.from({ length: count }, (_, i) => {
    const input = document.createElement('input')
    input.type = 'color'
    input.value = current[i] ?? defaults[i]
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
      yarnCount: Number(byId('yarn-count').value),
      yarns: readYarns(),
      desiredWidth: { unit: byId('width-unit').value, value: Number(byId('width-value').value) }
    })
    generatedGrid = pattern.grid
    // Fewer yarns than before can leave the brush pointing at a missing colour
    if (brush !== null && brush >= pattern.palette.length) brush = null
    showError(null)
    render()
  } catch (error) {
    showError(error.message)
  }
}

function render() {
  const { size, palette } = pattern

  byId('result').hidden = false
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
    button.textContent = yarnLabel(i)
    button.title = translate('paintWith')
    paintBrush(button, entry.yarn)
    button.addEventListener('click', () => selectBrush(i))
    return button
  })
  byId('brushes').replaceChildren(...brushes)

  byId('palette').replaceChildren(...palette.map((entry, i) => {
    const li = document.createElement('li')

    const label = document.createElement('strong')
    label.textContent = yarnLabel(i)

    const yarnSwatch = document.createElement('span')
    yarnSwatch.className = 'swatch print-only'
    yarnSwatch.style.background = rgbToHex(entry.yarn)

    const yarnPicker = document.createElement('input')
    yarnPicker.type = 'color'
    yarnPicker.value = rgbToHex(entry.yarn)
    yarnPicker.title = translate('yarnColour')
    yarnPicker.addEventListener('input', () => {
      pattern = setYarn(pattern, i, hexToRgb(yarnPicker.value))
      yarnSwatch.style.background = yarnPicker.value
      paintBrush(brushes[i], pattern.palette[i].yarn)
      drawGrid()
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

    li.append(label, yarnSwatch, yarnPicker, imageSwatch, ` ${translate('stitchCount', { n: counts[i] })}`)
    return li
  }))

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
  const { grid, palette, size } = pattern
  const gauge = gaugeInterpreter(readSwatch())
  const options = readKnitOptions()

  // Knitted stitches are wider than tall: cell height = width × stitch/row ratio
  const cellWidth = Math.min(MAX_CELL_WIDTH, (MAX_CANVAS_WIDTH - 2 * LABEL_MARGIN) / size.stitches)
  const cellHeight = cellWidth * (gauge.stitchesPerCm / gauge.rowsPerCm)
  const gridWidth = cellWidth * size.stitches
  const gridHeight = cellHeight * size.rows
  // Displayed rows knitted on the wrong side, shaded when row help is on
  const shadedRows = options.method === 'flat' && byId('row-help').checked
    ? new Set(rowInstructions(grid, options).filter(row => row.side === 'WS').map(row => row.displayRow))
    : new Set()
  layout = { cellWidth, cellHeight, shadedRows }

  const canvas = byId('grid')
  canvas.width = Math.ceil(gridWidth + 2 * LABEL_MARGIN)
  canvas.height = Math.ceil(gridHeight + 2 * LABEL_MARGIN)
  const ctx = canvas.getContext('2d')

  // Opaque background so the saved PNG is not transparent
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Labels sit in a margin on every side; the grid is drawn inside it
  ctx.save()
  ctx.translate(LABEL_MARGIN, LABEL_MARGIN)

  const colours = palette.map(entry => rgbToHex(entry.yarn))

  grid.forEach((row, y) => {
    row.forEach((index, x) => {
      ctx.fillStyle = colours[index]
      ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
    })
  })

  ctx.fillStyle = cssVar('--row-help')
  shadedRows.forEach(y => ctx.fillRect(0, y * cellHeight, gridWidth, cellHeight))

  // Grid lines only when cells are big enough to see them
  if (cellWidth >= 6) {
    ctx.strokeStyle = cssVar('--grid-line')
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x <= size.stitches; x++) {
      ctx.moveTo(Math.round(x * cellWidth) + 0.5, 0)
      ctx.lineTo(Math.round(x * cellWidth) + 0.5, gridHeight)
    }
    for (let y = 0; y <= size.rows; y++) {
      ctx.moveTo(0, Math.round(y * cellHeight) + 0.5)
      ctx.lineTo(gridWidth, Math.round(y * cellHeight) + 0.5)
    }
    ctx.stroke()
  }

  drawGuideLines(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, options })
  drawLabels(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, options })
  ctx.restore()
}

// Guide lines every 5th and 10th stitch/row, counted from stitch 1 and row 1
// so they line up with the numbering. Drawn even when cells are too small for grid lines.
function drawGuideLines(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, options }) {
  const fromBottom = options.start === 'bottom'

  for (const { step, colour, width } of GUIDES) {
    // Leave positions to a coarser guide so overlapping strokes don't darken
    const isGuide = counted => counted % step === 0 &&
      !GUIDES.some(guide => guide.step > step && counted % guide.step === 0)

    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.beginPath()

    for (let line = 1; line < size.stitches; line++) {
      const counted = fromBottom ? size.stitches - line : line
      if (!isGuide(counted)) continue
      ctx.moveTo(Math.round(line * cellWidth) + 0.5, 0)
      ctx.lineTo(Math.round(line * cellWidth) + 0.5, gridHeight)
    }

    for (let line = 1; line < size.rows; line++) {
      const counted = fromBottom ? size.rows - line : line
      if (!isGuide(counted)) continue
      ctx.moveTo(0, Math.round(line * cellHeight) + 0.5)
      ctx.lineTo(gridWidth, Math.round(line * cellHeight) + 0.5)
    }

    ctx.stroke()
  }
}

// Each row number sits on the side where that row starts (flat: odd and even on
// opposite sides). Stitch 1 is where RS rows start, numbered along the starting edge.
function drawLabels(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, options }) {
  ctx.fillStyle = '#444'
  ctx.font = LABEL_FONT

  const rowStep = labelStep(cellHeight)
  ctx.textBaseline = 'middle'
  for (const { number, displayRow, direction } of rowInstructions(pattern.grid, options)) {
    if (number !== 1 && number % rowStep !== 0) continue

    const y = (displayRow + 0.5) * cellHeight
    if (direction === 'rtl') {
      ctx.textAlign = 'left'
      ctx.fillText(String(number), gridWidth + 4, y)
    } else {
      ctx.textAlign = 'right'
      ctx.fillText(String(number), -4, y)
    }
  }

  const fromBottom = options.start === 'bottom'
  const stitchStep = labelStep(cellWidth)
  ctx.textAlign = 'center'
  ctx.textBaseline = fromBottom ? 'top' : 'bottom'
  for (let number = 1; number <= size.stitches; number++) {
    if (number !== 1 && number % stitchStep !== 0) continue

    // Bottom up: stitch 1 at the right. Top down: stitch 1 at the left.
    const x = fromBottom ? size.stitches - number : number - 1
    ctx.fillText(String(number), (x + 0.5) * cellWidth, fromBottom ? gridHeight + 4 : -4)
  }
}

// Label every cell when there is room, otherwise every 5th or 10th
function labelStep(cellSize) {
  if (cellSize >= 14) return 1
  if (cellSize >= 4) return 5
  return 10
}

function savePng() {
  byId('grid').toBlob(blob => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'knitting-pattern.png'
    link.click()
    // Revoking straight away can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  })
}

// Brush button in its yarn colour, with a readable letter
function paintBrush(button, [r, g, b]) {
  button.style.background = rgbToHex([r, g, b])
  button.style.color = 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#222' : '#fff'
}

function selectBrush(index) {
  brush = brush === index ? null : index
  byId('brushes').querySelectorAll('.yarn-label').forEach((label, i) => {
    label.classList.toggle('selected', i === brush)
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

  byId('grid').setPointerCapture(event.pointerId)
  undoStack.push(pattern.grid)
  painting = true
  stroke = restore ? 'restore' : 'paint'
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
  const index = stroke === 'restore' ? generatedGrid[y][x] : brush
  if (index === null) return

  const next = paintCell(pattern, x, y, index)
  if (next === pattern) return
  pattern = next

  const ctx = byId('grid').getContext('2d')
  const cell = [LABEL_MARGIN + x * layout.cellWidth, LABEL_MARGIN + y * layout.cellHeight, layout.cellWidth, layout.cellHeight]
  ctx.fillStyle = rgbToHex(pattern.palette[index].yarn)
  ctx.fillRect(...cell)
  // Keep the row help shade on painted stitches
  if (layout.shadedRows.has(y)) {
    ctx.fillStyle = cssVar('--row-help')
    ctx.fillRect(...cell)
  }
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

function ask(reasons) {
  const dialog = byId('confirm')
  byId('confirm-reasons').replaceChildren(...reasons.map(key => {
    const p = document.createElement('p')
    p.textContent = translate(key)
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
  renderYarnPickers()
  byId('yarn-pickers').querySelectorAll('input').forEach((input, i) => { if (yarns[i]) input.value = yarns[i] })
}

function showError(message) {
  errorMessage = message
  byId('error').hidden = !message
  byId('error').textContent = message ? translateError(message) : ''
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}

function rgbToHex(rgb) {
  return '#' + rgb.map(channel => channel.toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
}

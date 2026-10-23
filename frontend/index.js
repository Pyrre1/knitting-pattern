import { createPattern } from "../core/createPattern.js"
import { fromImageData } from "../core/fromImageData.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { setYarn, paintCell } from "../core/patternEdits.js"
import { rowInstructions, formatInstruction } from "../core/rowInstructions.js"
import { toGlyph, composeText, fitRows, textPattern } from "../core/textGrid.js"

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

const $ = id => document.getElementById(id)

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

$('image').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return

  // One source at a time: an image replaces typed text
  $('text').value = ''
  source = 'image'
  pixels = await loadPixels(file)
  generate()
})

$('text').addEventListener('input', loadText)
$('font').addEventListener('change', loadText)
$('bold').addEventListener('change', loadText)

$('use-yarns').addEventListener('change', () => {
  $('yarn-pickers').hidden = !$('use-yarns').checked
  renderYarnPickers()
  generate()
})

$('yarn-count').addEventListener('change', () => { renderYarnPickers(); generate() })

// Any other input change regenerates the pattern
const OWN_HANDLERS = ['image', 'text', 'font', 'bold', 'use-yarns', 'yarn-count']
$('inputs').addEventListener('change', event => {
  if (!OWN_HANDLERS.includes(event.target.id)) generate()
})

// Knitting options only change numbering and instructions, not the pattern
$('knit-method').addEventListener('change', () => { drawGrid(); renderInstructions() })
$('knit-start').addEventListener('change', () => { drawGrid(); renderInstructions() })

$('grid').addEventListener('pointerdown', startStroke)
$('grid').addEventListener('pointermove', event => { if (painting) paintAt(event) })
$('grid').addEventListener('pointerup', endStroke)
$('grid').addEventListener('pointercancel', endStroke)

$('undo').addEventListener('click', () => {
  pattern = { ...pattern, grid: undoStack.pop() }
  updateLock()
  render()
})

$('unlock').addEventListener('click', () => {
  if (!confirm('If you change settings, your painted stitches are lost and you need to edit the next render from scratch.')) return
  undoStack = []
  updateLock()
})

$('print').addEventListener('click', () => window.print())
$('save-png').addEventListener('click', savePng)

renderYarnPickers()
previewFonts()

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
  const select = $('font')
  for (const option of select.options) option.style.fontFamily = option.value
  const update = () => { select.style.fontFamily = select.value }
  select.addEventListener('change', update)
  update()
}

function loadText() {
  // One source at a time: typed text replaces an image
  $('image').value = ''
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
      const m = metrics[char]
      // A space has no ink; use its advance width instead
      const width = char.trim() ? m.actualBoundingBoxLeft + m.actualBoundingBoxRight : m.width
      const canvas = ctx.canvas
      canvas.width = Math.max(1, Math.ceil(width))
      canvas.height = ascent + descent
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'
      ctx.font = font
      ctx.fillText(char, m.actualBoundingBoxLeft, ascent)
      glyphCache.set(key, fromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height)))
    }
    return [char, glyphCache.get(key)]
  }))
}

function createTextPattern() {
  const text = $('text').value.trim()
  const swatch = readSwatch()
  const gauge = gaugeInterpreter(swatch)
  const chars = [...new Set(text.replace(/\n/g, ''))]
  const pixelsByChar = glyphPixels(chars, $('font').value, $('bold').checked)
  const maxRows = Math.min(MAX_LETTER_ROWS, Object.values(pixelsByChar)[0].length)

  const compose = (rows, options) => {
    const glyphs = Object.fromEntries(chars.map(char => [char, toGlyph(pixelsByChar[char], rows, gauge)]))
    return composeText(glyphs, text, { ...options, lineSpacing: Math.max(1, Math.round(rows * 0.3)) })
  }

  const fix = $('text-fix').value
  const spacing = Math.max(0, Math.round(Number($('letter-spacing').value)))
  const requested = Math.min(maxRows, Math.max(1, Math.round(Number($('letter-rows').value))))
  let rows = fix === 'width'
    ? fitRows(r => compose(r, { spacing })[0].length, readWidthStitches(gauge), maxRows)
    : requested
  // Fill: height is a maximum; shrink letters until they fit the width with no spacing
  if (fix === 'fill') {
    rows = Math.min(rows, fitRows(r => compose(r, { spacing: 0 })[0].length, readWidthStitches(gauge), maxRows))
  }
  const grid = fix === 'fill' ? compose(rows, { width: readWidthStitches(gauge) }) : compose(rows, { spacing })

  $('letter-rows').value = rows
  $('letter-cm').textContent = `≈ ${(rows / gauge.rowsPerCm).toFixed(1)} cm per letter` +
    (fix === 'fill' && rows < requested ? ' (reduced to fit width)' : '')
  return textPattern({ swatch, grid, yarns: readYarns() })
}

function readWidthStitches(gauge) {
  const value = Number($('width-value').value)
  const perUnit = { stitches: 1, cm: gauge.stitchesPerCm, inch: gauge.stitchesPerInch }[$('width-unit').value]
  return Math.max(1, Math.round(value * perUnit))
}

// Show text settings only for text; enable only the inputs the chosen mode uses
function updateSourceInputs() {
  const text = source === 'text'
  const fix = $('text-fix').value
  $('text-size').hidden = !text

  if (text && imageYarnCount === null) {
    imageYarnCount = $('yarn-count').value
    $('yarn-count').value = '2'
    renderYarnPickers()
  } else if (!text && imageYarnCount !== null) {
    $('yarn-count').value = imageYarnCount
    imageYarnCount = null
    renderYarnPickers()
  }
  $('yarn-count').disabled = text

  $('letter-rows').disabled = text && fix === 'width'
  $('letter-spacing').disabled = text && fix === 'fill'
  $('width-value').disabled = text && fix === 'height'
  $('width-unit').disabled = text && fix === 'height'
}

function readSwatch() {
  return {
    unit: $('swatch-unit').value,
    width: Number($('swatch-width').value),
    height: Number($('swatch-height').value),
    stitches: Number($('swatch-stitches').value),
    rows: Number($('swatch-rows').value)
  }
}

function readYarns() {
  if (!$('use-yarns').checked) return []
  return [...$('yarn-pickers').querySelectorAll('input')].map(input => hexToRgb(input.value))
}

function readKnitOptions() {
  return { method: $('knit-method').value, start: $('knit-start').value }
}

function yarnLabel(index) {
  return String.fromCharCode(65 + index)
}

function renderYarnPickers() {
  const container = $('yarn-pickers')
  const count = Number($('yarn-count').value)
  const defaults = ['#ffffff', '#000000', '#cc0000', '#0044cc']

  // Keep colours already chosen
  const current = [...container.querySelectorAll('input')].map(input => input.value)

  container.replaceChildren(...Array.from({ length: count }, (_, i) => {
    const input = document.createElement('input')
    input.type = 'color'
    input.value = current[i] ?? defaults[i]
    input.title = `Yarn ${i + 1}`
    return input
  }))
}

function generate() {
  updateSourceInputs()
  if (source === 'image' ? !pixels : !$('text').value.trim()) return

  try {
    pattern = source === 'text' ? createTextPattern() : createPattern({
      swatch: readSwatch(),
      pixels,
      yarnCount: Number($('yarn-count').value),
      yarns: readYarns(),
      desiredWidth: { unit: $('width-unit').value, value: Number($('width-value').value) }
    })
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

  $('result').hidden = false
  $('size-info').textContent =
    `${size.stitches} stitches × ${size.rows} rows · ` +
    `${size.widthCm.toFixed(1)} × ${size.heightCm.toFixed(1)} cm`

  const counts = palette.map(() => 0)
  pattern.grid.flat().forEach(index => counts[index]++)

  $('palette').replaceChildren(...palette.map((entry, i) => {
    const li = document.createElement('li')

    const label = document.createElement('button')
    label.type = 'button'
    label.className = i === brush ? 'yarn-label selected' : 'yarn-label'
    label.textContent = yarnLabel(i)
    label.title = 'Paint with this yarn'
    label.addEventListener('click', () => selectBrush(i))

    const yarnSwatch = document.createElement('span')
    yarnSwatch.className = 'swatch print-only'
    yarnSwatch.style.background = rgbToHex(entry.yarn)

    const yarn = document.createElement('input')
    yarn.type = 'color'
    yarn.value = rgbToHex(entry.yarn)
    yarn.title = 'Yarn colour'
    yarn.addEventListener('input', () => {
      pattern = setYarn(pattern, i, hexToRgb(yarn.value))
      yarnSwatch.style.background = yarn.value
      drawGrid()
    })

    const source = document.createElement('span')
    source.className = 'swatch no-print'
    source.style.background = rgbToHex(entry.source)
    source.title = 'Image colour'

    li.append(label, yarnSwatch, yarn, source, ` ${counts[i]} stitches`)
    return li
  }))

  $('grid').classList.toggle('painting', brush !== null)
  drawGrid()
  renderInstructions()
}

function renderInstructions() {
  const labels = pattern.palette.map((_, i) => yarnLabel(i))

  $('instructions').replaceChildren(...rowInstructions(pattern.grid, readKnitOptions()).map(instruction => {
    const li = document.createElement('li')
    li.textContent = formatInstruction(instruction, labels)
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
  layout = { cellWidth, cellHeight }

  const canvas = $('grid')
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

  // Grid lines only when cells are big enough to see them
  if (cellWidth >= 6) {
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-line')
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

    for (let k = 1; k < size.stitches; k++) {
      const counted = fromBottom ? size.stitches - k : k
      if (!isGuide(counted)) continue
      ctx.moveTo(Math.round(k * cellWidth) + 0.5, 0)
      ctx.lineTo(Math.round(k * cellWidth) + 0.5, gridHeight)
    }

    for (let k = 1; k < size.rows; k++) {
      const counted = fromBottom ? size.rows - k : k
      if (!isGuide(counted)) continue
      ctx.moveTo(0, Math.round(k * cellHeight) + 0.5)
      ctx.lineTo(gridWidth, Math.round(k * cellHeight) + 0.5)
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
  $('grid').toBlob(blob => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'knitting-pattern.png'
    link.click()
    // Revoking straight away can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  })
}

function selectBrush(index) {
  brush = brush === index ? null : index
  $('palette').querySelectorAll('.yarn-label').forEach((label, i) => {
    label.classList.toggle('selected', i === brush)
  })
  $('grid').classList.toggle('painting', brush !== null)
}

function startStroke(event) {
  if (brush === null) return

  $('grid').setPointerCapture(event.pointerId)
  undoStack.push(pattern.grid)
  painting = true
  paintAt(event)
}

function endStroke() {
  if (!painting) return
  painting = false

  // A stroke that changed nothing is not worth an undo step
  if (undoStack[undoStack.length - 1] === pattern.grid) undoStack.pop()

  updateLock()
  render()
}

// Paint the stitch under the pointer; only that cell is redrawn until the stroke ends
function paintAt(event) {
  const canvas = $('grid')
  const rect = canvas.getBoundingClientRect()
  const px = (event.clientX - rect.left) * (canvas.width / rect.width) - LABEL_MARGIN
  const py = (event.clientY - rect.top) * (canvas.height / rect.height) - LABEL_MARGIN
  const x = Math.floor(px / layout.cellWidth)
  const y = Math.floor(py / layout.cellHeight)

  if (x < 0 || y < 0 || x >= pattern.size.stitches || y >= pattern.size.rows) return

  const next = paintCell(pattern, x, y, brush)
  if (next === pattern) return
  pattern = next

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = rgbToHex(pattern.palette[brush].yarn)
  ctx.fillRect(
    LABEL_MARGIN + x * layout.cellWidth,
    LABEL_MARGIN + y * layout.cellHeight,
    layout.cellWidth,
    layout.cellHeight
  )
}

// Settings that regenerate the pattern would wipe painted stitches, so lock them
function updateLock() {
  const locked = undoStack.length > 0
  $('inputs').querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = locked })
  $('lock-notice').hidden = !locked
  $('undo').disabled = !locked
}

function showError(message) {
  $('error').hidden = !message
  $('error').textContent = message ?? ''
}

function rgbToHex(rgb) {
  return '#' + rgb.map(channel => channel.toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex) {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
}

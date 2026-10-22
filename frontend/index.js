import { createPattern } from "../core/createPattern.js"
import { fromImageData } from "../core/fromImageData.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { setYarn } from "../core/patternEdits.js"
import { rowInstructions, formatInstruction } from "../core/rowInstructions.js"

// Longest image side kept after load; caps both work and max stitch count
const MAX_IMAGE_SIDE = 600
const MAX_CANVAS_WIDTH = 900
const MAX_CELL_WIDTH = 24
// Margin on every side for row and stitch numbers
const LABEL_MARGIN = 32
const LABEL_FONT = '11px system-ui, sans-serif'

const $ = id => document.getElementById(id)

let pixels = null
let pattern = null

$('image').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return

  pixels = await loadPixels(file)
  generate()
})

$('use-yarns').addEventListener('change', () => {
  $('yarn-pickers').hidden = !$('use-yarns').checked
  renderYarnPickers()
  generate()
})

$('yarn-count').addEventListener('change', renderYarnPickers)

// Any other input change regenerates the pattern
$('inputs').addEventListener('change', event => {
  if (event.target.id !== 'image' && event.target.id !== 'use-yarns') generate()
})

// Knitting options only change numbering and instructions, not the pattern
$('knit-method').addEventListener('change', () => { drawGrid(); renderInstructions() })
$('knit-start').addEventListener('change', () => { drawGrid(); renderInstructions() })

$('print').addEventListener('click', () => window.print())
$('save-png').addEventListener('click', savePng)

renderYarnPickers()

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
  if (!pixels) return

  try {
    pattern = createPattern({
      swatch: readSwatch(),
      pixels,
      yarnCount: Number($('yarn-count').value),
      yarns: readYarns(),
      desiredWidth: { unit: $('width-unit').value, value: Number($('width-value').value) }
    })
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

    const label = document.createElement('span')
    label.className = 'yarn-label'
    label.textContent = yarnLabel(i)

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

  drawLabels(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, options })
  ctx.restore()
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

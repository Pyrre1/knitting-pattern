import { createPattern } from "../core/createPattern.js"
import { fromImageData } from "../core/fromImageData.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { setYarn } from "../core/patternEdits.js"

// Longest image side kept after load; caps both work and max stitch count
const MAX_IMAGE_SIDE = 600
const MAX_CANVAS_WIDTH = 900
const MAX_CELL_WIDTH = 24

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

    const source = document.createElement('span')
    source.className = 'swatch'
    source.style.background = rgbToHex(entry.source)
    source.title = 'Image colour'

    const yarn = document.createElement('input')
    yarn.type = 'color'
    yarn.value = rgbToHex(entry.yarn)
    yarn.title = 'Yarn colour'
    yarn.addEventListener('input', () => {
      pattern = setYarn(pattern, i, hexToRgb(yarn.value))
      drawGrid()
    })

    li.append(source, ' → ', yarn, ` ${counts[i]} stitches`)
    return li
  }))

  drawGrid()
}

function drawGrid() {
  const { grid, palette, size } = pattern
  const gauge = gaugeInterpreter(readSwatch())

  // Knitted stitches are wider than tall: cell height = width × stitch/row ratio
  const cellWidth = Math.min(MAX_CELL_WIDTH, MAX_CANVAS_WIDTH / size.stitches)
  const cellHeight = cellWidth * (gauge.stitchesPerCm / gauge.rowsPerCm)

  const canvas = $('grid')
  canvas.width = Math.ceil(cellWidth * size.stitches)
  canvas.height = Math.ceil(cellHeight * size.rows)
  const ctx = canvas.getContext('2d')

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
      ctx.lineTo(Math.round(x * cellWidth) + 0.5, canvas.height)
    }
    for (let y = 0; y <= size.rows; y++) {
      ctx.moveTo(0, Math.round(y * cellHeight) + 0.5)
      ctx.lineTo(canvas.width, Math.round(y * cellHeight) + 0.5)
    }
    ctx.stroke()
  }
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

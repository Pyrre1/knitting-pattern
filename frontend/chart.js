import { rowInstructions } from "../core/rowInstructions.js"

const MAX_CANVAS_WIDTH = 900
const MAX_CELL_WIDTH = 24
// Margin on every side for row and stitch numbers
export const LABEL_MARGIN = 32
const LABEL_FONT = "11px system-ui, sans-serif"
// Stitch view needs room for a visible V; smaller cells fall back to flat colour
export const MIN_STITCH_CELL = 6
// Guide lines: every 5th between the plain grid line (0.15) and the every 10th
const GUIDES = [
  { step: 5, colour: "rgba(0, 0, 0, 0.25)", width: 1 },
  { step: 10, colour: "rgba(0, 0, 0, 0.38)", width: 1.5 },
]

// Screen cell size: fits the chart in the page width.
// Knitted stitches are wider than tall: cell height = width × stitch/row ratio
export function fitCellSize(stitches, gauge) {
  const cellWidth = Math.min(MAX_CELL_WIDTH, (MAX_CANVAS_WIDTH - 2 * LABEL_MARGIN) / stitches)
  return { cellWidth, cellHeight: cellWidth * (gauge.stitchesPerCm / gauge.rowsPerCm) }
}

// Draws the chart, or only region { x, y, stitches, rows } of it (a print tile), with numbers
// and guide lines counted on the whole chart. Sizes are in CSS px; scale > 1 draws a sharper
// backing canvas. Returns the layout used, in unscaled units, for drawCell.
export function drawChart(
  canvas,
  { grid, palette, options, cellWidth, cellHeight, rowHelp, stitchView, scale = 1, region },
) {
  const size = { stitches: grid[0].length, rows: grid.length }
  const area = region ?? { x: 0, y: 0, ...size }
  const gridWidth = cellWidth * area.stitches
  const gridHeight = cellHeight * area.rows
  const instructions = rowInstructions(grid, options)
  // Displayed rows knitted on the wrong side, shaded when row help is on
  const shadedRows =
    options.method === "flat" && rowHelp
      ? new Set(instructions.filter((row) => row.side === "WS").map((row) => row.displayRow))
      : new Set()
  const layout = { cellWidth, cellHeight, shadedRows, stitchView, topDown: options.start === "top" }

  canvas.width = Math.ceil((gridWidth + 2 * LABEL_MARGIN) * scale)
  canvas.height = Math.ceil((gridHeight + 2 * LABEL_MARGIN) * scale)
  const ctx = canvas.getContext("2d")

  // Opaque background so the saved PNG is not transparent
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Labels sit in a margin on every side; the grid is drawn inside it, shifted so the region starts at 0
  ctx.save()
  ctx.scale(scale, scale)
  ctx.translate(LABEL_MARGIN, LABEL_MARGIN)
  ctx.save()
  ctx.translate(-area.x * cellWidth, -area.y * cellHeight)
  const xEnd = area.x + area.stitches
  const yEnd = area.y + area.rows

  if (stitchView) {
    const cells = []
    for (let y = area.y; y < yEnd; y++) {
      for (let x = area.x; x < xEnd; x++) cells.push({ x, y, index: grid[y][x] })
    }
    drawStitches(ctx, layout, palette, cells)
  } else {
    const colours = palette.map((entry) => rgbToHex(entry.yarn))
    for (let y = area.y; y < yEnd; y++) {
      for (let x = area.x; x < xEnd; x++) {
        ctx.fillStyle = colours[grid[y][x]]
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
      }
    }
  }

  // One path per yarn, since light and dark yarns get opposite shades
  const shades = palette.map(() => new Path2D())
  for (const y of shadedRows) {
    if (y < area.y || y >= yEnd) continue
    for (let x = area.x; x < xEnd; x++)
      shades[grid[y][x]].rect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
  }
  palette.forEach((entry, i) => {
    ctx.fillStyle = rowHelpShade(entry.yarn)
    ctx.fill(shades[i])
  })
  ctx.restore()

  const geometry = { cellWidth, cellHeight, gridWidth, gridHeight, size, area, options }
  // Grid lines only when cells are big enough to see them; stitches show their own edges
  if (cellWidth >= 6 && !stitchView) drawGridLines(ctx, geometry)
  drawGuideLines(ctx, geometry)
  drawLabels(ctx, geometry, instructions)
  ctx.restore()
  return layout
}

// One stitch, after painting; layout from the last drawChart on this canvas
export function drawCell(canvas, layout, palette, { x, y, index }) {
  const ctx = canvas.getContext("2d")
  const cell = [
    LABEL_MARGIN + x * layout.cellWidth,
    LABEL_MARGIN + y * layout.cellHeight,
    layout.cellWidth,
    layout.cellHeight,
  ]
  if (layout.stitchView) {
    ctx.save()
    ctx.translate(LABEL_MARGIN, LABEL_MARGIN)
    drawStitches(ctx, layout, palette, [{ x, y, index }])
    ctx.restore()
  } else {
    ctx.fillStyle = rgbToHex(palette[index].yarn)
    ctx.fillRect(...cell)
  }
  // Keep the row help shade on painted stitches
  if (layout.shadedRows.has(y)) {
    ctx.fillStyle = rowHelpShade(palette[index].yarn)
    ctx.fillRect(...cell)
  }
}

// Stitch view: each stitch is a V of two tilted legs on a gap, darker for light
// yarns and lighter for dark ones. Knitted top down the chart hangs upside down, so legs form a Λ.
// Legs are batched into one path per yarn, so large grids stay one fill per colour.
function drawStitches(ctx, { cellWidth, cellHeight, topDown }, palette, cells) {
  const legs = palette.map(() => new Path2D())
  const tilt = (topDown ? -1 : 1) * Math.atan2(cellWidth * 0.4, cellHeight)
  const radiusX = cellWidth * 0.2
  const radiusY = cellHeight * 0.5

  palette.forEach((entry, i) => {
    ctx.fillStyle = rgbToHex(stitchGap(entry.yarn))
    for (const { x, y, index } of cells) {
      if (index === i) ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight)
    }
  })

  for (const { x, y, index } of cells) {
    const centreY = (y + 0.5) * cellHeight
    for (const [offset, rotation] of [
      [0.28, -tilt],
      [0.72, tilt],
    ]) {
      const centreX = (x + offset) * cellWidth
      // Start a new subpath so legs are not joined by a line
      legs[index].moveTo(centreX + radiusX * Math.cos(rotation), centreY + radiusX * Math.sin(rotation))
      legs[index].ellipse(centreX, centreY, radiusX, radiusY, rotation, 0, 2 * Math.PI)
    }
  }

  palette.forEach((entry, i) => {
    ctx.fillStyle = rgbToHex(entry.yarn)
    ctx.fill(legs[i])
  })
}

function stitchGap(yarn) {
  return isLight(yarn)
    ? yarn.map((channel) => Math.round(channel * 0.6))
    : yarn.map((channel) => Math.round(channel + (255 - channel) * 0.35))
}

function drawGridLines(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, area }) {
  ctx.strokeStyle = cssVar("--grid-line")
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= area.stitches; x++) {
    ctx.moveTo(Math.round(x * cellWidth) + 0.5, 0)
    ctx.lineTo(Math.round(x * cellWidth) + 0.5, gridHeight)
  }
  for (let y = 0; y <= area.rows; y++) {
    ctx.moveTo(0, Math.round(y * cellHeight) + 0.5)
    ctx.lineTo(gridWidth, Math.round(y * cellHeight) + 0.5)
  }
  ctx.stroke()
}

// Guide lines every 5th and 10th stitch/row, counted from stitch 1 and row 1
// so they line up with the numbering. Drawn even when cells are too small for grid lines.
// A tile also gets them on its edges, but the chart's own outer edges get none.
function drawGuideLines(ctx, { cellWidth, cellHeight, gridWidth, gridHeight, size, area, options }) {
  const fromBottom = options.start === "bottom"

  for (const { step, colour, width } of GUIDES) {
    // Leave positions to a coarser guide so overlapping strokes don't darken
    const isGuide = (counted) =>
      counted % step === 0 && !GUIDES.some((guide) => guide.step > step && counted % guide.step === 0)

    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.beginPath()

    for (let line = 0; line <= area.stitches; line++) {
      const absolute = area.x + line
      if (absolute <= 0 || absolute >= size.stitches) continue
      if (!isGuide(fromBottom ? size.stitches - absolute : absolute)) continue
      ctx.moveTo(Math.round(line * cellWidth) + 0.5, 0)
      ctx.lineTo(Math.round(line * cellWidth) + 0.5, gridHeight)
    }

    for (let line = 0; line <= area.rows; line++) {
      const absolute = area.y + line
      if (absolute <= 0 || absolute >= size.rows) continue
      if (!isGuide(fromBottom ? size.rows - absolute : absolute)) continue
      ctx.moveTo(0, Math.round(line * cellHeight) + 0.5)
      ctx.lineTo(gridWidth, Math.round(line * cellHeight) + 0.5)
    }

    ctx.stroke()
  }
}

// Each row number sits on the side where that row starts (flat: odd and even on
// opposite sides). Stitch 1 is where RS rows start, numbered along the starting edge.
function drawLabels(
  ctx,
  { cellWidth, cellHeight, gridWidth, gridHeight, size, area, options },
  instructions,
) {
  ctx.fillStyle = "#444"
  ctx.font = LABEL_FONT

  const rowStep = labelStep(cellHeight)
  ctx.textBaseline = "middle"
  for (const { number, displayRow, direction } of instructions) {
    if (number !== 1 && number % rowStep !== 0) continue
    if (displayRow < area.y || displayRow >= area.y + area.rows) continue

    const y = (displayRow - area.y + 0.5) * cellHeight
    if (direction === "rtl") {
      ctx.textAlign = "left"
      ctx.fillText(String(number), gridWidth + 4, y)
    } else {
      ctx.textAlign = "right"
      ctx.fillText(String(number), -4, y)
    }
  }

  const fromBottom = options.start === "bottom"
  const stitchStep = labelStep(cellWidth)
  ctx.textAlign = "center"
  ctx.textBaseline = fromBottom ? "top" : "bottom"
  for (let number = 1; number <= size.stitches; number++) {
    if (number !== 1 && number % stitchStep !== 0) continue

    // Bottom up: stitch 1 at the right. Top down: stitch 1 at the left.
    const x = (fromBottom ? size.stitches - number : number - 1) - area.x
    if (x < 0 || x >= area.stitches) continue
    ctx.fillText(String(number), (x + 0.5) * cellWidth, fromBottom ? gridHeight + 4 : -4)
  }
}

// Label every cell when there is room, otherwise every 5th or 10th
function labelStep(cellSize) {
  if (cellSize >= 14) return 1
  if (cellSize >= 4) return 5
  return 10
}

// Row help darkens light yarns and lightens dark ones, so it shows on both
function rowHelpShade(yarn) {
  return cssVar(isLight(yarn) ? "--row-help-dark" : "--row-help-light")
}

export function isLight([r, g, b]) {
  return 0.299 * r + 0.587 * g + 0.114 * b > 150
}

export function rgbToHex(rgb) {
  return "#" + rgb.map((channel) => channel.toString(16).padStart(2, "0")).join("")
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}

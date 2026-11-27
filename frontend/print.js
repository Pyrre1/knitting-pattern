import { APP_NAME } from "./config.js"
import { translate, formatNumber, getLanguage } from "./i18n.js"
import { drawChart, fitCellSize, LABEL_MARGIN } from "./chart.js"
import { gaugeInterpreter } from "../core/gaugeInterpreter.js"
import { planTiles } from "../core/printTiles.js"

const CM_PER_INCH = 2.54
// Print draws a separate chart this many times sharper, so CSS can fit it to the page
const MAX_PRINT_SCALE = 3
// Stays under browser canvas limits (Safari ~16.7 M pixels)
const MAX_PRINT_PIXELS = 16_000_000
const PNG_FONT_SIZE = 13
const PNG_LINE_HEIGHT = 20
const PNG_PADDING = 16
// Print in scale: CSS px are 1/96 inch on paper
const PX_PER_MM = 96 / 25.4
// Matches @page margin in style.css
const PAGE_MARGIN_MM = 10
// cm → A4; inch → paper size select (Letter or A4)
const PAPER_MM = { a4: { short: 210, long: 297 }, letter: { short: 215.9, long: 279.4 } }
// Room for the tile caption, plus slack for browser rounding
const CAPTION_PX = 28
const TILE_SLACK = 0.95
// Tile pages are a little shorter than the page, so rounding never spills onto a blank page
const PAGE_SLACK_MM = 3
// Column beside A1 on page 1: info, yarns, tile map
const SIDEBAR_MM = 55
// Tiles are drawn about 200 dpi
const TILE_SCALE = 2
// Rough guess for the page estimate
const INSTRUCTIONS_PER_PAGE = 45
const CONFIRM_PAGES = 4

const byId = (id) => document.getElementById(id)

// Print / Save PDF, paper size and orientation, print in scale (split into page tiles),
// print-only info block and PNG export.
// getInfo() returns the current pattern settings (see infoLines);
// chart() returns drawChart settings without cell size; ask(reasons, title) confirms.
// Returns updatePaper(), to call when a pattern is rendered (the swatch unit picks the paper).
// Normal print leaves paper and orientation to the print dialog; print in scale sets them,
// since tiles are planned before the dialog opens and it does not report changes back.
export function initPrint({ getInfo, chart, ask }) {
  const pageRule = createPageRule()
  const updatePaper = () => {
    document.querySelectorAll(".scale-option").forEach((element) => {
      element.hidden = !inScale()
    })
    byId("paper-size-option").hidden = !inScale() || getInfo().swatch.unit !== "inch"
    setPage(pageRule, inScale() ? `${paperSize(getInfo())} ${byId("paper").value}` : null)
  }
  for (const id of ["paper", "paper-size", "print-in-scale"]) byId(id).addEventListener("change", updatePaper)
  // Moved into the side column on page 1 while printing, then put back
  let moved = []

  byId("print").addEventListener("click", async () => {
    const pages = estimatePages(chart())
    if (pages > CONFIRM_PAGES && !(await ask([["printPages", { pages }], "duplexTip"], "printPagesTitle")))
      return
    window.print()
  })
  byId("print-instructions").addEventListener("change", () => {
    byId("result").classList.toggle("chart-only", !byId("print-instructions").checked)
  })
  byId("save-png").addEventListener("click", () =>
    savePng(byId("png-info").checked ? infoLines(getInfo()) : null),
  )

  // Ctrl+P also lands here, not only the button
  window.addEventListener("beforeprint", () => {
    if (byId("result").hidden) return
    updatePaper()
    renderInfoBlock(infoLines(getInfo()))
    if (inScale()) {
      moved = renderTiles(chart(), getInfo())
    } else {
      drawPrintChart(chart(), getInfo())
    }
  })
  window.addEventListener("afterprint", () => {
    if (byId("result").hidden) return
    moved.forEach(({ node, parent, next }) => parent.insertBefore(node, next))
    moved = []
    byId("print-tiles").replaceChildren()
    byId("result").classList.remove("tiled", "side-layout")
    // Frees the large backing canvas
    byId("print-chart").width = 0
    byId("print-chart").height = 0
  })

  // Tile size depends on the gauge, so the estimate is computed when needed
  function estimatePages(settings) {
    const tiles = inScale() ? tileLayout(settings.grid, getInfo()).plan.tiles.length : 0
    const instructions = byId("print-instructions").checked
      ? Math.ceil(settings.grid.length / INSTRUCTIONS_PER_PAGE)
      : 0
    // Page 1: info, yarns and the chart or tile A1 (when it fits; else it moves on)
    return Math.max(1, tiles) + instructions
  }
  return updatePaper
}

function inScale() {
  return byId("print-in-scale").checked
}

function paperSize(info) {
  return info.swatch.unit === "inch" ? byId("paper-size").value : "a4"
}

// 100 % = one cell is one real stitch, from the gauge
function scaledCells(gauge) {
  const factor = (PX_PER_MM * Math.max(1, Number(byId("print-scale").value) || 100)) / 100
  return { cellWidth: (10 / gauge.stitchesPerCm) * factor, cellHeight: (10 / gauge.rowsPerCm) * factor }
}

// Page content size in mm (inside the @page margin)
function pageArea(info) {
  const paper = PAPER_MM[paperSize(info)]
  const landscape = byId("paper").value === "landscape"
  return {
    width: (landscape ? paper.long : paper.short) - 2 * PAGE_MARGIN_MM,
    height: (landscape ? paper.short : paper.long) - 2 * PAGE_MARGIN_MM,
  }
}

// Tiles fill a page each. Page 1 has a side column beside A1: when A1 leaves no room for it,
// the first column of tiles is planned narrower. A single tile that leaves no room goes under the info.
function tileLayout(grid, info) {
  const page = pageArea(info)
  const cells = scaledCells(gaugeInterpreter(info.swatch))
  const gridArea = (widthMm) => (widthMm * PX_PER_MM - 2 * LABEL_MARGIN) * TILE_SLACK
  const common = {
    stitches: grid[0].length,
    rows: grid.length,
    ...cells,
    areaWidth: gridArea(page.width),
    areaHeight: (page.height * PX_PER_MM - 2 * LABEL_MARGIN - CAPTION_PX) * TILE_SLACK,
  }
  let plan = planTiles(common)
  const firstWidth = plan.tiles[0].stitches * cells.cellWidth + 2 * LABEL_MARGIN
  const room = page.width * PX_PER_MM - firstWidth >= SIDEBAR_MM * PX_PER_MM
  if (!room && plan.tiles.length > 1) {
    plan = planTiles({ ...common, firstAreaWidth: gridArea(page.width - SIDEBAR_MM) })
  }
  return { plan, page, cells, sidebar: room || plan.tiles.length > 1 }
}

// One canvas per page tile at real size, with a caption. Each tile sits against the edges where it
// joins its neighbours (top row at the page bottom, left column at the page right …), so one
// straight cut per join is enough. Returns the nodes moved into the side column.
function renderTiles(settings, info) {
  const { plan, page, cells, sidebar } = tileLayout(settings.grid, info)
  const multiple = plan.tiles.length > 1
  const figures = plan.tiles.map((tile, i) => {
    const canvas = document.createElement("canvas")
    const width = tile.stitches * cells.cellWidth + 2 * LABEL_MARGIN
    const height = tile.rows * cells.cellHeight + 2 * LABEL_MARGIN
    const scale = Math.min(TILE_SCALE, Math.sqrt(MAX_PRINT_PIXELS / (width * height)))
    drawChart(canvas, { ...settings, ...cells, scale, region: tile })
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const figure = document.createElement("figure")
    figure.className = "print-tile"
    const caption = document.createElement("figcaption")
    caption.textContent = multiple
      ? tileCaption(tile, settings)
      : translate("printScaleCaption", { scale: byId("print-scale").value })
    figure.append(caption, canvas)
    if (multiple) {
      const down = Math.floor(i / plan.across)
      const across = i % plan.across
      // 100 %, not mm: a page that is a hair too wide makes Chrome shrink the whole print
      figure.style.width = "100%"
      // The last row sits at the page top anyway; no full-page box, so the footer fits under it
      if (down < plan.down - 1) figure.style.height = `${page.height - PAGE_SLACK_MM}mm`
      figure.style.justifyContent = edge(down, plan.down)
      figure.style.alignItems = edge(across, plan.across)
      // Caption on the outer side, away from the join
      if (plan.down > 1 && down === plan.down - 1) figure.append(caption)
    }
    return figure
  })

  byId("result").classList.add("tiled")
  if (!sidebar) {
    byId("print-tiles").replaceChildren(...figures)
    return []
  }

  const nodes = [byId("print-info"), byId("palette")]
  const moved = nodes.map((node) => ({ node, parent: node.parentNode, next: node.nextSibling }))
  const side = document.createElement("div")
  side.className = "print-sidebar"
  side.append(...nodes, ...(multiple ? [tileOverview(plan)] : []))
  const first = document.createElement("div")
  first.className = "first-page"
  // A1 only as wide as itself, so the side column takes the rest
  figures[0].style.width = ""
  first.append(side, figures[0])
  byId("print-tiles").replaceChildren(first, ...figures.slice(1))
  byId("result").classList.add("side-layout")
  return moved
}

// First tile row/column at the far (end) edge, last at the start edge, middle ones centred
function edge(index, count) {
  if (count === 1 || index === count - 1) return "flex-start"
  return index === 0 ? "flex-end" : "center"
}

// Tile name with its knitting row and stitch numbers, e.g. "A2 · rows 41–80 · stitches 1–60"
function tileCaption(tile, { grid, options }) {
  const fromBottom = options.start === "bottom"
  const range = (start, count, total) => {
    const [a, b] = [start, start + count - 1]
      .map((i) => (fromBottom ? total - i : i + 1))
      .sort((m, n) => m - n)
    return `${a}–${b}`
  }
  return translate("tileCaption", {
    name: tile.name,
    rows: range(tile.y, tile.rows, grid.length),
    stitches: range(tile.x, tile.stitches, grid[0].length),
    scale: byId("print-scale").value,
  })
}

// Map of tile names as they are taped together
function tileOverview({ across, tiles }) {
  const section = document.createElement("div")
  // Cells shaped like the page: wider than tall for landscape, taller for portrait
  section.className = byId("paper").value === "landscape" ? "tile-overview" : "tile-overview portrait"
  const title = document.createElement("p")
  title.textContent = translate("tileOverview", { count: tiles.length })
  const table = document.createElement("table")
  for (let i = 0; i < tiles.length; i += across) {
    const tr = table.insertRow()
    tiles.slice(i, i + across).forEach((tile) => {
      tr.insertCell().textContent = tile.name
    })
  }
  section.append(title, table)
  return section
}

// [label, value] pairs, the same for print and PNG; the last pair is the footer (no label)
export function infoLines({ swatch, size, widthUnit, letter, rotate, options }) {
  const swatchUnit = unitName(swatch.unit)
  // Final size follows the width unit; a width in stitches falls back to the swatch unit
  const lengthUnit = widthUnit === "stitches" ? swatch.unit : widthUnit
  const length = (cm) => formatNumber(lengthUnit === "inch" ? cm / CM_PER_INCH : cm, 1)

  const lines = [
    [
      translate("infoGauge"),
      translate("infoGaugeValue", {
        stitches: swatch.stitches,
        rows: swatch.rows,
        width: formatNumber(swatch.width, swatch.width % 1 ? 1 : 0),
        height: formatNumber(swatch.height, swatch.height % 1 ? 1 : 0),
        unit: swatchUnit,
      }),
    ],
    [
      translate("infoSize"),
      translate("infoSizeValue", {
        stitches: size.stitches,
        rows: size.rows,
        width: length(size.widthCm),
        height: length(size.heightCm),
        unit: unitName(lengthUnit),
      }),
    ],
  ]
  if (letter) {
    lines.push([
      translate("infoLetter"),
      translate(letter.inStitches ? "infoLetterStitches" : "infoLetterRows", {
        n: letter.count,
        length: length(letter.cm),
        unit: unitName(lengthUnit),
      }),
    ])
  }
  // Rarely used, so only shown when chosen
  if (rotate === "180") lines.push([translate("infoUpsideDown"), translate("yes")])
  if (rotate === "right" || rotate === "left") {
    lines.push([translate("infoRotated"), translate(rotate === "right" ? "rotateRight" : "rotateLeft")])
  }
  lines.push([
    translate("infoSetup"),
    `${translate(options.start === "top" ? "topDown" : "bottomUp")}, ${translate(options.method)}`,
  ])
  lines.push(["", footer()])
  return lines
}

// The address is stated in words, so it reads as credit even when the browser also prints it
function footer() {
  const url = location.host + location.pathname.replace(/index\.html$/, "")
  const site = APP_NAME ? `${APP_NAME} - ${url}` : url
  const date = new Date().toLocaleDateString(getLanguage())
  return `${translate("createdAt", { site })} · ${date} · ${translate("prototype")}`
}

function unitName(unit) {
  return unit === "inch" ? translate("unitInch") : "cm"
}

function renderInfoBlock(lines) {
  const items = lines.slice(0, -1).flatMap(([label, value]) => {
    const dt = document.createElement("dt")
    dt.textContent = label
    const dd = document.createElement("dd")
    dd.textContent = value
    return [dt, dd]
  })
  byId("print-info-list").replaceChildren(...items)
  byId("print-footer").textContent = lines.at(-1)[1]
}

// CSP allows no inline <style>, but CSSOM rules on our own stylesheet are fine
function createPageRule() {
  const sheet =
    [...document.styleSheets].find((s) => s.href?.endsWith("style.css")) ?? document.styleSheets[0]
  return { sheet, rule: null }
}

// size e.g. 'a4 portrait', or null to leave paper to the print dialog; Firefox may ignore it
function setPage(pageRule, size) {
  const { sheet } = pageRule
  if (pageRule.rule) {
    const index = [...sheet.cssRules].indexOf(pageRule.rule)
    if (index >= 0) sheet.deleteRule(index)
  }
  pageRule.rule = null
  if (!size) return
  const index = sheet.insertRule(`@page { size: ${size}; }`, sheet.cssRules.length)
  pageRule.rule = sheet.cssRules[index]
}

// Print-only copy of the chart with a larger backing canvas; the on-screen chart is left alone,
// so nothing changes behind the print dialog. Print CSS shrinks it to the page width or height,
// whichever is tighter.
function drawPrintChart(settings, info) {
  const cells = fitCellSize(settings.grid[0].length, gaugeInterpreter(info.swatch))
  const pixels =
    (settings.grid[0].length * cells.cellWidth + 2 * LABEL_MARGIN) *
    (settings.grid.length * cells.cellHeight + 2 * LABEL_MARGIN)
  const scale = Math.max(1, Math.min(MAX_PRINT_SCALE, Math.sqrt(MAX_PRINT_PIXELS / pixels)))
  drawChart(byId("print-chart"), { ...settings, ...cells, scale })
}

// Chart as shown; with lines, an info strip is added under it
function savePng(lines) {
  const chart = byId("grid")
  const canvas = lines ? withInfoStrip(chart, lines) : chart
  canvas.toBlob((blob) => {
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "knitting-pattern.png"
    link.click()
    // Revoking straight away can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  })
}

function withInfoStrip(chart, lines) {
  const texts = lines.map(([label, value]) => (label ? `${label}: ${value}` : value))
  const measure = document.createElement("canvas").getContext("2d")
  measure.font = `${PNG_FONT_SIZE}px system-ui, sans-serif`
  const textWidth = Math.max(...texts.map((text) => measure.measureText(text).width))

  const canvas = document.createElement("canvas")
  canvas.width = Math.ceil(Math.max(chart.width, textWidth + 2 * PNG_PADDING))
  canvas.height = chart.height + texts.length * PNG_LINE_HEIGHT + PNG_PADDING
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(chart, 0, 0)

  ctx.fillStyle = "#000000"
  ctx.font = measure.font
  ctx.textBaseline = "top"
  texts.forEach((text, i) => {
    // Footer in grey, like on paper
    if (i === texts.length - 1) ctx.fillStyle = "#666666"
    ctx.fillText(text, PNG_PADDING, chart.height + i * PNG_LINE_HEIGHT)
  })
  return canvas
}

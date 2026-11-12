import { APP_NAME } from './config.js'
import { translate, formatNumber, getLanguage } from './i18n.js'

const CM_PER_INCH = 2.54
// Print redraws the chart this many times sharper, so CSS can fit it to the page
const MAX_PRINT_SCALE = 3
// Stays under browser canvas limits (Safari ~16.7 M pixels)
const MAX_PRINT_PIXELS = 16_000_000
const PNG_FONT_SIZE = 13
const PNG_LINE_HEIGHT = 20
const PNG_PADDING = 16

const byId = id => document.getElementById(id)

// Print / Save PDF, paper orientation, print-only info block and PNG export.
// getInfo() returns the current pattern settings (see infoLines); redraw(scale) redraws the chart.
export function initPrint({ getInfo, redraw }) {
  const pageRule = createPageRule()
  setOrientation(pageRule, byId('paper').value)
  byId('paper').addEventListener('change', () => setOrientation(pageRule, byId('paper').value))

  byId('print').addEventListener('click', () => window.print())
  byId('print-instructions').addEventListener('change', () => {
    byId('result').classList.toggle('chart-only', !byId('print-instructions').checked)
  })
  byId('save-png').addEventListener('click', () => savePng(byId('png-info').checked ? infoLines(getInfo()) : null))

  // Ctrl+P also lands here, not only the button
  window.addEventListener('beforeprint', () => {
    if (byId('result').hidden) return
    renderInfoBlock(infoLines(getInfo()))
    redraw(printScale(byId('grid')))
  })
  window.addEventListener('afterprint', () => {
    if (!byId('result').hidden) redraw(1)
  })
}

// [label, value] pairs, the same for print and PNG; the last pair is the footer (no label)
export function infoLines({ swatch, size, widthUnit, letter, rotate, options }) {
  const swatchUnit = unitName(swatch.unit)
  // Final size follows the width unit; a width in stitches falls back to the swatch unit
  const lengthUnit = widthUnit === 'stitches' ? swatch.unit : widthUnit
  const length = cm => formatNumber(lengthUnit === 'inch' ? cm / CM_PER_INCH : cm, 1)

  const lines = [
    [translate('infoGauge'), translate('infoGaugeValue', {
      stitches: swatch.stitches,
      rows: swatch.rows,
      width: formatNumber(swatch.width, swatch.width % 1 ? 1 : 0),
      height: formatNumber(swatch.height, swatch.height % 1 ? 1 : 0),
      unit: swatchUnit
    })],
    [translate('infoSize'), translate('infoSizeValue', {
      stitches: size.stitches,
      rows: size.rows,
      width: length(size.widthCm),
      height: length(size.heightCm),
      unit: unitName(lengthUnit)
    })]
  ]
  if (letter) {
    lines.push([translate('infoLetter'), translate(letter.inStitches ? 'infoLetterStitches' : 'infoLetterRows', {
      n: letter.count,
      length: length(letter.cm),
      unit: unitName(lengthUnit)
    })])
  }
  // Rarely used, so only shown when chosen
  if (rotate === '180') lines.push([translate('infoUpsideDown'), translate('yes')])
  if (rotate === 'right' || rotate === 'left') {
    lines.push([translate('infoRotated'), translate(rotate === 'right' ? 'rotateRight' : 'rotateLeft')])
  }
  lines.push([translate('infoSetup'), `${translate(options.start === 'top' ? 'topDown' : 'bottomUp')}, ${translate(options.method)}`])
  lines.push(['', footer()])
  return lines
}

// The address is stated in words, so it reads as credit even when the browser also prints it
function footer() {
  const url = location.host + location.pathname.replace(/index\.html$/, '')
  const site = APP_NAME ? `${APP_NAME} - ${url}` : url
  const date = new Date().toLocaleDateString(getLanguage())
  return `${translate('createdAt', { site })} · ${date} · ${translate('prototype')}`
}

function unitName(unit) {
  return unit === 'inch' ? translate('unitInch') : 'cm'
}

function renderInfoBlock(lines) {
  const items = lines.slice(0, -1).flatMap(([label, value]) => {
    const dt = document.createElement('dt')
    dt.textContent = label
    const dd = document.createElement('dd')
    dd.textContent = value
    return [dt, dd]
  })
  byId('print-info-list').replaceChildren(...items)
  byId('print-footer').textContent = lines.at(-1)[1]
}

// CSP allows no inline <style>, but CSSOM rules on our own stylesheet are fine
function createPageRule() {
  const sheet = [...document.styleSheets].find(s => s.href?.endsWith('style.css')) ?? document.styleSheets[0]
  return { sheet, rule: null }
}

function setOrientation(pageRule, orientation) {
  const { sheet } = pageRule
  if (pageRule.rule) {
    const index = [...sheet.cssRules].indexOf(pageRule.rule)
    if (index >= 0) sheet.deleteRule(index)
  }
  const index = sheet.insertRule(`@page { size: ${orientation === 'landscape' ? 'landscape' : 'portrait'}; }`, sheet.cssRules.length)
  pageRule.rule = sheet.cssRules[index]
}

// Larger backing canvas; print CSS shrinks it to the page width or height, whichever is tighter
function printScale(canvas) {
  const pixels = canvas.width * canvas.height
  return Math.max(1, Math.min(MAX_PRINT_SCALE, Math.sqrt(MAX_PRINT_PIXELS / pixels)))
}

// Chart as shown; with lines, an info strip is added under it
function savePng(lines) {
  const chart = byId('grid')
  const canvas = lines ? withInfoStrip(chart, lines) : chart
  canvas.toBlob(blob => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'knitting-pattern.png'
    link.click()
    // Revoking straight away can cancel the download in some browsers
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  })
}

function withInfoStrip(chart, lines) {
  const texts = lines.map(([label, value]) => label ? `${label}: ${value}` : value)
  const measure = document.createElement('canvas').getContext('2d')
  measure.font = `${PNG_FONT_SIZE}px system-ui, sans-serif`
  const textWidth = Math.max(...texts.map(text => measure.measureText(text).width))

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(Math.max(chart.width, textWidth + 2 * PNG_PADDING))
  canvas.height = chart.height + texts.length * PNG_LINE_HEIGHT + PNG_PADDING
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(chart, 0, 0)

  ctx.fillStyle = '#000000'
  ctx.font = measure.font
  ctx.textBaseline = 'top'
  texts.forEach((text, i) => {
    // Footer in grey, like on paper
    if (i === texts.length - 1) ctx.fillStyle = '#666666'
    ctx.fillText(text, PNG_PADDING, chart.height + i * PNG_LINE_HEIGHT)
  })
  return canvas
}

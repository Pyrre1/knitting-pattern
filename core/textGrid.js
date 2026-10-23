import { computeCellSizes } from "./accumulator.js"
import { gaugeInterpreter } from "./gaugeInterpreter.js"
import { imageScaler } from "./imageScaler.js"
import { pairYarns } from "./pairYarns.js"
import { buildPattern } from "./patternEdits.js"

const BACKGROUND = [255, 255, 255]
const INK = [0, 0, 0]

// Text is built letter by letter at stitch size, so every copy of a letter is identical.
// Glyph = 2D array of 0 (background) / 1 (ink), all glyphs the same height.

// Rendered letter pixels → glyph of `rows` rows, narrowed for stitches wider than rows are tall
export function toGlyph(pixels, rows, gauge) {
  const aspect = pixels[0].length / pixels.length
  const stitches = Math.max(1, Math.round(aspect * rows * gauge.stitchesPerCm / gauge.rowsPerCm))

  return imageScaler(pixels, { stitches, rows }).map(row =>
    row.map(([r, g, b]) => (r + g + b) / 3 < 128 ? 1 : 0)
  )
}

// Fixed `spacing` stitches between glyphs, or fill `width` by spreading the spare stitches
export function composeText(glyphs, text, { spacing = 1, width, lineSpacing = 1 } = {}) {
  const lines = text.split('\n').map(line => [...line].map(char => {
    if (!glyphs[char]) throw new Error(`no glyph for "${char}"`)
    return glyphs[char]
  }))
  const glyphRows = lines.flat()[0]?.length ?? 0

  const composed = lines.map(line => {
    const inkWidth = line.reduce((sum, glyph) => sum + glyph[0].length, 0)
    const gapCount = Math.max(0, line.length - 1)
    let gaps = new Array(gapCount).fill(spacing)

    if (width !== undefined) {
      if (inkWidth > width) throw new Error(`text is ${inkWidth} stitches wide, more than ${width}`)
      if (gapCount > 0) gaps = computeCellSizes(width - inkWidth, gapCount)
    }

    return Array.from({ length: glyphRows }, (_, y) =>
      line.flatMap((glyph, i) => i < gapCount ? [...glyph[y], ...new Array(gaps[i]).fill(0)] : glyph[y])
    )
  })

  const gridWidth = width ?? Math.max(...composed.map(line => line[0]?.length ?? 0))
  const blankRow = () => new Array(gridWidth).fill(0)

  return composed.flatMap((line, i) => {
    const lineWidth = line[0]?.length ?? 0
    const left = Math.floor((gridWidth - lineWidth) / 2)
    const right = gridWidth - lineWidth - left
    const rows = line.map(row => [...new Array(left).fill(0), ...row, ...new Array(right).fill(0)])
    const gap = i < composed.length - 1 ? Array.from({ length: lineSpacing }, blankRow) : []
    return [...rows, ...gap]
  })
}

// Most rows in 1..maxRows whose composed width fits; width grows with rows, so binary search
export function fitRows(widthAt, maxWidth, maxRows) {
  if (widthAt(1) > maxWidth) throw new Error(`text does not fit ${maxWidth} stitches`)

  let low = 1
  let high = maxRows
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (widthAt(middle) <= maxWidth) low = middle
    else high = middle - 1
  }
  return low
}

// 0/1 grid → pattern with background as palette entry 0 and text as entry 1
export function textPattern({ swatch, grid, yarns = [] }) {
  const gauge = gaugeInterpreter(swatch)
  const pixels = grid.map(row => row.map(cell => cell ? INK : BACKGROUND))
  const palette = pairYarns([BACKGROUND, INK], yarns)
  const stitches = grid[0].length
  const rows = grid.length

  return {
    ...buildPattern(pixels, palette),
    size: { stitches, rows, widthCm: stitches / gauge.stitchesPerCm, heightCm: rows / gauge.rowsPerCm }
  }
}

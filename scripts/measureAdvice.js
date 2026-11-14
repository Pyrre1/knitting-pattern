// Dev measurement: yarn advice on local sample images (samples/ is gitignored).
// Usage: node scripts/measureAdvice.js [stitches=100] [yarnCounts=4,6,8,14,20]
import { readdirSync } from "node:fs"
import { readPng } from "./readPng.js"
import { fromImageData } from "../core/fromImageData.js"
import { createPattern } from "../core/createPattern.js"
import { yarnAdvice } from "../core/yarnAdvice.js"
import { colourDistance } from "../core/colourDistance.js"
import { removeColour } from "../core/patternEdits.js"

const stitches = Number(process.argv[2] ?? 100)
const counts = (process.argv[3] ?? "4,6,8,14,20").split(",").map(Number)
const swatch = { unit: "cm", width: 10, height: 10, stitches: 22, rows: 28 }
const hex = c => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("")

for (const file of readdirSync("samples").filter(f => f.endsWith(".png"))) {
  const pixels = fromImageData(readPng(`samples/${file}`))
  // Grid cannot be larger than the image
  const fit = Math.min(stitches, pixels[0].length, Math.floor(pixels.length * swatch.stitches / swatch.rows))
  console.log(`\n== ${file} (${pixels[0].length}×${pixels.length}) at ${fit} stitches`)
  for (const yarnCount of counts) {
    const pattern = createPattern({ swatch, pixels, yarnCount, desiredWidth: { value: fit, unit: "stitches" } })
    const used = pattern.palette.map(() => 0)
    for (const row of pattern.grid) for (const i of row) used[i]++
    const total = used.reduce((a, b) => a + b, 0)
    const { suggested, extra } = yarnAdvice(pattern)
    console.log(`yarns ${yarnCount}: palette ${pattern.palette.length}, advice suggests ${suggested}, extra [${extra.map(i => String.fromCharCode(65 + i))}]`)
    const blends = blendCheck(pattern, used)
    console.log(`  blend check: ${blends.length} blends → would suggest ${Math.max(2, pattern.palette.length - blends.length)}: ${blends.map(b => `${L(b.i)}=${L(b.a)}..${L(b.b)} t=${b.t.toFixed(2)} off=${b.off.toFixed(2)} touch=${b.touch.toFixed(2)}`).join(", ")}`)
    console.log(`  iterative: ${iterate(pattern)}`)
    if (yarnCount <= 8) {
      pattern.palette.forEach((e, i) => {
        const nearest = pattern.palette.map((o, j) => [j, colourDistance(e.source, o.source)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1])[0]
        console.log(`  ${String.fromCharCode(65 + i)} ${hex(e.source)} ${used[i]} st (${(100 * used[i] / total).toFixed(1)} %), nearest ${String.fromCharCode(65 + nearest[0])} d=${nearest[1]}`)
      })
    }
  }
}

function L(i) { return String.fromCharCode(65 + i) }

// Weighted RGB (same 2/4/3 weights as colourDistance), so Euclidean distance² = colourDistance
function w([r, g, b]) { return [r * Math.SQRT2, g * 2, b * Math.sqrt(3)] }

// Blend = colour near the segment between two more-used colours, whose stitches mostly touch both
function blendCheck({ palette, grid }, used, { maxOff = 0.25, minTouch = 0.6 } = {}) {
  const n = palette.length
  // neighbour counts: touches[i][j] = sides of colour-i stitches that touch colour j (j ≠ i)
  const touches = palette.map(() => new Array(n).fill(0))
  for (let y = 0; y < grid.length; y++) for (let x = 0; x < grid[0].length; x++) {
    const i = grid[y][x]
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const j = grid[y + dy]?.[x + dx]
      if (j !== undefined && j !== i) touches[i][j]++
    }
  }
  const p = palette.map(e => w(e.source))
  const result = []
  for (let i = 0; i < n; i++) {
    const sides = touches[i].reduce((a, b) => a + b, 0)
    let best = null
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      if (a === i || b === i || used[a] < used[i] || used[b] < used[i]) continue
      const ab = p[b].map((v, k) => v - p[a][k]), ai = p[i].map((v, k) => v - p[a][k])
      const len2 = ab.reduce((s, v) => s + v * v, 0)
      const t = ai.reduce((s, v, k) => s + v * ab[k], 0) / len2
      if (t <= 0 || t >= 1) continue
      const off = Math.sqrt(ai.reduce((s, v, k) => s + (v - t * ab[k]) ** 2, 0) / len2)
      const touch = sides ? (touches[i][a] + touches[i][b]) / sides : 0
      if (off <= maxOff && touch >= minTouch && touches[i][a] > 0 && touches[i][b] > 0 && (!best || off < best.off)) best = { i, a, b, t, off, touch }
    }
    if (best) result.push(best)
  }
  return result
}

// Remove the smallest blend, recount, repeat. Blend must be at most ratio × each end colour.
function iterate(pattern, ratio = Number(process.env.RATIO ?? 0.5)) {
  let p = pattern
  const names = pattern.palette.map((_, i) => L(i))
  const removed = []
  for (;;) {
    const used = p.palette.map(() => 0)
    for (const row of p.grid) for (const i of row) used[i]++
    const blends = blendCheck(p, used).filter(b => used[b.i] <= ratio * Math.min(used[b.a], used[b.b])).map(b => b.i)
    const empty = used.flatMap((u, i) => u === 0 ? [i] : [])
    const near = process.env.NEAR ? used.flatMap((u, i) => p.palette.some((e, k) => k !== i && used[k] > u && colourDistance(e.source, p.palette[i].source) < 1200) ? [i] : []) : []
    const cands = [...new Set([...empty, ...blends, ...near])]
    if (!cands.length || p.palette.length <= 2) break
    const i = cands.sort((x, y) => used[x] - used[y])[0]
    removed.push(names[i])
    names.splice(i, 1)
    p = removeColour(p, i)
  }
  return `→ ${p.palette.length} kept [${names}] removed [${removed}]`
}

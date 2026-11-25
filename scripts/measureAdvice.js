// Dev measurement: yarn advice on local sample images (samples/ is gitignored).
// Usage: node scripts/measureAdvice.js [stitches=100] [yarnCounts=4,6,8,14,20]
// FINETUNE=1 measures with fine-tuned colours.
// Limits can be overridden: NEAR, OFFSET, TOUCH, EDGE (see core/yarnAdvice.js)
import { readdirSync } from "node:fs"
import { readPng } from "./readPng.js"
import { fromImageData } from "../core/fromImageData.js"
import { createPattern } from "../core/createPattern.js"
import { yarnAdvice } from "../core/yarnAdvice.js"

const stitches = Number(process.argv[2] ?? 100)
const counts = (process.argv[3] ?? "4,6,8,14,20").split(",").map(Number)
const swatch = { unit: "cm", width: 10, height: 10, stitches: 22, rows: 28 }
const env = name => process.env[name] === undefined ? undefined : Number(process.env[name])
const limits = { nearDistance: env("NEAR"), maxOffset: env("OFFSET"), minTouch: env("TOUCH"), minEdge: env("EDGE") }
for (const key in limits) if (limits[key] === undefined) delete limits[key]

const hex = c => "#" + c.map(v => v.toString(16).padStart(2, "0")).join("")
const letter = i => String.fromCharCode(65 + i)

for (const file of readdirSync("samples").filter(f => f.endsWith(".png"))) {
  const pixels = fromImageData(readPng(`samples/${file}`))
  // Grid cannot be larger than the image
  const fit = Math.min(stitches, pixels[0].length, Math.floor(pixels.length * swatch.stitches / swatch.rows))
  console.log(`\n== ${file} (${pixels[0].length}×${pixels.length}) at ${fit} stitches`)

  for (const yarnCount of counts) {
    const pattern = createPattern({ swatch, pixels, yarnCount, desiredWidth: { value: fit, unit: "stitches" },
      fineTune: process.env.FINETUNE === "1" })
    const used = pattern.palette.map(() => 0)
    for (const row of pattern.grid) for (const i of row) used[i]++
    const total = used.reduce((a, b) => a + b, 0)
    const { suggested, extra } = yarnAdvice(pattern, limits)
    console.log(`yarns ${yarnCount}: palette ${pattern.palette.length} → suggests ${suggested}`)
    console.log("  " + pattern.palette.map((e, i) =>
      `${extra.includes(i) ? "-" : "+"}${letter(i)} ${hex(e.source)} ${(100 * used[i] / total).toFixed(1)}%`).join("  "))
  }
}

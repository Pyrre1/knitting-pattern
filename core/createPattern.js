import { gaugeInterpreter } from "./gaugeInterpreter.js"
import { sizeInterpreter } from "./sizeInterpreter.js"
import { imageScaler } from "./imageScaler.js"
import { medianCut } from "./medianCut.js"
import { pairYarns } from "./pairYarns.js"
import { buildPattern } from "./patternEdits.js"

export function createPattern({ swatch, pixels, yarnCount, yarns = [], desiredWidth }) {
  const gauge = gaugeInterpreter(swatch)

  const size = sizeInterpreter({
    gauge,
    desiredWidth,
    imageAspectRatio: pixels.length / pixels[0].length
  })

  const scaled = imageScaler(pixels, size)
  const sources = medianCut(scaled, yarnCount)
  const palette = pairYarns(sources, yarns)

  return { ...buildPattern(scaled, palette), size }
}

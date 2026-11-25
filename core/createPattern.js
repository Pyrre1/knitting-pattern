import { gaugeInterpreter } from "./gaugeInterpreter.js"
import { sizeInterpreter } from "./sizeInterpreter.js"
import { imageScaler } from "./imageScaler.js"
import { basicColours, pickColours } from "./pickColours.js"
import { pairYarns } from "./pairYarns.js"
import { buildPattern } from "./patternEdits.js"

export function createPattern({ swatch, pixels, yarnCount, yarns = [], desiredWidth, fineTune = false }) {
  const gauge = gaugeInterpreter(swatch)

  const size = sizeInterpreter({
    gauge,
    desiredWidth,
    imageAspectRatio: pixels.length / pixels[0].length
  })

  // Colours come from the full image: averaging into stitches blends thin lines away
  const scaled = imageScaler(pixels, size)
  const sources = fineTune ? pickColours(pixels, scaled, yarnCount) : basicColours(pixels, yarnCount)
  const palette = pairYarns(sources, yarns)

  return { ...buildPattern(scaled, palette), size }
}

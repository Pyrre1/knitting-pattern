import { gaugeInterpreter } from "./gaugeInterpreter.js"
import { sizeInterpreter } from "./sizeInterpreter.js"
import { imageScaler } from "./imageScaler.js"
import { basicColours, pickColours } from "./pickColours.js"
import { pairYarns } from "./pairYarns.js"
import { buildPattern } from "./patternEdits.js"
import { areaColours } from "./areaColours.js"

// `motif: { mask, yarns }` picks colours per area (areaColours); the background gets the other yarns
export function createPattern({
  swatch,
  pixels,
  yarnCount,
  yarns = [],
  desiredWidth,
  fineTune = false,
  motif,
}) {
  const gauge = gaugeInterpreter(swatch)

  const size = sizeInterpreter({
    gauge,
    desiredWidth,
    imageAspectRatio: pixels.length / pixels[0].length,
  })

  // Colours come from the full image: averaging into stitches blends thin lines away
  const scaled = imageScaler(pixels, size)
  const sources = pickSources(pixels, scaled, yarnCount, fineTune, motif)
  const palette = pairYarns(sources, yarns)

  // Fine-tune also votes per stitch, so black text on white does not average into a grey stitch
  // that is nearest to another colour
  return { ...buildPattern(scaled, palette, fineTune ? pixels : undefined), size }
}

function pickSources(pixels, scaled, yarnCount, fineTune, motif) {
  if (motif) {
    return areaColours(pixels, motif.mask, { motif: motif.yarns, background: yarnCount - motif.yarns })
  }
  return fineTune ? pickColours(pixels, scaled, yarnCount) : basicColours(pixels, yarnCount)
}

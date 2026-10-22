export function sizeInterpreter({ gauge, desiredWidth, imageAspectRatio }) {
  if(desiredWidth.value <= 0) {
    throw new Error("Width must be greater than 0")
  }
  if(imageAspectRatio <= 0) {
    throw new Error("Aspect ratio must be greater than 0")
  }

  let stitches
  if (desiredWidth.unit === 'stitches') {
    stitches = desiredWidth.value
  } else if (desiredWidth.unit === 'cm') {
    stitches = desiredWidth.value * gauge.stitchesPerCm
  } else if (desiredWidth.unit === 'inch') {
    stitches = desiredWidth.value * gauge.stitchesPerInch
  } else {
    throw new Error("Unsupported unit")
  }


  const rows = stitches * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm)
  const widthCm = desiredWidth.unit === 'inch' ? desiredWidth.value * 2.54 : stitches / gauge.stitchesPerCm
  const heightCm = widthCm * imageAspectRatio

  return {
    stitches: Math.max(1, Math.round(stitches)),
    rows: Math.max(1, Math.round(rows)),
    widthCm,
    heightCm
  }
}
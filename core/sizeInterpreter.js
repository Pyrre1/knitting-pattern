export function sizeInterpreter({ gauge, desiredWidth, imageAspectRatio }) {
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
    stitches,
    rows,
    widthCm,
    heightCm
  }
}
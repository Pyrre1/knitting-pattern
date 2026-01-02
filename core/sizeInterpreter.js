export function sizeInterpreter({ gauge, desiredWidth, imageAspectRatio }) {
  let stitches
  if (desiredWidth.unit === 'stitches') {
    stitches = desiredWidth.value
  } else if (desiredWidth.unit === 'cm') {
    stitches = desiredWidth.value * gauge.stitchesPerCm
  }


  const rows = stitches * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm)
  const widthCm = stitches / gauge.stitchesPerCm
  const heightCm = widthCm * imageAspectRatio

  return {
    stitches,
    rows,
    widthCm,
    heightCm
  }
}
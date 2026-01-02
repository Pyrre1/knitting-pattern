export function sizeInterpreter({ gauge, desiredWidth, imageAspectRatio }) {
  const stitches = desiredWidth.value
  const rows = desiredWidth.value * imageAspectRatio * (gauge.rowsPerCm / gauge.stitchesPerCm)

  const widthCm = stitches / gauge.stitchesPerCm

  const heightCm = widthCm * imageAspectRatio
  
  return {
    stitches: desiredWidth.value,
    rows,
    widthCm,
    heightCm
  }
}
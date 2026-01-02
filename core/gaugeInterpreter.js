export function gaugeInterpreter({ unit, width, height, stitches, rows} ) {
  const CM_PER_INCH = 2.54

  let stitchesPerCm, rowsPerCm, stitchesPerInch, rowsPerInch

  if (unit === "cm") {
      stitchesPerCm = stitches / width,
      rowsPerCm =rows / height,
      stitchesPerInch =stitchesPerCm * CM_PER_INCH,
      rowsPerInch =rowsPerCm * CM_PER_INCH
  } else {
      stitchesPerInch =stitches / width,
      rowsPerInch =rows / height,
      stitchesPerCm =stitchesPerInch / CM_PER_INCH,
      rowsPerCm =rowsPerInch / CM_PER_INCH
  }
  return {
      stitchesPerCm,
      rowsPerCm,
      stitchesPerInch,
      rowsPerInch
  }
}
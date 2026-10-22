// Weighted squared RGB distance; the eye is most sensitive to green, least to red
export function colourDistance(a, b) {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]

  return 2 * dr * dr + 4 * dg * dg + 3 * db * db
}

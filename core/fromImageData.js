// Converts canvas ImageData (flat RGBA) into a [y][x] = [r, g, b] grid.
// Transparent pixels are blended onto white.
export function fromImageData({ data, width, height }) {
  const grid = []

  for (let y = 0; y < height; y++) {
    const row = []

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const alpha = data[i + 3] / 255

      row.push([
        Math.round(data[i] * alpha + 255 * (1 - alpha)),
        Math.round(data[i + 1] * alpha + 255 * (1 - alpha)),
        Math.round(data[i + 2] * alpha + 255 * (1 - alpha))
      ])
    }

    grid.push(row)
  }

  return grid
}

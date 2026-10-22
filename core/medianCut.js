export function medianCut(grid, count) {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('count must be a positive integer')
  }

  const pixels = grid.flat()
  if (pixels.length === 0) {
    throw new Error('grid must contain at least one pixel')
  }

  const boxes = [pixels]

  while (boxes.length < count) {
    // Split the box with the widest single-channel range
    let target = -1
    let widest = { channel: 0, range: 0 }

    boxes.forEach((box, i) => {
      const spread = widestChannel(box)
      if (spread.range > widest.range) {
        widest = spread
        target = i
      }
    })

    // Every remaining box holds a single colour
    if (target === -1) break

    boxes.splice(target, 1, ...splitBox(boxes[target], widest.channel))
  }

  return boxes.map(averageColour)
}

function widestChannel(box) {
  let widest = { channel: 0, range: 0 }

  for (let channel = 0; channel < 3; channel++) {
    const values = box.map(px => px[channel])
    const range = Math.max(...values) - Math.min(...values)

    if (range > widest.range) {
      widest = { channel, range }
    }
  }

  return widest
}

function splitBox(box, channel) {
  const sorted = [...box].sort((a, b) => a[channel] - b[channel])
  const mid = Math.floor(sorted.length / 2)

  // Move the cut to the value change nearest the median,
  // so identical colours never end up on both sides
  const isBoundary = i =>
    i > 0 && i < sorted.length && sorted[i - 1][channel] !== sorted[i][channel]

  let cut = mid
  for (let offset = 0; offset < sorted.length; offset++) {
    if (isBoundary(mid - offset)) { cut = mid - offset; break }
    if (isBoundary(mid + offset)) { cut = mid + offset; break }
  }

  return [sorted.slice(0, cut), sorted.slice(cut)]
}

function averageColour(box) {
  const sum = [0, 0, 0]

  for (const px of box) {
    sum[0] += px[0]
    sum[1] += px[1]
    sum[2] += px[2]
  }

  return sum.map(channel => Math.round(channel / box.length))
}

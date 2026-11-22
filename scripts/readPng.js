// Minimal PNG reader for dev scripts: 8-bit RGB/RGBA/grey, non-interlaced. → { data (RGBA), width, height }
import { readFileSync } from "node:fs"
import { inflateSync } from "node:zlib"

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

export function readPng(path) {
  const buf = readFileSync(path)
  if (!buf.subarray(0, 8).equals(PNG_SIGNATURE)) throw new Error(`${path}: not a PNG file (e.g. a JPEG renamed to .png); save it as PNG`)
  let pos = 8, width, height, depth, type, palette, idat = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const kind = buf.toString("ascii", pos + 4, pos + 8)
    const body = buf.subarray(pos + 8, pos + 8 + len)
    if (kind === "IHDR") {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4)
      depth = body[8]; type = body[9]
      if (depth !== 8 || body[12] !== 0) throw new Error(`${path}: only 8-bit non-interlaced PNG`)
    } else if (kind === "PLTE") palette = body
    else if (kind === "IDAT") idat.push(body)
    pos += 12 + len
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type]
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const rows = new Uint8Array(height * stride)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x]
      const a = x >= channels ? rows[y * stride + x - channels] : 0
      const b = y > 0 ? rows[(y - 1) * stride + x] : 0
      const c = x >= channels && y > 0 ? rows[(y - 1) * stride + x - channels] : 0
      let p = 0
      if (filter === 1) p = a
      else if (filter === 2) p = b
      else if (filter === 3) p = (a + b) >> 1
      else if (filter === 4) {
        const e = a + b - c, pa = Math.abs(e - a), pb = Math.abs(e - b), pc = Math.abs(e - c)
        p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      rows[y * stride + x] = (v + p) & 255
    }
  }
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    const s = i * channels
    let r, g, b, al = 255
    if (type === 0) r = g = b = rows[s]
    else if (type === 4) { r = g = b = rows[s]; al = rows[s + 1] }
    else if (type === 3) { const k = rows[s] * 3; r = palette[k]; g = palette[k + 1]; b = palette[k + 2] }
    else { r = rows[s]; g = rows[s + 1]; b = rows[s + 2]; if (type === 6) al = rows[s + 3] }
    data.set([r, g, b, al], i * 4)
  }
  return { data, width, height }
}

/**
 * Brand asset pipeline: logo/ → public/brand/
 *
 *  - Trims transparent padding and resizes proportionally (aspect ratio is never changed).
 *  - Builds dark-mode variants: only the wordmark + slogan pixels are recoloured to white;
 *    the blue square with the yellow G mark is left untouched.
 *  - Crops the G mark square for favicons.
 *
 * Run once after replacing logos:  npm run brand
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = (f) => path.join(root, 'logo', f)
const out = (f) => path.join(root, 'public', 'brand', f)

const HORIZONTAL = src('Golomt Bank logo_MN_Horizontal.png')
const VERTICAL = src('Golomt Bank logo_MN_Vertical.png')
const WHITE = src('809909671_4717445795210034_3467331842269747908_n.png')

// Transparent gaps measured on the source files (see README → Brand).
const H_MARK_END_X = 1468 // horizontal: mark ends at x=1342, wordmark starts at x=1594
const V_MARK_END_Y = 1926 // vertical: mark ends at y=1760, wordmark starts at y=2092

async function raw(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, info }
}

function whiten(data, info, predicate) {
  const { width, height, channels } = info
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!predicate(x, y)) continue
      const i = (y * width + x) * channels
      if (data[i + 3] === 0) continue
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
    }
  }
  return data
}

async function write(buffer, info, file, resize) {
  await sharp(buffer, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .trim({ threshold: 1 })
    .resize(resize)
    .png({ compressionLevel: 9, palette: false })
    .toFile(out(file))
  const meta = await sharp(out(file)).metadata()
  console.log(`  ${file.padEnd(28)} ${meta.width}×${meta.height}  ratio ${(meta.width / meta.height).toFixed(3)}`)
}

await mkdir(path.join(root, 'public', 'brand'), { recursive: true })
console.log('Brand assets → public/brand')

{
  const { data, info } = await raw(HORIZONTAL)
  await write(Buffer.from(data), info, 'golomt-horizontal.png', { height: 240 })
  whiten(data, info, (x) => x > H_MARK_END_X)
  await write(data, info, 'golomt-horizontal-dark.png', { height: 240 })
}

{
  const { data, info } = await raw(VERTICAL)
  await write(Buffer.from(data), info, 'golomt-vertical.png', { height: 480 })
  whiten(data, info, (_, y) => y > V_MARK_END_Y)
  await write(data, info, 'golomt-vertical-dark.png', { height: 480 })
}

{
  const { data, info } = await raw(WHITE)
  await write(data, info, 'golomt-white.png', { width: 1800 })
}

{
  // Favicon: the square G mark from the vertical logo.
  // sharp runs trim() before extract(), so the two steps need separate pipelines.
  const top = await sharp(VERTICAL).extract({ left: 0, top: 0, width: 7605, height: V_MARK_END_Y }).png().toBuffer()
  const mark = await sharp(top).trim({ threshold: 1 }).toBuffer()
  for (const size of [32, 180, 512]) {
    await sharp(mark).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(out(`mark-${size}.png`))
    console.log(`  mark-${size}.png`)
  }
}

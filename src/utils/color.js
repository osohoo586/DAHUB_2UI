/**
 * Colour utilities for the theme customizer: conversions, WCAG contrast,
 * mixing, harmony suggestions and derived-token generation.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export function normalizeHex(input) {
  if (typeof input !== 'string') return null
  let h = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) return null
  return '#' + h.toLowerCase()
}

export function hexToRgb(hex) {
  const h = normalizeHex(hex)
  if (!h) return { r: 0, g: 0, b: 0 }
  const n = parseInt(h.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }) {
  const to = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h *= 60
  }
  return { h, s: s * 100, l: l * 100 }
}

export function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360
  s = clamp(s, 0, 100) / 100
  l = clamp(l, 0, 100) / 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 }
}

export const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex))
export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl))

function channel(c) {
  c /= 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG 2.x contrast ratio (1–21). */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export function wcagLevel(ratio, large = false) {
  if (ratio >= (large ? 4.5 : 7)) return 'AAA'
  if (ratio >= (large ? 3 : 4.5)) return 'AA'
  return 'FAIL'
}

/** Linear sRGB-space mix: t=0 → a, t=1 → b. */
export function mix(a, b, t) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t })
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const isDark = (hex) => luminance(hex) < 0.2

/** Move `fg` toward `anchor` until it reaches `min` contrast against every background. */
export function ensureContrast(fg, backgrounds, min, anchor) {
  let color = fg
  for (let i = 0; i < 40; i++) {
    if (backgrounds.every((bg) => contrast(color, bg) >= min)) return color
    color = mix(color, anchor, 0.08)
  }
  return anchor
}

export function harmonies(hex) {
  const { h, s, l } = hexToHsl(hex)
  return [
    { key: 'complementary', label: 'Нөхөх (180°)', hex: hslToHex({ h: h + 180, s, l }) },
    { key: 'analogous-', label: 'Ойролцоо (−30°)', hex: hslToHex({ h: h - 30, s, l }) },
    { key: 'analogous+', label: 'Ойролцоо (+30°)', hex: hslToHex({ h: h + 30, s, l }) },
    { key: 'lighter', label: 'Цайвар', hex: hslToHex({ h, s, l: clamp(l + 12, 0, 96) }) },
    { key: 'deeper', label: 'Гүн', hex: hslToHex({ h, s, l: clamp(l - 12, 4, 100) }) },
  ]
}

/** The seven user-editable base tokens, in customizer order. */
export const BASE_TOKENS = [
  { key: 'bg', cssVar: '--bg', label: 'Үндсэн дэвсгэр', hint: 'Хуудасны ерөнхий дэвсгэр' },
  { key: 'surface', cssVar: '--surface', label: 'Card дэвсгэр', hint: 'Card, modal, цэсний дэвсгэр' },
  { key: 'primary', cssVar: '--primary', label: 'Primary (хөх)', hint: 'Товч, холбоос, идэвхтэй төлөв' },
  { key: 'accent', cssVar: '--accent', label: 'Accent (шар)', hint: 'Идэвхтэй шугам, индикатор' },
  { key: 'text', cssVar: '--text', label: 'Текст', hint: 'Гарчиг ба үндсэн бичвэр' },
  { key: 'border', cssVar: '--border', label: 'Border', hint: 'Card ба талбарын хүрээ' },
  { key: 'heroFill', cssVar: '--hero-fill', label: 'Hero / тусгай хэсэг', hint: 'Hero slider, footer, нэвтрэх хуудас' },
]

/**
 * Compute every token the UI consumes from the seven base colours.
 * Returns a map of CSS custom property → value.
 */
export function deriveTokens(base, mode) {
  const light = mode === 'light'
  const { bg, surface, primary, accent, text, border, heroFill } = base
  const black = '#000000'
  const white = '#ffffff'

  const text2 = ensureContrast(mix(text, surface, 0.3), [surface, bg], 5.5, text)
  const text3 = ensureContrast(mix(text, surface, 0.46), [surface, bg], 4.6, text)
  const borderStrong = mix(border, text, light ? 0.1 : 0.12)
  const onPrimary = contrast(white, primary) >= 4.5 ? white : light ? text : bg
  const onHeroPick = contrast(white, heroFill) >= 4.5 ? white : '#0b1524'

  return {
    '--bg': bg,
    '--surface': surface,
    '--primary': primary,
    '--accent': accent,
    '--text': text,
    '--border': border,
    '--hero-fill': heroFill,

    '--bg-subtle': mix(bg, text, light ? 0.035 : 0.03),
    '--surface-2': light ? mix(surface, bg, 0.5) : mix(surface, text, 0.035),
    '--surface-hover': light ? mix(surface, bg, 0.6) : mix(surface, text, 0.028),
    '--text-2': text2,
    '--text-3': text3,
    '--border-strong': borderStrong,
    '--primary-hover': light ? mix(primary, black, 0.15) : mix(primary, white, 0.15),
    '--primary-soft': mix(surface, primary, light ? 0.08 : 0.18),
    '--primary-soft-2': mix(surface, primary, light ? 0.16 : 0.28),
    '--on-primary': onPrimary,
    '--accent-soft': mix(surface, accent, light ? 0.18 : 0.14),
    '--accent-glow': rgba(accent, light ? 0.28 : 0.22),
    '--hero-fill-2': mix(heroFill, black, 0.12),
    '--footer-bg': mix(heroFill, black, light ? 0.2 : 0.34),
    '--on-hero': onHeroPick,
    '--on-hero-2': rgba(onHeroPick, 0.74),
    '--focus-ring': rgba(primary, light ? 0.35 : 0.45),
    '--nav-bg': rgba(bg, light ? 0.82 : 0.8),
    '--chart-grid': mix(surface, border, 0.65),
    '--chart-axis': borderStrong,
    '--chart-neutral': mix(borderStrong, text, 0.1),
  }
}

/** Contrast checks shown in the customizer. */
export function contrastChecks(base) {
  return [
    { key: 'text-bg', label: 'Текст / Дэвсгэр', fg: base.text, bg: base.bg, ratio: contrast(base.text, base.bg) },
    { key: 'text-surface', label: 'Текст / Card', fg: base.text, bg: base.surface, ratio: contrast(base.text, base.surface) },
    {
      key: 'primary-surface',
      label: 'Primary / Card',
      fg: base.primary,
      bg: base.surface,
      ratio: contrast(base.primary, base.surface),
    },
  ]
}

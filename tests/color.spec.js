import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { contrast, hexToHsl, hslToHex, normalizeHex, deriveTokens, mix } from '../src/utils/color.js'

describe('WCAG contrast', () => {
  it('matches reference values', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
    expect(contrast('#005aa9', '#ffffff')).toBeGreaterThan(6.5)
  })
})

describe('conversions', () => {
  it('round-trips hex ↔ hsl', () => {
    for (const hex of ['#005aa9', '#fff100', '#13243a', '#f6f5f2']) {
      expect(hslToHex(hexToHsl(hex))).toBe(hex)
    }
  })
  it('normalises shorthand and rejects junk', () => {
    expect(normalizeHex('#FA0')).toBe('#ffaa00')
    expect(normalizeHex('zzz')).toBe(null)
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
  })
})

// Parse the default tokens from tokens.css and make sure text tokens pass AA.
function tokenBlock(selector) {
  const css = readFileSync(new URL('../src/assets/styles/tokens.css', import.meta.url), 'utf8')
  const start = css.indexOf(selector)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const map = {}
  for (const m of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) map[m[1]] = m[2]
  return map
}

describe('default theme tokens meet WCAG AA', () => {
  for (const [mode, selector] of [['light', ":root[data-theme='light']"], ['dark', ":root[data-theme='dark']"]]) {
    it(`${mode}: text tokens ≥ 4.5:1 on bg and surface`, () => {
      const t = tokenBlock(selector)
      for (const fg of ['--text', '--text-2', '--text-3', '--primary']) {
        for (const bg of ['--bg', '--surface', '--surface-2']) {
          expect(contrast(t[fg], t[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      }
      for (const k of ['--success', '--warning', '--danger', '--risk-low-ink', '--risk-medium-ink', '--risk-high-ink', '--risk-critical-ink']) {
        expect(contrast(t[k], t['--surface']), `${k} on surface`).toBeGreaterThanOrEqual(4.5)
      }
    })
  }

  it('derived tokens keep secondary text readable for custom palettes', () => {
    const base = { bg: '#eef3f8', surface: '#ffffff', primary: '#1d5f9f', accent: '#e0b400', text: '#1a2b40', border: '#d8e0ea', heroFill: '#123f6e' }
    const d = deriveTokens(base, 'light')
    expect(contrast(d['--text-3'], base.bg)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(d['--text-2'], base.surface)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(d['--on-primary'], base.primary)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('palette presets meet WCAG AA', () => {
  const presets = JSON.parse(readFileSync(new URL('../src/mock/presets.json', import.meta.url), 'utf8'))
  for (const p of presets) {
    for (const mode of ['light', 'dark']) {
      it(`${p.name} · ${mode}`, () => {
        const b = p[mode]
        const d = deriveTokens(b, mode)
        expect(contrast(b.text, b.bg), 'text/bg').toBeGreaterThanOrEqual(4.5)
        expect(contrast(b.text, b.surface), 'text/surface').toBeGreaterThanOrEqual(4.5)
        expect(contrast(b.primary, b.surface), 'primary/surface').toBeGreaterThanOrEqual(4.5)
        expect(contrast(d['--on-primary'], b.primary), 'on-primary').toBeGreaterThanOrEqual(4.5)
        expect(contrast(d['--text-3'], b.bg), 'text-3/bg').toBeGreaterThanOrEqual(4.5)
        expect(contrast(d['--on-hero'], b.heroFill), 'on-hero').toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

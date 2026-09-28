import { defineStore } from 'pinia'
import presets from '@/mock/presets.json'
import { deriveTokens, normalizeHex } from '@/utils/color'

const KEY = 'dahub.theme'
const DEFAULTS = presets.find((p) => p.id === 'golomt')
const clone = (v) => JSON.parse(JSON.stringify(v))

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

let media = null
let animTimer = null

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system', // 'system' | 'light' | 'dark'
    systemDark: false,
    saved: { light: {}, dark: {} },
    draft: { light: {}, dark: {} },
    version: 0,
    presets,
  }),

  getters: {
    resolved: (s) => (s.mode === 'system' ? (s.systemDark ? 'dark' : 'light') : s.mode),
    defaults: () => (mode) => DEFAULTS[mode],
    base() {
      return (mode = this.resolved) => ({ ...DEFAULTS[mode], ...this.draft[mode] })
    },
    isDirty() {
      return (mode = this.resolved) => JSON.stringify(this.draft[mode]) !== JSON.stringify(this.saved[mode])
    },
    isCustom() {
      return (mode = this.resolved) => Object.keys(this.draft[mode]).length > 0
    },
    activePresetId() {
      const b = this.base(this.resolved)
      const match = presets.find((p) => Object.entries(p[this.resolved]).every(([k, v]) => b[k] === v))
      return match?.id ?? null
    },
  },

  actions: {
    init() {
      const stored = readStorage()
      this.mode = ['light', 'dark', 'system'].includes(stored.mode) ? stored.mode : 'system'
      this.saved = { light: {}, dark: {}, ...(stored.custom || {}) }
      this.draft = clone(this.saved)
      if (typeof window !== 'undefined' && window.matchMedia) {
        media = window.matchMedia('(prefers-color-scheme: dark)')
        this.systemDark = media.matches
        media.addEventListener('change', (e) => {
          this.systemDark = e.matches
          if (this.mode === 'system') this.apply(true)
        })
      }
      this.apply(false)
    },

    persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify({ mode: this.mode, custom: this.saved }))
      } catch {
        /* storage blocked */
      }
    },

    /** Write the current tokens to <html>. `animate` enables the 350ms colour hand-over. */
    apply(animate = true) {
      const root = document.documentElement
      if (animate) {
        root.classList.add('theme-anim')
        clearTimeout(animTimer)
        animTimer = setTimeout(() => root.classList.remove('theme-anim'), 420)
      }
      root.dataset.theme = this.resolved
      // Clear previous inline overrides, then apply the current mode's (if customised).
      for (let i = root.style.length - 1; i >= 0; i--) {
        const prop = root.style[i]
        if (prop.startsWith('--')) root.style.removeProperty(prop)
      }
      if (this.isCustom(this.resolved)) {
        const tokens = deriveTokens(this.base(this.resolved), this.resolved)
        for (const [k, v] of Object.entries(tokens)) root.style.setProperty(k, v)
      }
      this.version++
    },

    setMode(mode) {
      this.mode = mode
      this.persist()
      this.apply(true)
    },

    toggle() {
      this.setMode(this.resolved === 'dark' ? 'light' : 'dark')
    },

    /** Live edit of a base token for the current mode (not persisted until save()). */
    setToken(key, value) {
      const hex = normalizeHex(value)
      if (!hex) return
      const mode = this.resolved
      const next = { ...this.draft[mode] }
      if (DEFAULTS[mode][key] === hex) delete next[key]
      else next[key] = hex
      this.draft[mode] = next
      this.apply(false)
    },

    applyPreset(preset, bothModes = true) {
      const modes = bothModes ? ['light', 'dark'] : [this.resolved]
      for (const m of modes) {
        const next = {}
        for (const [k, v] of Object.entries(preset[m])) if (DEFAULTS[m][k] !== v) next[k] = v
        this.draft[m] = next
      }
      this.apply(true)
    },

    save() {
      this.saved = clone(this.draft)
      this.persist()
    },

    revert() {
      this.draft = clone(this.saved)
      this.apply(true)
    },

    /** "Анхны төлөвт буцаах" — current mode only. */
    resetMode() {
      const mode = this.resolved
      this.draft[mode] = {}
      this.saved[mode] = {}
      this.persist()
      this.apply(true)
    },

    resetAll() {
      this.draft = { light: {}, dark: {} }
      this.saved = { light: {}, dark: {} }
      this.persist()
      this.apply(true)
    },
  },
})

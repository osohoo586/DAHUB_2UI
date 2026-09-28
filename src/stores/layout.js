import { defineStore } from 'pinia'

const KEY = 'dahub.layout'

/** Navigation layouts offered in the customizer. Applied as <html data-nav="…">. */
export const NAV_LAYOUTS = [
  { value: 'top', label: 'Дээд bar' },
  { value: 'side', label: 'Sidebar' },
  { value: 'bottom', label: 'Доод bar' },
  { value: 'dropdown', label: 'Dropdown' },
]
const VALUES = NAV_LAYOUTS.map((l) => l.value)

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    nav: 'top',
    sidebarCollapsed: false,
  }),

  actions: {
    init() {
      const stored = readStorage()
      this.nav = VALUES.includes(stored.nav) ? stored.nav : 'top'
      this.sidebarCollapsed = stored.sidebarCollapsed === true
      this.apply()
    },

    persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify({ nav: this.nav, sidebarCollapsed: this.sidebarCollapsed }))
      } catch {
        /* storage blocked */
      }
    },

    /** The CSS tokens in tokens.css read these attributes to reserve space for the nav. */
    apply() {
      const root = document.documentElement
      root.dataset.nav = this.nav
      root.dataset.sidebar = this.sidebarCollapsed ? 'collapsed' : 'expanded'
    },

    setNav(nav) {
      if (!VALUES.includes(nav) || nav === this.nav) return
      this.nav = nav
      this.persist()
      this.apply()
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      this.persist()
      this.apply()
    },
  },
})

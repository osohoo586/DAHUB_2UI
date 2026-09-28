import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const VARS = [
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6', 'chart-neutral', 'chart-grid', 'chart-axis',
  'text', 'text-2', 'text-3', 'surface', 'surface-2', 'border', 'primary', 'accent',
  'risk-low', 'risk-medium', 'risk-high', 'risk-critical',
]

/** Reads resolved CSS tokens for Chart.js; recomputes whenever the theme or customizer changes. */
export function useChartTheme() {
  const theme = useThemeStore()
  return computed(() => {
    void theme.version
    const cs = getComputedStyle(document.documentElement)
    const out = {}
    for (const v of VARS) out[v.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = cs.getPropertyValue(`--${v}`).trim()
    out.font = cs.getPropertyValue('--font-sans').trim()
    out.dark = theme.resolved === 'dark'
    return out
  })
}

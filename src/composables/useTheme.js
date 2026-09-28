import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

export function useTheme() {
  const theme = useThemeStore()
  return {
    theme,
    mode: computed(() => theme.mode),
    resolved: computed(() => theme.resolved),
    isDark: computed(() => theme.resolved === 'dark'),
    toggle: () => theme.toggle(),
    setMode: (m) => theme.setMode(m),
  }
}

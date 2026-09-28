import { onMounted, onBeforeUnmount } from 'vue'

/** useHotkey('mod+k', handler) — `mod` = ⌘ on macOS, Ctrl elsewhere. */
export function useHotkey(combo, handler) {
  const parts = combo.toLowerCase().split('+')
  const key = parts.pop()
  const needMod = parts.includes('mod')
  function onKey(e) {
    const mod = e.metaKey || e.ctrlKey
    if (needMod !== mod) return
    if (e.key.toLowerCase() !== key) return
    e.preventDefault()
    handler(e)
  }
  onMounted(() => window.addEventListener('keydown', onKey))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
}

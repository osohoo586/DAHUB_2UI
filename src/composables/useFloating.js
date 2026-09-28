import { ref, onBeforeUnmount } from 'vue'

/**
 * Positions a popover with `position: fixed` next to its anchor so it is never clipped
 * by overflow containers (modals, scrolling tables). Flips upward when space runs out.
 */
export function useFloating({ gap = 6, align = 'left', estimate = 300 } = {}) {
  const style = ref({})
  let anchorEl = null
  let listening = false
  let need = estimate

  function place() {
    if (!anchorEl) return
    const r = anchorEl.getBoundingClientRect()
    const below = window.innerHeight - r.bottom
    const up = below < need + gap && r.top > below
    const base = { position: 'fixed', minWidth: `${r.width}px` }
    const horizontal =
      align === 'right' ? { right: `${Math.max(8, window.innerWidth - r.right)}px`, left: 'auto' } : { left: `${Math.max(8, r.left)}px`, right: 'auto' }
    const vertical = up ? { bottom: `${window.innerHeight - r.top + gap}px`, top: 'auto' } : { top: `${r.bottom + gap}px`, bottom: 'auto' }
    style.value = { ...base, ...horizontal, ...vertical, maxHeight: `${Math.max(160, (up ? r.top : below) - gap - 12)}px` }
  }

  function start(el, estimateOverride) {
    anchorEl = el
    need = estimateOverride ?? estimate
    place()
    if (!listening) {
      window.addEventListener('scroll', place, true)
      window.addEventListener('resize', place)
      listening = true
    }
  }
  function stop() {
    if (listening) {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
      listening = false
    }
  }
  onBeforeUnmount(stop)
  return { style, start, stop, place }
}

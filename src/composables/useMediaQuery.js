import { ref, onMounted, onBeforeUnmount } from 'vue'

/** Reactive `window.matchMedia(query).matches`. */
export function useMediaQuery(query) {
  const mql = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query) : null
  const matches = ref(mql?.matches ?? false)
  const update = (e) => (matches.value = e.matches)
  onMounted(() => mql?.addEventListener('change', update))
  onBeforeUnmount(() => mql?.removeEventListener('change', update))
  return matches
}

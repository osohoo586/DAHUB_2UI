/**
 * v-reveal — fade + 16px rise when the element first enters the viewport (plays once).
 *   v-reveal          → no delay
 *   v-reveal="i"      → delay i × 70ms (stagger)
 *   v-reveal="{ delay: 120 }"
 */
const STAGGER = 70
let observer = null

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-revealed')
        observer.unobserve(e.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  return observer
}

function delayOf(value) {
  if (typeof value === 'number') return Math.min(value, 12) * STAGGER
  if (value && typeof value === 'object') return value.delay ?? Math.min(value.i ?? 0, 12) * STAGGER
  return 0
}

export const vReveal = {
  mounted(el, binding) {
    if (reduced() || typeof IntersectionObserver === 'undefined') return
    el.setAttribute('data-reveal', '')
    el.style.setProperty('--reveal-delay', `${delayOf(binding.value)}ms`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const easeOut = (t) => 1 - (1 - t) ** 3
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Animated number: counts from 0 the first time `el` is visible, then tweens between values.
 * @returns { display: Ref<number>, el: Ref<HTMLElement> }
 */
export function useCountUp(source, { duration = 600 } = {}) {
  const el = ref(null)
  const display = ref(0)
  let started = false
  let frame = 0
  let io = null

  function tween(from, to) {
    cancelAnimationFrame(frame)
    if (reduced() || from === to) {
      display.value = to
      return
    }
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration)
      display.value = from + (to - from) * easeOut(t)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!el.value || typeof IntersectionObserver === 'undefined') {
      started = true
      display.value = source()
      return
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true
          tween(0, source())
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el.value)
  })

  watch(source, (to, from) => {
    if (started) tween(display.value ?? from ?? 0, to)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    io?.disconnect()
  })

  return { el, display }
}

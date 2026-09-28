import { watch, nextTick, onBeforeUnmount } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Keeps Tab focus inside `elRef` while `active` is true; restores focus on release. */
export function useFocusTrap(elRef, active, { initial } = {}) {
  let previous = null

  function onKey(e) {
    if (e.key !== 'Tab' || !elRef.value) return
    const nodes = [...elRef.value.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(
    active,
    async (on) => {
      if (on) {
        previous = document.activeElement
        document.addEventListener('keydown', onKey)
        await nextTick()
        const target = (initial && elRef.value?.querySelector(initial)) || elRef.value?.querySelector(FOCUSABLE)
        target?.focus({ preventScroll: true })
      } else {
        document.removeEventListener('keydown', onKey)
        previous?.focus?.({ preventScroll: true })
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
}

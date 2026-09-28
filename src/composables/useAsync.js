import { ref, shallowRef } from 'vue'

/** Minimal async state: data / loading / error, with a re-runnable `run(...args)`. */
export function useAsync(fn, { immediate = true, initial = null } = {}) {
  const data = shallowRef(initial)
  const loading = ref(false)
  const error = ref(null)
  let token = 0

  async function run(...args) {
    const my = ++token
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      if (my === token) data.value = result
      return result
    } catch (e) {
      if (my === token) error.value = e
      throw e
    } finally {
      if (my === token) loading.value = false
    }
  }

  if (immediate) run().catch(() => {})
  return { data, loading, error, run }
}

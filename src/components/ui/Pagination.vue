<script setup>
import { computed } from 'vue'
import IconButton from './IconButton.vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  pages: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])

const items = computed(() => {
  const p = props.modelValue
  const n = props.pages
  const set = new Set([1, n, p - 1, p, p + 1].filter((x) => x >= 1 && x <= n))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  sorted.forEach((x, i) => {
    if (i && x - sorted[i - 1] > 1) out.push('…' + x)
    out.push(x)
  })
  return out
})
const go = (p) => emit('update:modelValue', Math.min(props.pages, Math.max(1, p)))
</script>

<template>
  <nav class="pg" aria-label="Хуудаслалт">
    <IconButton icon="chevron-left" label="Өмнөх" size="sm" :disabled="modelValue === 1" @click="go(modelValue - 1)" />
    <template v-for="it in items" :key="it">
      <span v-if="typeof it === 'string'" class="pg__gap">…</span>
      <button v-else type="button" class="pg__num" :class="{ 'is-active': it === modelValue }" :aria-current="it === modelValue ? 'page' : undefined" @click="go(it)">{{ it }}</button>
    </template>
    <IconButton icon="chevron-right" label="Дараах" size="sm" :disabled="modelValue === pages" @click="go(modelValue + 1)" />
  </nav>
</template>

<style scoped>
.pg { display: inline-flex; align-items: center; gap: 2px; }
.pg__num {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border-radius: 7px;
  font-size: var(--fs-sm);
  color: var(--text-2);
  font-variant-numeric: tabular-nums;
}
.pg__num:hover { background: var(--primary-soft); color: var(--primary); }
.pg__num.is-active { background: var(--primary); color: var(--on-primary); }
.pg__gap { width: 20px; text-align: center; color: var(--text-3); }
</style>

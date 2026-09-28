<script setup>
import { computed } from 'vue'

const props = defineProps({
  values: { type: Array, required: true },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 36 },
  tone: { type: String, default: 'neutral' }, // neutral | good | bad
})

const pts = computed(() => {
  const v = props.values
  const min = Math.min(...v)
  const max = Math.max(...v)
  const span = max - min || 1
  const pad = 4
  return v.map((y, i) => [pad + (i / (v.length - 1)) * (props.width - pad * 2), pad + (1 - (y - min) / span) * (props.height - pad * 2)])
})
const line = computed(() => pts.value.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(''))
const area = computed(() => `${line.value}L${pts.value.at(-1)[0].toFixed(1)} ${props.height}L${pts.value[0][0].toFixed(1)} ${props.height}Z`)
const last = computed(() => pts.value.at(-1))
</script>

<template>
  <svg class="spark" :class="`spark--${tone}`" :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" aria-hidden="true">
    <path class="spark__area" :d="area" />
    <path class="spark__line" :d="line" />
    <circle class="spark__ring" :cx="last[0]" :cy="last[1]" r="5" />
    <circle class="spark__dot" :cx="last[0]" :cy="last[1]" r="3" />
  </svg>
</template>

<style scoped>
.spark { display: block; overflow: visible; }
.spark__line { fill: none; stroke: var(--chart-neutral); stroke-width: 1.75; stroke-linejoin: round; stroke-linecap: round; }
.spark__area { fill: var(--chart-1); opacity: 0.07; }
.spark__ring { fill: var(--surface); }
.spark__dot { fill: var(--chart-1); }
.spark--good .spark__dot { fill: var(--success); }
.spark--bad .spark__dot { fill: var(--danger); }
</style>

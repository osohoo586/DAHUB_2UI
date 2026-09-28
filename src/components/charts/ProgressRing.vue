<script setup>
import { computed } from 'vue'
const props = defineProps({
  value: { type: Number, required: true }, // 0–100
  size: { type: Number, default: 120 },
  stroke: { type: Number, default: 10 },
  label: { type: String, default: '' },
})
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const offset = computed(() => c.value * (1 - Math.min(100, Math.max(0, props.value)) / 100))
</script>

<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }" role="img" :aria-label="`${label} ${Math.round(value)}%`">
    <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size">
      <circle class="ring__track" :cx="size / 2" :cy="size / 2" :r="r" :stroke-width="stroke" />
      <circle
        class="ring__fill"
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        :stroke-width="stroke"
        :stroke-dasharray="c"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring__center"><slot /></div>
  </div>
</template>

<style scoped>
.ring { position: relative; flex: none; }
.ring svg { display: block; }
.ring__track { fill: none; stroke: var(--primary-soft); }
.ring__fill { fill: none; stroke: var(--primary); stroke-linecap: round; transition: stroke-dashoffset 800ms var(--ease-out); }
.ring__center { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; }
</style>

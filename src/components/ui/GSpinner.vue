<script setup>
/** Loading indicator modelled on the G mark: a sky-blue ring with a yellow "flame" arc. */
defineProps({
  size: { type: Number, default: 20 },
  onDark: { type: Boolean, default: false },
  label: { type: String, default: 'Ачааллаж байна' },
})
</script>

<template>
  <span class="gspin" :class="{ 'on-dark': onDark }" role="status" :aria-label="label" :style="{ width: size + 'px', height: size + 'px' }">
    <svg viewBox="0 0 24 24" :width="size" :height="size" aria-hidden="true">
      <circle class="track" cx="12" cy="12" r="9" fill="none" stroke-width="2.4" />
      <circle class="arc" cx="12" cy="12" r="9" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="16 60" />
    </svg>
  </span>
</template>

<style scoped>
.gspin { display: inline-flex; flex: none; }
.gspin svg { animation: spin 900ms linear infinite; }
.track { stroke: color-mix(in srgb, var(--primary) 22%, transparent); }
.arc { stroke: var(--accent); }
.on-dark .track { stroke: rgba(255, 255, 255, 0.28); }
.on-dark .arc { stroke: var(--brand-yellow); }
</style>

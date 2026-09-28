<script setup>
defineProps({
  items: { type: Array, required: true }, // [{ label, color, value?, shape? }]
})
</script>

<template>
  <ul class="legend">
    <li v-for="it in items" :key="it.label" class="legend__item">
      <span class="legend__key" :class="`is-${it.shape || 'dot'}`" :style="{ background: it.color }" aria-hidden="true" />
      <span class="legend__label">{{ it.label }}</span>
      <span v-if="it.value != null" class="legend__value num">{{ it.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
.legend { list-style: none; display: flex; flex-wrap: wrap; gap: 6px 16px; }
.legend__item { display: inline-flex; align-items: center; gap: 8px; font-size: var(--fs-xs); color: var(--text-2); }
.legend__key { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.legend__key.is-line { width: 16px; height: 2px; border-radius: 2px; }
.legend__key.is-dot { border-radius: 50%; width: 8px; height: 8px; }
.legend__value { color: var(--text); font-weight: var(--fw-semibold); }
</style>

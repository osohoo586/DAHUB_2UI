<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '14px' },
  radius: { type: String, default: '6px' },
  lines: { type: Number, default: 1 },
})
</script>

<template>
  <span class="skel-wrap" aria-hidden="true">
    <span v-for="n in lines" :key="n" class="skel" :style="{ width: n === lines && lines > 1 ? '64%' : width, height, borderRadius: radius }" />
  </span>
</template>

<style scoped>
.skel-wrap { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.skel {
  display: block;
  background: linear-gradient(90deg, var(--surface-2) 0%, var(--bg-subtle) 40%, var(--surface-2) 80%);
  background-size: 640px 100%;
  animation: shimmer 1.6s linear infinite;
}
</style>

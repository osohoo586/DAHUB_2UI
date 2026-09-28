<script setup>
import { computed } from 'vue'
const props = defineProps({
  value: { type: Number, required: true }, // 0–100
  tone: { type: String, default: 'primary' }, // primary | success | warning | danger
  height: { type: Number, default: 6 },
  ember: { type: Boolean, default: false },
  label: { type: String, default: '' },
})
const pct = computed(() => Math.min(100, Math.max(0, props.value)))
</script>

<template>
  <div
    class="pbar"
    :class="`pbar--${tone}`"
    :style="{ height: height + 'px' }"
    role="progressbar"
    :aria-valuenow="Math.round(pct)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label || undefined"
  >
    <span class="pbar__fill" :style="{ width: pct + '%' }"><span v-if="ember && pct > 0 && pct < 100" class="pbar__ember" /></span>
  </div>
</template>

<style scoped>
.pbar {
  --c: var(--primary);
  position: relative;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--c) 14%, var(--surface-2));
  overflow: hidden;
}
.pbar--success { --c: var(--success); }
.pbar--warning { --c: var(--warning); }
.pbar--danger { --c: var(--danger); }
.pbar__fill {
  position: relative;
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--c);
  transition: width 600ms var(--ease-out);
}
.pbar__ember {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
  animation: ember 1.8s ease-in-out infinite;
}
</style>

<script setup>
import { computed } from 'vue'
import Avatar from './Avatar.vue'

const props = defineProps({
  members: { type: Array, default: () => [] },
  max: { type: Number, default: 4 },
  size: { type: String, default: 'sm' },
})
const shown = computed(() => props.members.slice(0, props.max))
const rest = computed(() => Math.max(0, props.members.length - props.max))
</script>

<template>
  <span class="astack" :class="`astack--${size}`">
    <Avatar v-for="m in shown" :key="m.id" :member="m" :size="size" ring />
    <span v-if="rest" class="astack__more">+{{ rest }}</span>
  </span>
</template>

<style scoped>
.astack { display: inline-flex; align-items: center; }
.astack > * + * { margin-left: -8px; }
.astack--xs > * + * { margin-left: -6px; }
.astack__more {
  position: relative;
  height: 32px;
  min-width: 32px;
  padding: 0 8px;
  border-radius: var(--radius-pill);
  display: inline-grid;
  place-items: center;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--text-2);
  background: var(--surface-2);
  box-shadow: 0 0 0 2px var(--surface);
  font-variant-numeric: tabular-nums;
}
.astack--xs .astack__more { height: 24px; min-width: 24px; font-size: 10px; padding: 0 6px; }
</style>

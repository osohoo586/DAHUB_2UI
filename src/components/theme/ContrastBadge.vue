<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { wcagLevel } from '@/utils/color'

const props = defineProps({
  label: { type: String, required: true },
  fg: { type: String, required: true },
  bg: { type: String, required: true },
  ratio: { type: Number, required: true },
})
const level = computed(() => wcagLevel(props.ratio))
</script>

<template>
  <div class="cb" :class="{ 'is-fail': level === 'FAIL' }">
    <span class="cb__sample" :style="{ color: fg, background: bg }">Аа</span>
    <div class="cb__text">
      <span class="cb__label">{{ label }}</span>
      <span class="cb__ratio num">{{ ratio.toFixed(2) }}:1</span>
    </div>
    <span class="cb__level" :class="`is-${level.toLowerCase()}`">
      <AppIcon :name="level === 'FAIL' ? 'alert' : 'check'" :size="13" :stroke="2" />
      {{ level === 'FAIL' ? 'AA хангахгүй' : level }}
    </span>
  </div>
</template>

<style scoped>
.cb { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); }
.cb.is-fail { border-color: color-mix(in srgb, var(--danger) 40%, var(--border)); background: var(--danger-soft); }
.cb__sample { width: 36px; height: 30px; border-radius: 6px; display: grid; place-items: center; font-weight: var(--fw-semibold); font-size: var(--fs-sm); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08); flex: none; }
.cb__text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.cb__label { font-size: var(--fs-xs); color: var(--text-3); }
.cb__ratio { font-size: var(--fs-sm); font-weight: var(--fw-semibold); }
.cb__level { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: var(--fw-semibold); padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.cb__level.is-aaa, .cb__level.is-aa { color: var(--success); background: var(--success-soft); }
.cb__level.is-fail { color: var(--danger); background: var(--surface); }
</style>

<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import CountUp from '@/components/ui/CountUp.vue'
import Sparkline from '@/components/charts/Sparkline.vue'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  kpi: { type: Object, required: true }, // { label, value, prev, unit, decimals, goodDirection, spark, icon, hint }
  compareLabel: { type: String, default: 'өмнөх үетэй' },
})

const isPct = computed(() => props.kpi.unit === '%')
const diff = computed(() => props.kpi.value - props.kpi.prev)
const change = computed(() => (isPct.value ? diff.value : props.kpi.prev ? (diff.value / props.kpi.prev) * 100 : 0))
const direction = computed(() => (Math.abs(diff.value) < 1e-9 ? 'flat' : diff.value > 0 ? 'up' : 'down'))
const quality = computed(() => {
  if (props.kpi.goodDirection === 'neutral' || direction.value === 'flat') return 'neutral'
  return direction.value === props.kpi.goodDirection ? 'good' : 'bad'
})
const deltaText = computed(() => {
  const sign = change.value > 0 ? '+' : change.value < 0 ? '−' : '±'
  if (isPct.value) return `${sign}${formatNumber(Math.abs(change.value), 1)} пп`
  if (props.kpi.decimals === 0 && Math.abs(diff.value) < 100) return `${sign}${formatNumber(Math.abs(diff.value), 0)}`
  return `${sign}${formatNumber(Math.abs(change.value), 1)}%`
})
</script>

<template>
  <BaseCard class="kpi" padding="md">
    <div class="kpi__head">
      <span class="kpi__label">{{ kpi.label }}</span>
      <AppIcon :name="kpi.icon" :size="18" class="kpi__icon" />
    </div>
    <div class="kpi__value">
      <CountUp :value="kpi.value" :decimals="kpi.decimals" class="kpi__num" />
      <span class="kpi__unit">{{ kpi.unit }}</span>
    </div>
    <div class="kpi__foot">
      <span class="kpi__delta" :class="`is-${quality}`" :title="`${compareLabel} харьцуулсан өөрчлөлт`">
        <AppIcon :name="direction === 'up' ? 'trending-up' : direction === 'down' ? 'trending-down' : 'minus'" :size="14" :stroke="2" />
        <span class="num">{{ deltaText }}</span>
      </span>
      <Sparkline :values="kpi.spark" :width="72" :height="30" :tone="quality === 'neutral' ? 'neutral' : quality" />
    </div>
    <p class="kpi__compare">{{ kpi.hint || compareLabel }}</p>
  </BaseCard>
</template>

<style scoped>
.kpi { height: 100%; }
.kpi.card { padding: 20px; }
.kpi__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; min-height: 36px; }
.kpi__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); line-height: 1.35; }
.kpi__icon { color: var(--text-3); }
.kpi__value { display: flex; align-items: baseline; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
.kpi__num { font-size: 1.875rem; font-weight: var(--fw-semibold); letter-spacing: -0.02em; line-height: 1; }
.kpi__unit { font-size: var(--fs-sm); color: var(--text-3); font-weight: var(--fw-medium); }
.kpi__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 6px; margin-top: 16px; }
.kpi__foot :deep(.spark) { flex: 0 1 auto; min-width: 0; }
.kpi__delta { flex: none; white-space: nowrap; display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-xs); font-weight: var(--fw-semibold); padding: 3px 8px; border-radius: 999px; }
.kpi__delta.is-good { color: var(--success); background: var(--success-soft); }
.kpi__delta.is-bad { color: var(--danger); background: var(--danger-soft); }
.kpi__delta.is-neutral { color: var(--text-2); background: var(--surface-2); }
.kpi__compare { margin-top: 8px; font-size: 11px; color: var(--text-3); }
</style>

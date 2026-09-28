<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { baseOptions } from './chartSetup'
import { useChartTheme } from '@/composables/useChartTheme'

const props = defineProps({ plan: { type: Object, required: true } })
const t = useChartTheme()

const data = computed(() => ({
  labels: props.plan.labels,
  datasets: [
    { label: 'Төлөвлөгөө', data: props.plan.planned, backgroundColor: t.value.chartNeutral, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 14, categoryPercentage: 0.62, barPercentage: 0.9 },
    { label: 'Гүйцэтгэл', data: props.plan.completed, backgroundColor: t.value.chart1, borderRadius: 4, borderSkipped: 'start', maxBarThickness: 14, categoryPercentage: 0.62, barPercentage: 0.9 },
  ],
}))

const options = computed(() => {
  const o = baseOptions(t.value)
  o.scales.y.ticks.precision = 0
  o.scales.x.ticks.maxRotation = 0
  o.scales.x.ticks.autoSkip = true
  o.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${c.parsed.y} аудит` }
  return o
})
</script>

<template>
  <div class="chart"><Bar :data="data" :options="options" aria-label="Аудитын төлөвлөгөө ба гүйцэтгэл" role="img" /></div>
</template>

<style scoped>
.chart { position: relative; height: 220px; }
</style>

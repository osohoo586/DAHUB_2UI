<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { baseOptions } from './chartSetup'
import { useChartTheme } from '@/composables/useChartTheme'

const props = defineProps({ findings: { type: Object, required: true } })
const t = useChartTheme()

const LEVELS = [
  { key: 'low', label: 'Бага', token: 'riskLow' },
  { key: 'medium', label: 'Дунд', token: 'riskMedium' },
  { key: 'high', label: 'Өндөр', token: 'riskHigh' },
  { key: 'critical', label: 'Маш өндөр', token: 'riskCritical' },
]

// Rounded end only on the outermost non-empty segment of each bar.
function radius(ctx) {
  const i = ctx.dataIndex
  const di = ctx.datasetIndex
  const ds = ctx.chart.data.datasets
  const lastNonZero = ds.reduce((acc, d, k) => (d.data[i] > 0 ? k : acc), -1)
  return di === lastNonZero ? { topRight: 4, bottomRight: 4, topLeft: 0, bottomLeft: 0 } : 0
}

const data = computed(() => ({
  labels: props.findings.units,
  datasets: LEVELS.map((l) => ({
    label: l.label,
    data: props.findings[l.key],
    backgroundColor: t.value[l.token],
    borderColor: t.value.surface,
    borderWidth: { right: 2 },
    borderSkipped: false,
    borderRadius: radius,
    maxBarThickness: 18,
    categoryPercentage: 0.7,
  })),
}))

const options = computed(() => {
  const o = baseOptions(t.value, { indexAxis: 'y', stacked: true })
  o.scales.y.ticks.color = t.value.text2
  o.scales.x.ticks.precision = 0
  o.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${c.parsed.x} олдвор` }
  return o
})
</script>

<template>
  <div class="chart"><Bar :data="data" :options="options" aria-label="Олдворын эрсдэлийн түвшний хуваарилалт, нэгжээр" role="img" /></div>
</template>

<style scoped>
.chart { position: relative; height: 240px; min-height: 0; }
</style>

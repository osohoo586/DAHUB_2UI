<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { baseOptions, barValueLabels } from './chartSetup'
import { useChartTheme } from '@/composables/useChartTheme'
import { formatNumber } from '@/utils/format'

const props = defineProps({ sectors: { type: Array, required: true } })
const t = useChartTheme()

// Ranked high → low, "Бусад" always last.
const rows = computed(() => {
  const other = props.sectors.filter((s) => s.label === 'Бусад')
  return [...props.sectors.filter((s) => s.label !== 'Бусад').sort((a, b) => b.value - a.value), ...other]
})

const data = computed(() => ({
  labels: rows.value.map((r) => r.label),
  datasets: [
    {
      label: 'Зээлийн багцын хувь',
      data: rows.value.map((r) => r.value),
      backgroundColor: rows.value.map((r) => (r.label === 'Бусад' ? t.value.chartNeutral : t.value.chart1)),
      borderRadius: 4,
      borderSkipped: 'start',
      maxBarThickness: 16,
      categoryPercentage: 0.8,
    },
  ],
}))

const options = computed(() => {
  const o = baseOptions(t.value, { indexAxis: 'y', yFormat: (v) => `${v}%` })
  o.scales.x.max = Math.ceil(Math.max(...rows.value.map((r) => r.value)) / 5) * 5 + 5
  o.scales.x.ticks.callback = (v) => `${v}%`
  o.scales.y.ticks.color = t.value.text2
  o.plugins.tooltip.callbacks = { label: (c) => ` ${formatNumber(c.parsed.x, 1)}% зээлийн багцад` }
  o.plugins.barValueLabels = { color: t.value.text2, font: t.value.font, format: (v) => `${formatNumber(v, 1)}%` }
  o.layout.padding.right = 36
  return o
})
</script>

<template>
  <div class="chart"><Bar :data="data" :options="options" :plugins="[barValueLabels]" aria-label="Зээлийн багцын салбарын хуваарилалт" role="img" /></div>
</template>

<style scoped>
.chart { position: relative; height: 280px; }
</style>

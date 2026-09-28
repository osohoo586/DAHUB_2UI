<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { baseOptions } from './chartSetup'
import { useChartTheme } from '@/composables/useChartTheme'
import { rgba } from '@/utils/color'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  labels: { type: Array, required: true },
  income: { type: Array, required: true },
  expense: { type: Array, required: true },
})
const t = useChartTheme()

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Орлого',
      data: props.income,
      borderColor: t.value.chart1,
      backgroundColor: rgba(t.value.chart1, 0.1),
      fill: 'origin',
      borderWidth: 2,
      tension: 0.32,
      pointRadius: (ctx) => (ctx.dataIndex === props.income.length - 1 ? 4 : 0),
      pointHoverRadius: 5,
      pointBackgroundColor: t.value.chart1,
      pointBorderColor: t.value.surface,
      pointBorderWidth: 2,
    },
    {
      label: 'Зарлага',
      data: props.expense,
      borderColor: t.value.chart2,
      backgroundColor: 'transparent',
      borderWidth: 2,
      tension: 0.32,
      pointRadius: (ctx) => (ctx.dataIndex === props.expense.length - 1 ? 4 : 0),
      pointHoverRadius: 5,
      pointBackgroundColor: t.value.chart2,
      pointBorderColor: t.value.surface,
      pointBorderWidth: 2,
    },
  ],
}))

const options = computed(() => {
  const o = baseOptions(t.value, { yFormat: (v) => formatNumber(v, 0) })
  o.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${formatNumber(c.parsed.y, 1)} тэрбум ₮` }
  o.scales.y.beginAtZero = false
  return o
})
</script>

<template>
  <div class="chart"><Line :data="data" :options="options" aria-label="Орлого ба зарлагын чиг хандлага, тэрбум төгрөгөөр" role="img" /></div>
</template>

<style scoped>
.chart { position: relative; height: 280px; }
</style>

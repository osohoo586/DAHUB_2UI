/**
 * Chart.js registration + shared, token-driven options.
 * Mark specs follow the DAHUB data-viz rules: thin marks, 2px lines, hairline solid grid,
 * rounded data-ends, one y-axis, text in text tokens (never the series colour).
 */
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from 'chart.js'

Chart.register(LineController, BarController, LineElement, BarElement, PointElement, CategoryScale, LinearScale, Tooltip, Filler)

export function baseOptions(t, { indexAxis = 'x', stacked = false, yFormat = (v) => v, xFormat = null, legend = false } = {}) {
  const font = { family: t.font, size: 12 }
  const valueAxis = {
    stacked,
    beginAtZero: true,
    border: { display: false },
    grid: { color: t.chartGrid, lineWidth: 1, drawTicks: false },
    ticks: { color: t.text3, font, padding: 8, maxTicksLimit: 6, callback: yFormat },
  }
  const categoryAxis = {
    stacked,
    border: { color: t.chartAxis },
    grid: { display: false },
    ticks: { color: t.text3, font, padding: 6, ...(xFormat ? { callback: xFormat } : {}) },
  }
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis,
    animation: { duration: 500, easing: 'easeOutCubic' },
    interaction: { mode: 'index', intersect: false, axis: indexAxis === 'y' ? 'y' : 'x' },
    layout: { padding: { top: 4, right: 8, left: 0, bottom: 0 } },
    scales: indexAxis === 'y' ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
    plugins: {
      legend: { display: legend },
      tooltip: {
        backgroundColor: t.surface,
        borderColor: t.border,
        borderWidth: 1,
        titleColor: t.text,
        bodyColor: t.text2,
        titleFont: { ...font, weight: '600' },
        bodyFont: font,
        padding: 12,
        cornerRadius: 10,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 6,
        usePointStyle: true,
        caretSize: 0,
        displayColors: true,
      },
    },
  }
}

/** Draws a value at the tip of each bar (single-series bar charts only). */
export const barValueLabels = {
  id: 'barValueLabels',
  afterDatasetsDraw(chart, _args, opts) {
    const { ctx } = chart
    const meta = chart.getDatasetMeta(0)
    if (!meta || meta.hidden) return
    ctx.save()
    ctx.font = `600 12px ${opts.font}`
    ctx.fillStyle = opts.color
    ctx.textBaseline = 'middle'
    meta.data.forEach((bar, i) => {
      const v = chart.data.datasets[0].data[i]
      const label = opts.format ? opts.format(v) : String(v)
      if (chart.options.indexAxis === 'y') {
        ctx.textAlign = 'left'
        ctx.fillText(label, bar.x + 8, bar.y)
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(label, bar.x, bar.y - 10)
      }
    })
    ctx.restore()
  },
}

export { Chart }

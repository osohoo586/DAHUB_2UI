<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Tag from '@/components/ui/Tag.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import GSpinner from '@/components/ui/GSpinner.vue'
import DataTable from '@/components/ui/DataTable.vue'
import KpiCard from '@/components/cards/KpiCard.vue'
import TrendChart from '@/components/charts/TrendChart.vue'
import SectorChart from '@/components/charts/SectorChart.vue'
import FindingsChart from '@/components/charts/FindingsChart.vue'
import PlanChart from '@/components/charts/PlanChart.vue'
import ProgressRing from '@/components/charts/ProgressRing.vue'
import ChartLegend from '@/components/charts/ChartLegend.vue'
import { getDashboardStats } from '@/services/dashboard'
import { useMembersStore } from '@/stores/members'
import { useToast } from '@/composables/useToast'
import { formatDate, formatDateLong, daysUntil, formatNumber } from '@/utils/format'
import { downloadWorkbook } from '@/utils/excel'

const members = useMembersStore()
const toast = useToast()
members.load()

const PERIOD_KEY = 'dahub.dashboard.period'
const saved = (() => {
  try {
    return localStorage.getItem(PERIOD_KEY)
  } catch {
    return null
  }
})()
const period = ref(['month', 'quarter', 'year'].includes(saved) ? saved : 'quarter')
const stats = ref(null)
const loading = ref(false)
const exporting = ref(false)

async function load() {
  loading.value = true
  stats.value = await getDashboardStats({ period: period.value })
  loading.value = false
}
watch(period, (p) => {
  try {
    localStorage.setItem(PERIOD_KEY, p)
  } catch {
    /* ignore */
  }
  load()
})
load()

const periods = [
  { value: 'month', label: 'Сар' },
  { value: 'quarter', label: 'Улирал' },
  { value: 'year', label: 'Жил' },
]

const LEVEL_META = { low: { label: 'Бага', var: '--risk-low' }, medium: { label: 'Дунд', var: '--risk-medium' }, high: { label: 'Өндөр', var: '--risk-high' }, critical: { label: 'Маш өндөр', var: '--risk-critical' } }
const findingTotals = computed(() => {
  if (!stats.value) return []
  const f = stats.value.findings
  return Object.entries(LEVEL_META).map(([k, m]) => ({ label: m.label, color: `var(${m.var})`, value: f[k].reduce((a, b) => a + b, 0), shape: 'square' }))
})
const findingsTotal = computed(() => findingTotals.value.reduce((a, b) => a + b.value, 0))

const planSummary = computed(() => {
  if (!stats.value) return null
  const p = stats.value.plan
  const planned = p.planned.reduce((a, b) => a + b, 0)
  const done = p.completed.reduce((a, b) => a + b, 0)
  // Only periods that have started count toward "due so far".
  const dueIdx = p.completed.reduce((acc, v, i) => (v > 0 ? i : acc), 0)
  const due = p.planned.slice(0, dueIdx + 1).reduce((a, b) => a + b, 0)
  return { planned, done, due, pct: planned ? (done / planned) * 100 : 0, onTrack: due ? (done / due) * 100 : 0 }
})

const trendSummary = computed(() => {
  if (!stats.value) return null
  const t = stats.value.trend
  const i = t.income.at(-1)
  const e = t.expense.at(-1)
  return { income: i, expense: e, margin: ((i - e) / i) * 100 }
})

const overdueRows = computed(() =>
  (stats.value?.overdue ?? []).map((r) => ({ ...r, owner: members.byId(r.ownerId), days: -daysUntil(r.dueDate) })),
)
const overdueColumns = [
  { key: 'id', label: 'Дугаар', sortable: true, width: '120px' },
  { key: 'title', label: 'Олдвор', sortable: true },
  { key: 'unit', label: 'Нэгж', sortable: true },
  { key: 'level', label: 'Түвшин', sortable: true, sortValue: (r) => ['low', 'medium', 'high', 'critical'].indexOf(r.level) },
  { key: 'owner', label: 'Хариуцсан аудитор', sortValue: (r) => r.owner?.firstName ?? '' },
  { key: 'dueDate', label: 'Хугацаа', sortable: true, numeric: true, format: (v) => formatDate(v) },
  { key: 'days', label: 'Хэтэрсэн', sortable: true, numeric: true },
]

async function exportExcel() {
  if (!stats.value) return
  exporting.value = true
  const s = stats.value
  try {
    await downloadWorkbook(`DAHUB_dashboard_${period.value}_${s.asOf}.xlsx`, [
      { name: 'KPI', rows: s.kpis.map((k) => ({ Үзүүлэлт: k.label, Утга: k.value, 'Өмнөх үе': k.prev, Нэгж: k.unit })) },
      { name: 'Орлого-зарлага', rows: s.trend.labels.map((l, i) => ({ Үе: l, 'Орлого (тэрбум ₮)': s.trend.income[i], 'Зарлага (тэрбум ₮)': s.trend.expense[i] })) },
      { name: 'Салбар', rows: s.sectors.map((x) => ({ Салбар: x.label, 'Хувь (%)': x.value })) },
      { name: 'Олдвор', rows: s.findings.units.map((u, i) => ({ Нэгж: u, Бага: s.findings.low[i], Дунд: s.findings.medium[i], Өндөр: s.findings.high[i], 'Маш өндөр': s.findings.critical[i] })) },
      { name: 'Төлөвлөгөө', rows: s.plan.labels.map((l, i) => ({ Үе: l, Төлөвлөгөө: s.plan.planned[i], Гүйцэтгэл: s.plan.completed[i] })) },
      { name: 'Хугацаа хэтэрсэн', rows: overdueRows.value.map((r) => ({ Дугаар: r.id, Олдвор: r.title, Нэгж: r.unit, Түвшин: LEVEL_META[r.level].label, Хугацаа: r.dueDate, 'Хэтэрсэн хоног': r.days })) },
    ])
    toast.success('Excel файл бэлэн боллоо', 'Dashboard-ын өгөгдөл 6 sheet-ээр татагдлаа.')
  } catch (e) {
    toast.error('Excel үүсгэж чадсангүй', e.message)
  } finally {
    exporting.value = false
  }
}
const levelLabel = (k) => LEVEL_META[k]?.label ?? k
const BY = { month: 'сараар', quarter: 'улирлаар', year: 'жилээр' }
</script>

<template>
  <div class="page container">
    <PageHeader eyebrow="Шинжилгээ" title="Dashboard" description="Банкны санхүүгийн гол үзүүлэлт ба дотоод аудитын ажлын явц — нэг дороос.">
      <template #actions>
        <span v-if="stats" class="dash__asof num"><GSpinner v-if="loading" :size="14" />{{ formatDateLong(stats.asOf) }}-ны байдлаар</span>
        <SegmentedControl v-model="period" :options="periods" label="Хугацааны шүүлтүүр" />
        <BaseButton variant="secondary" icon="download" :loading="exporting" :disabled="!stats" @click="exportExcel">Excel</BaseButton>
      </template>
    </PageHeader>

    <div class="dash__note" v-reveal="1">
      <Tag tone="warning" icon="info" size="sm">Туршилтын өгөгдөл</Tag>
      <span>Энэ хуудасны тоо бүр mock өгөгдөл бөгөөд бодит санхүүгийн тайлан биш.</span>
    </div>

    <!-- KPI row -->
    <section class="grid dash__kpis" aria-label="Гол үзүүлэлтүүд">
      <template v-if="stats">
        <div v-for="(k, i) in stats.kpis" :key="k.id" class="span-2 lg-span-4 md-span-6" v-reveal="i">
          <KpiCard :kpi="k" :compare-label="stats.compareLabel" />
        </div>
      </template>
      <template v-else>
        <div v-for="n in 6" :key="n" class="span-2 lg-span-4 md-span-6"><BaseCard><Skeleton :lines="3" height="18px" /></BaseCard></div>
      </template>
    </section>

    <div v-if="stats" class="grid dash__charts">
      <BaseCard class="span-8 lg-span-12" title="Орлого, зарлагын чиг хандлага" :subtitle="`тэрбум ₮ · ${BY[period]}`" v-reveal>
        <template #actions>
          <ChartLegend :items="[{ label: 'Орлого', color: 'var(--chart-1)', shape: 'line' }, { label: 'Зарлага', color: 'var(--chart-2)', shape: 'line' }]" />
        </template>
        <div class="dash__trend-stats">
          <div><span class="dash__stat-label">Сүүлийн үеийн орлого</span><span class="dash__stat num">{{ formatNumber(trendSummary.income, 1) }}</span></div>
          <div><span class="dash__stat-label">Зарлага</span><span class="dash__stat num">{{ formatNumber(trendSummary.expense, 1) }}</span></div>
          <div><span class="dash__stat-label">Цэвэр зөрүүний хувь</span><span class="dash__stat num">{{ formatNumber(trendSummary.margin, 1) }}%</span></div>
        </div>
        <TrendChart :labels="stats.trend.labels" :income="stats.trend.income" :expense="stats.trend.expense" />
      </BaseCard>

      <BaseCard class="span-4 lg-span-12" title="Салбараар хуваарилалт" subtitle="Зээлийн багцын хувь" v-reveal="1">
        <SectorChart :sectors="stats.sectors" />
      </BaseCard>

      <BaseCard class="span-6 lg-span-12" title="Олдворын эрсдэлийн түвшин" :subtitle="`Нийт ${findingsTotal} олдвор · аудитлагдсан нэгжээр`" v-reveal>
        <template #actions><RouterLink to="/risk" class="dash__link">Эрсдэл рүү</RouterLink></template>
        <ChartLegend class="dash__legend" :items="findingTotals" />
        <FindingsChart class="dash__fill" :findings="stats.findings" />
      </BaseCard>

      <BaseCard class="span-6 lg-span-12" title="Аудитын төлөвлөгөөний гүйцэтгэл" :subtitle="`Хийгдсэн ба төлөвлөсөн аудит · ${BY[period]}`" v-reveal="1">
        <div class="dash__plan">
          <ProgressRing :value="planSummary.pct" :size="128" :stroke="10" label="Жилийн гүйцэтгэл">
            <div>
              <span class="dash__ring-value num">{{ Math.round(planSummary.pct) }}%</span>
              <span class="dash__ring-label">гүйцэтгэл</span>
            </div>
          </ProgressRing>
          <dl class="dash__plan-stats">
            <div><dt>Төлөвлөсөн</dt><dd class="num">{{ planSummary.planned }}</dd></div>
            <div><dt>Хийгдсэн</dt><dd class="num">{{ planSummary.done }}</dd></div>
            <div><dt>Хугацаандаа</dt><dd class="num">{{ Math.round(planSummary.onTrack) }}%</dd></div>
          </dl>
        </div>
        <ChartLegend class="dash__legend" :items="[{ label: 'Төлөвлөгөө', color: 'var(--chart-neutral)', shape: 'square' }, { label: 'Гүйцэтгэл', color: 'var(--chart-1)', shape: 'square' }]" />
        <PlanChart :plan="stats.plan" />
      </BaseCard>

      <BaseCard class="span-12" title="Хугацаа хэтэрсэн олдворууд" :subtitle="`${overdueRows.length} олдворын залруулах арга хэмжээ хугацаандаа хэрэгжээгүй`" v-reveal>
        <DataTable :columns="overdueColumns" :rows="overdueRows" :initial-sort="{ key: 'days', dir: 'desc' }" caption="Хугацаа хэтэрсэн олдворууд">
          <template #cell-id="{ value }"><span class="num dash__id">{{ value }}</span></template>
          <template #cell-level="{ value }"><Tag :tone="value" dot size="sm">{{ levelLabel(value) }}</Tag></template>
          <template #cell-owner="{ row }">
            <span v-if="row.owner" class="dash__owner"><Avatar :member="row.owner" size="xs" />{{ row.owner.lastName[0] }}. {{ row.owner.firstName }}</span>
          </template>
          <template #cell-days="{ value }"><span class="dash__overdue num">{{ value }} хоног</span></template>
        </DataTable>
      </BaseCard>
    </div>

    <div v-else class="grid dash__charts">
      <BaseCard class="span-8 lg-span-12"><Skeleton height="320px" radius="12px" /></BaseCard>
      <BaseCard class="span-4 lg-span-12"><Skeleton height="320px" radius="12px" /></BaseCard>
    </div>
  </div>
</template>

<style scoped>
.dash__asof { display: inline-flex; align-items: center; gap: 8px; font-size: var(--fs-xs); color: var(--text-3); }
.dash__note { display: flex; align-items: center; gap: 10px; margin: -12px 0 var(--space-6); font-size: var(--fs-xs); color: var(--text-3); }
.dash__kpis > * { display: flex; }
.dash__kpis > * > * { flex: 1; }
.dash__charts { margin-top: var(--gutter); }
.dash__trend-stats { display: flex; gap: var(--space-8); margin: -4px 0 var(--space-4); flex-wrap: wrap; }
.dash__trend-stats > div { display: flex; flex-direction: column; gap: 2px; }
.dash__stat-label { font-size: var(--fs-xs); color: var(--text-3); }
.dash__stat { font-size: var(--fs-xl); font-weight: var(--fw-semibold); letter-spacing: -0.01em; }
.dash__legend { margin: -6px 0 var(--space-3); }
.dash__fill { flex: 1; min-height: 240px; height: auto !important; }
.dash__link { font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.dash__plan { display: flex; align-items: center; gap: var(--space-8); margin-bottom: var(--space-5); }
.dash__ring-value { display: block; font-size: var(--fs-2xl); font-weight: var(--fw-semibold); line-height: 1; }
.dash__ring-label { display: block; font-size: 11px; color: var(--text-3); margin-top: 4px; }
.dash__plan-stats { display: grid; grid-template-columns: repeat(3, auto); gap: var(--space-8); margin: 0; }
.dash__plan-stats dt { font-size: var(--fs-xs); color: var(--text-3); }
.dash__plan-stats dd { margin: 2px 0 0; font-size: var(--fs-xl); font-weight: var(--fw-semibold); }
.dash__id { color: var(--text-3); font-size: var(--fs-xs); }
.dash__owner { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.dash__overdue { color: var(--danger); font-weight: var(--fw-semibold); }
@media (max-width: 767px) {
  .dash__plan { flex-direction: column; align-items: flex-start; }
}
</style>

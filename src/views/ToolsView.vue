<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import Stepper from '@/components/ui/Stepper.vue'
import FileDropzone from '@/components/ui/FileDropzone.vue'
import DataTable from '@/components/ui/DataTable.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import TextField from '@/components/ui/TextField.vue'
import Tag from '@/components/ui/Tag.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import GSpinner from '@/components/ui/GSpinner.vue'
import FormulaCard from '@/components/cards/FormulaCard.vue'
import {
  DESIGNS,
  ALLOCATIONS,
  CONFIDENCE_LEVELS,
  designById,
  detectColumns,
  describe,
  buildStrata,
  runSampling,
  zFor,
} from '@/utils/sampling'
import { readWorkbook, downloadWorkbook } from '@/utils/excel'
import { generateLoanPopulation } from '@/utils/sampleData'
import { newSeed } from '@/utils/prng'
import { formatNumber, formatDateTime, formatCompact } from '@/utils/format'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const { can, user } = useAuth()
const toast = useToast()
const canRun = computed(() => can('tools', 'edit'))

const STEPS = [
  { key: 'upload', label: 'Өгөгдөл', description: 'Excel файл оруулах' },
  { key: 'design', label: 'Дизайн', description: 'Түүврийн арга сонгох' },
  { key: 'params', label: 'Параметр', description: 'Итгэлцэл, алдаа, хэмжээ' },
  { key: 'result', label: 'Үр дүн', description: 'Түүвэр ба экспорт' },
]
const step = ref(0)
const maxReached = ref(0)
function go(i) {
  if (i <= maxReached.value) step.value = i
}
function next() {
  step.value++
  maxReached.value = Math.max(maxReached.value, step.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------------- Step 1: data ---------------- */
const file = ref(null) // { name, size, sheets: [{ name, rows }] }
const sheetIndex = ref(0)
const reading = ref(false)
const readError = ref('')

const rows = computed(() => file.value?.sheets[sheetIndex.value]?.rows ?? [])
const columns = computed(() => detectColumns(rows.value))
const numericColumns = computed(() => columns.value.filter((c) => c.type === 'number'))
const stratumColumns = computed(() => columns.value.filter((c) => c.stratifiable))
const previewColumns = computed(() =>
  columns.value.map((c) => ({ key: c.name, label: c.name, numeric: c.type === 'number', format: c.type === 'number' ? (v) => formatNumber(Number(v), Number.isInteger(Number(v)) ? 0 : 2) : undefined })),
)

async function onFile(f) {
  readError.value = ''
  reading.value = true
  try {
    const wb = await readWorkbook(f)
    const sheets = wb.sheets.filter((s) => s.rows.length)
    if (!sheets.length) throw new Error('Файлд мөр олдсонгүй. Эхний мөр нь баганын нэр байх ёстой.')
    setData({ name: f.name, size: f.size, sheets })
    toast.success('Файл уншигдлаа', `${f.name} · ${formatNumber(sheets[0].rows.length)} мөр`)
  } catch (e) {
    readError.value = e.message || 'Файлыг уншиж чадсангүй.'
  } finally {
    reading.value = false
  }
}
function useSample() {
  setData({ name: 'Жишээ — зээлийн багц 2026.xlsx', size: 0, sheets: [{ name: 'Зээл', rows: generateLoanPopulation() }], sample: true })
}
async function downloadSample() {
  await downloadWorkbook('DAHUB_жишээ_зээлийн_багц.xlsx', [{ name: 'Зээл', rows: generateLoanPopulation() }])
  toast.info('Жишээ файл татагдлаа', 'Энэ файлыг дээрх талбарт чирч оруулж туршаарай.')
}
function setData(f) {
  file.value = f
  sheetIndex.value = 0
  result.value = null
  maxReached.value = 0
  autoPick()
}
function resetFile() {
  file.value = null
  result.value = null
  step.value = 0
  maxReached.value = 0
}
watch(sheetIndex, autoPick)

/* ---------------- Step 2: design ---------------- */
const design = ref('srswor')
const stratumColumn = ref(null)
const valueColumn = ref(null)
const allocation = ref('equal')
const manualAlloc = ref({})

function autoPick() {
  // Sensible defaults: first categorical stratum candidate, first amount-like numeric column.
  stratumColumn.value = stratumColumns.value[0]?.name ?? null
  const amount = numericColumns.value.find((c) => /дүн|amount|үлдэгдэл|balance|₮/i.test(c.name))
  valueColumn.value = (amount ?? numericColumns.value[0])?.name ?? null
}

const d = computed(() => designById(design.value))
const strata = computed(() => (d.value.stratified && stratumColumn.value ? buildStrata(rows.value, stratumColumn.value, valueColumn.value, p.value) : []))
watch(strata, (list) => {
  const next = {}
  list.forEach((h) => (next[h.key] = manualAlloc.value[h.key] ?? Math.min(h.N, 5)))
  manualAlloc.value = next
})
const designReady = computed(() => !d.value.stratified || (stratumColumn.value && strata.value.length >= 2))
const measure = computed(() => (valueColumn.value ? 'mean' : 'proportion'))
const valueStats = computed(() => (valueColumn.value ? describe(rows.value.map((r) => r[valueColumn.value])) : null))

const designOptions = DESIGNS
const stratumOptions = computed(() => stratumColumns.value.map((c) => ({ value: c.name, label: c.name, description: `${c.distinct} ангилал` })))
const valueOptions = computed(() => [
  { value: null, label: 'Ашиглахгүй — пропорцын горим', description: 'Алдаа, хазайлтын үзүүлэлт (%) дээр суурилна' },
  ...numericColumns.value.map((c) => ({ value: c.name, label: c.name, description: 'Тоон багана — дундажийн горим' })),
])

/* ---------------- Step 3: parameters ---------------- */
const confidence = ref(95)
const mode = ref('margin')
const marginInput = ref(null) // value units (mean) or % (proportion)
const sizeInput = ref(100)
const pInput = ref(50)
const seed = ref(newSeed())

const p = computed(() => Math.min(0.99, Math.max(0.01, (Number(pInput.value) || 50) / 100)))
const z = computed(() => zFor(confidence.value))
watch(
  [valueStats, measure],
  () => {
    // Default margin: 10% of the mean for values, 5 percentage points for proportions.
    if (measure.value === 'mean' && valueStats.value) marginInput.value = Math.round((valueStats.value.mean * 0.1) / 1000) * 1000 || 1
    else marginInput.value = 5
  },
  { immediate: true },
)
watch(allocation, (a) => {
  if (a === 'manual') mode.value = 'size'
})

const isManual = computed(() => design.value === 'nonproportional' && allocation.value === 'manual')
const manualTotal = computed(() => Object.values(manualAlloc.value).reduce((a, b) => a + (Number(b) || 0), 0))
const marginValue = computed(() => (measure.value === 'mean' ? Number(marginInput.value) : Number(marginInput.value) / 100))
const paramError = computed(() => {
  if (isManual.value) return manualTotal.value > 0 ? '' : 'Давхарга бүрийн түүврийн хэмжээг оруулна уу.'
  if (mode.value === 'margin' && !(marginValue.value > 0)) return 'Алдааны хязгаар 0-ээс их байна.'
  if (mode.value === 'size' && !(Number(sizeInput.value) >= 1)) return 'Түүврийн хэмжээ 1-ээс их байна.'
  if (mode.value === 'size' && !d.value.replacement && Number(sizeInput.value) > rows.value.length) return `Буцаалтгүй түүвэр эх олонлогоос (${rows.value.length}) их байж болохгүй.`
  return ''
})

function plan(seedValue = seed.value) {
  return runSampling({
    rows: rows.value,
    design: design.value,
    confidence: confidence.value,
    mode: mode.value,
    margin: marginValue.value,
    size: Number(sizeInput.value),
    valueColumn: valueColumn.value,
    stratumColumn: stratumColumn.value,
    allocation: design.value === 'proportional' ? 'proportional' : allocation.value,
    manualAlloc: manualAlloc.value,
    p: p.value,
    seed: seedValue,
  })
}
const preview = computed(() => (rows.value.length && designReady.value && !paramError.value ? plan() : null))

/* ---------------- Step 4: result ---------------- */
const result = ref(null)
const running = ref(false)
const exporting = ref(false)

async function run(fresh = false) {
  if (!canRun.value) return
  if (fresh) seed.value = newSeed()
  running.value = true
  await new Promise((r) => setTimeout(r, 280))
  result.value = { ...plan(), at: new Date().toISOString(), fileName: file.value.name, sheet: file.value.sheets[sheetIndex.value].name }
  running.value = false
  if (step.value !== 3) next()
  else toast.info('Шинэ түүвэр', `Seed ${seed.value} · ${result.value.n} мөр сонгогдлоо`)
}

const resultRows = computed(() =>
  (result.value?.selection ?? []).map((s) => ({ _order: s.order, _row: s.index + 2, _stratum: s.stratum, _count: s.count, ...rows.value[s.index] })),
)
const resultColumns = computed(() => {
  const cols = [
    { key: '_order', label: '№', numeric: true, sortable: true, width: '64px' },
    { key: '_row', label: 'Excel мөр', numeric: true, sortable: true, width: '96px' },
  ]
  if (result.value?.strata) cols.push({ key: '_stratum', label: 'Давхарга', sortable: true })
  if (result.value && designById(result.value.design).replacement) cols.push({ key: '_count', label: 'Давтамж', numeric: true, sortable: true })
  return [...cols, ...previewColumns.value.map((c) => ({ ...c, sortable: true }))]
})

const marginLabel = (r) => (r.measure === 'mean' ? `±${formatCompact(r.margin)}` : `±${formatNumber(r.margin * 100, 2)}%`)
const allocationLabel = (key) => ({ proportional: 'Пропорциональ', equal: 'Тэнцүү', neyman: 'Neyman', manual: 'Гараар' })[key] ?? key

async function exportResult() {
  const r = result.value
  exporting.value = true
  try {
    const sample = resultRows.value.map((row) => {
      const { _order, _row, _stratum, _count, ...rest } = row
      return {
        Дараалал: _order,
        'Эх мөр №': _row,
        ...(r.strata ? { Давхарга: _stratum } : {}),
        ...(designById(r.design).replacement ? { Давтамж: _count } : {}),
        ...rest,
      }
    })
    const params = [
      ['Үзүүлэлт', 'Утга'],
      ['Файл', r.fileName],
      ['Sheet', r.sheet],
      ['Эх олонлог (N)', r.N],
      ['Түүврийн дизайн', `${designById(r.design).label} — ${designById(r.design).title}`],
      ...(r.strata ? [['Давхаргын багана', stratumColumn.value], ['Хуваарилалт', allocationLabel(r.allocation)]] : []),
      ['Горим', r.measure === 'mean' ? `Дундаж (${valueColumn.value})` : `Пропорц (p = ${r.p})`],
      ['Итгэлцлийн түвшин', `${r.confidence}%`],
      ['z', r.z],
      ...(r.measure === 'mean' ? [['Стандарт хазайлт (σ)', Number(r.S.toFixed(4))]] : []),
      ['Алдааны хязгаар (E)', r.measure === 'mean' ? Number(r.margin.toFixed(2)) : `${(r.margin * 100).toFixed(3)}%`],
      ['Түүврийн хэмжээ (n)', r.n],
      ['Seed', r.seed],
      ['Санамсаргүй генератор', 'mulberry32 (DAHUB)'],
      ['Огноо', formatDateTime(r.at)],
      ['Гүйцэтгэсэн', `${user.value.lastName} ${user.value.firstName}`],
    ]
    const sheets = [
      { name: 'Түүвэр', rows: sample },
      { name: 'Параметр', aoa: params },
    ]
    if (r.strata)
      sheets.push({
        name: 'Давхарга',
        rows: r.strata.map((h) => ({ Давхарга: h.key, 'N_h': h.N, 'W_h (%)': Number((h.W * 100).toFixed(2)), 'σ_h': Number(h.S.toFixed(2)), 'n_h': h.n, 'Хамралт (%)': Number((h.f * 100).toFixed(2)) })),
      })
    await downloadWorkbook(`DAHUB_түүвэр_${r.design}_${r.seed}.xlsx`, sheets)
    toast.success('Excel файл хадгалагдлаа', `${r.n} мөр · Параметр${r.strata ? ', Давхарга' : ''} sheet-тэй`)
  } catch (e) {
    toast.error('Экспорт амжилтгүй', e.message)
  } finally {
    exporting.value = false
  }
}

const formulaValues = computed(() => {
  const pv = preview.value
  if (!pv) return null
  return { z: pv.z, S: pv.S, E: mode.value === 'margin' ? marginValue.value : pv.margin, N: pv.N, n: pv.n, p: p.value }
})
</script>

<template>
  <div class="page container">
    <PageHeader
      eyebrow="Хэрэгсэл"
      title="Санамсаргүй түүвэр"
      description="Excel өгөгдлөөс статистикийн аргаар түүвэр авч, томьёо, параметр, seed-ийг ажлын баримтад хавсаргах бүрэн тайлантайгаар хадгална."
    >
      <template #before>
        <RouterLink to="/tools" class="tools__back"><AppIcon name="arrow-left" :size="16" />Хэрэгслийн сан</RouterLink>
      </template>
    </PageHeader>

    <div class="grid tools">
      <div class="span-8 lg-span-12 tools__main">
        <BaseCard class="tools__stepper" v-reveal>
          <Stepper :steps="STEPS" :current="step" :max-reached="maxReached" @go="go" />
        </BaseCard>

        <!-- STEP 1 -->
        <Transition name="rise" mode="out-in">
          <BaseCard v-if="step === 0" key="s1" title="1. Өгөгдөл оруулах" subtitle="Эхний мөр нь баганын нэр байх Excel (.xlsx, .xls) эсвэл CSV файл.">
            <template v-if="!file">
              <FileDropzone @file="onFile" @error="readError = $event">
                <div class="tools__sample">
                  <BaseButton variant="subtle" size="sm" icon="database" @click="useSample">Жишээ өгөгдөл ашиглах</BaseButton>
                  <BaseButton variant="ghost" size="sm" icon="download" @click="downloadSample">Жишээ Excel татах</BaseButton>
                </div>
              </FileDropzone>
              <p v-if="reading" class="tools__status"><GSpinner :size="16" />Файлыг уншиж байна…</p>
              <p v-if="readError" class="tools__error"><AppIcon name="alert-circle" :size="16" />{{ readError }}</p>
            </template>

            <template v-else>
              <div class="file">
                <span class="file__icon"><AppIcon name="spreadsheet" :size="22" /></span>
                <div class="file__meta">
                  <p class="file__name">{{ file.name }}</p>
                  <p class="file__facts num">{{ formatNumber(rows.length) }} мөр · {{ columns.length }} багана<template v-if="file.size"> · {{ formatNumber(file.size / 1024, 0) }} КБ</template></p>
                </div>
                <SelectMenu
                  v-if="file.sheets.length > 1"
                  v-model="sheetIndex"
                  class="file__sheet"
                  size="sm"
                  :options="file.sheets.map((s, i) => ({ value: i, label: s.name, description: `${s.rows.length} мөр` }))"
                />
                <BaseButton variant="ghost" size="sm" icon="refresh" @click="resetFile">Өөр файл</BaseButton>
              </div>

              <div class="cols">
                <span v-for="c in columns" :key="c.name" class="col-chip">
                  <AppIcon :name="c.type === 'number' ? 'hash' : 'list'" :size="13" />{{ c.name }}
                  <Tag size="sm" :tone="c.type === 'number' ? 'primary' : 'neutral'">{{ c.type === 'number' ? 'Тоо' : 'Текст' }}</Tag>
                </span>
              </div>

              <DataTable :columns="previewColumns" :rows="rows.slice(0, 20)" :row-key="(r, i) => i" dense max-height="360px" caption="Эхний 20 мөр" />
              <p class="tools__hint">Эхний 20 мөрийг харуулж байна. Нийт {{ formatNumber(rows.length) }} мөр түүвэрлэлтэд орно.</p>
            </template>

            <template #footer>
              <div class="tools__nav">
                <span />
                <BaseButton icon-right="arrow-right" :disabled="!rows.length" @click="next">Дизайн сонгох</BaseButton>
              </div>
            </template>
          </BaseCard>

          <!-- STEP 2 -->
          <BaseCard v-else-if="step === 1" key="s2" title="2. Түүврийн дизайн" subtitle="Аудитын зорилгод тохирох аргыг сонгоно уу.">
            <div class="designs" role="radiogroup" aria-label="Түүврийн дизайн">
              <button
                v-for="o in designOptions"
                :key="o.id"
                type="button"
                role="radio"
                class="design"
                :class="{ 'is-active': design === o.id }"
                :aria-checked="design === o.id"
                @click="design = o.id"
              >
                <span class="design__top">
                  <span class="design__code">{{ o.label }}</span>
                  <span class="design__radio" aria-hidden="true" />
                </span>
                <span class="design__title">{{ o.title }}</span>
                <span class="design__desc">{{ o.description }}</span>
              </button>
            </div>

            <div class="tools__fields">
              <SelectMenu v-model="valueColumn" :options="valueOptions" label="Утгын багана (заавал биш)" :hint="valueStats ? `Дундаж ${formatCompact(valueStats.mean)} · σ ${formatCompact(valueStats.sd)}` : 'Утгын багана сонгоогүй үед пропорц (жишээ нь алдааны хувь) дээр тооцоолно.'" />
              <SelectMenu
                v-if="d.stratified"
                v-model="stratumColumn"
                :options="stratumOptions"
                label="Давхаргын багана"
                required
                :error="!stratumOptions.length ? '2–24 ангилалтай текст багана олдсонгүй.' : ''"
                placeholder="Багана сонгох"
              />
            </div>

            <div v-if="design === 'nonproportional'" class="tools__alloc">
              <span class="tools__label">Хуваарилалтын арга</span>
              <SegmentedControl v-model="allocation" :options="ALLOCATIONS.map((a) => ({ value: a.id, label: a.label }))" label="Хуваарилалт" />
            </div>

            <div v-if="d.stratified && strata.length" class="strata">
              <table class="strata__table">
                <thead>
                  <tr>
                    <th>Давхарга</th>
                    <th class="r">N<sub>h</sub></th>
                    <th class="r">W<sub>h</sub></th>
                    <th v-if="valueColumn" class="r">σ<sub>h</sub></th>
                    <th v-if="design === 'nonproportional' && allocation === 'manual'" class="r">n<sub>h</sub></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in strata" :key="h.key">
                    <td>{{ h.key }}</td>
                    <td class="r num">{{ formatNumber(h.N) }}</td>
                    <td class="r num">{{ formatNumber((h.N / rows.length) * 100, 1) }}%</td>
                    <td v-if="valueColumn" class="r num">{{ formatNumber(h.S, 0) }}</td>
                    <td v-if="design === 'nonproportional' && allocation === 'manual'" class="r">
                      <input
                        v-model.number="manualAlloc[h.key]"
                        class="strata__input num"
                        type="number"
                        min="0"
                        :max="h.N"
                        :aria-label="`${h.key} давхаргын түүврийн хэмжээ`"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <template #footer>
              <div class="tools__nav">
                <BaseButton variant="ghost" icon="arrow-left" @click="step = 0">Буцах</BaseButton>
                <BaseButton icon-right="arrow-right" :disabled="!designReady" @click="next">Параметр тохируулах</BaseButton>
              </div>
            </template>
          </BaseCard>

          <!-- STEP 3 -->
          <BaseCard v-else-if="step === 2" key="s3" title="3. Параметр" :subtitle="`${d.label} · ${measure === 'mean' ? `дундажийн горим (${valueColumn})` : 'пропорцын горим'}`">
            <div class="params">
              <div class="param">
                <span class="tools__label">Итгэлцлийн түвшин</span>
                <SegmentedControl v-model="confidence" :options="CONFIDENCE_LEVELS.map((c) => ({ value: c.value, label: `${c.value}%` }))" label="Итгэлцлийн түвшин" />
                <span class="param__hint num">z = {{ formatNumber(z, 3) }}</span>
              </div>
              <div v-if="!isManual" class="param">
                <span class="tools__label">Тооцоолох зүйл</span>
                <SegmentedControl
                  v-model="mode"
                  :options="[{ value: 'margin', label: 'Алдаанаас → n' }, { value: 'size', label: 'n-ээс → алдаа' }]"
                  label="Горим"
                />
              </div>
              <div v-else class="param">
                <span class="tools__label">Тооцоолох зүйл</span>
                <span class="param__hint">Гараар хуваарилсан тул n = Σ n<sub>h</sub> = <strong class="num">{{ manualTotal }}</strong>, алдааны хязгаарыг тооцно.</span>
              </div>
            </div>

            <div class="params">
              <TextField
                v-if="mode === 'margin'"
                v-model="marginInput"
                type="number"
                min="0"
                :label="measure === 'mean' ? `Алдааны хязгаар E (${valueColumn}-ийн нэгжээр)` : 'Алдааны хязгаар E (%)'"
                :hint="measure === 'mean' ? `Дундаж ${formatNumber(valueStats?.mean ?? 0, 0)}-ийн ${formatNumber((marginValue / (valueStats?.mean || 1)) * 100, 1)}%` : 'Жишээ: 5 = ±5 пп'"
              />
              <TextField v-else-if="!isManual" v-model="sizeInput" type="number" min="1" :max="rows.length" label="Түүврийн хэмжээ n" :hint="`1 – ${formatNumber(rows.length)}`" />
              <TextField v-if="measure === 'proportion'" v-model="pInput" type="number" min="1" max="99" label="Хүлээгдэж буй пропорц p (%)" hint="Мэдэхгүй бол 50% (хамгийн болгоомжтой)" />
              <TextField v-model="seed" type="number" label="Seed (давтагдах боломжтой)" hint="Ижил seed → ижил түүвэр">
                <template #suffix><IconButton icon="refresh" label="Шинэ seed" size="sm" @click="seed = newSeed()" /></template>
              </TextField>
            </div>

            <div class="estimate" :class="{ 'is-error': paramError }" aria-live="polite">
              <template v-if="paramError"><AppIcon name="alert-circle" :size="18" />{{ paramError }}</template>
              <template v-else-if="preview">
                <div class="estimate__item"><span>Эх олонлог</span><strong class="num">{{ formatNumber(preview.N) }}</strong></div>
                <div class="estimate__item"><span>Түүврийн хэмжээ</span><strong class="num">{{ formatNumber(preview.n) }}</strong></div>
                <div class="estimate__item"><span>Алдааны хязгаар</span><strong class="num">{{ marginLabel(preview) }}</strong></div>
                <div class="estimate__item"><span>Хамралт</span><strong class="num">{{ formatNumber((preview.n / preview.N) * 100, 1) }}%</strong></div>
              </template>
            </div>

            <p v-if="!d.replacement" class="tools__hint"><AppIcon name="info" :size="14" />Буцаалтгүй дизайнд төгсгөлөг олонлогийн засвар (FPC) автоматаар хэрэглэгдэнэ.</p>
            <p v-if="!canRun" class="tools__error"><AppIcon name="lock" :size="16" />Танд түүвэр гүйцэтгэх («Хэрэгсэл — Засах») эрх олгогдоогүй байна.</p>

            <template #footer>
              <div class="tools__nav">
                <BaseButton variant="ghost" icon="arrow-left" @click="step = 1">Буцах</BaseButton>
                <BaseButton icon="shuffle" :loading="running" :disabled="!!paramError || !preview || !canRun" @click="run()">Түүвэр авах</BaseButton>
              </div>
            </template>
          </BaseCard>

          <!-- STEP 4 -->
          <BaseCard v-else key="s4" title="4. Үр дүн" :subtitle="result ? `${designById(result.design).title} · ${formatDateTime(result.at)}` : ''">
            <template #actions>
              <BaseButton v-if="result" icon="download" :loading="exporting" @click="exportResult">Excel татах</BaseButton>
            </template>
            <template v-if="result">
              <div class="summary">
                <div class="summary__item"><span>N</span><strong class="num">{{ formatNumber(result.N) }}</strong><em>эх олонлог</em></div>
                <div class="summary__item is-key"><span>n</span><strong class="num">{{ formatNumber(result.n) }}</strong><em>түүвэр</em></div>
                <div class="summary__item"><span>E</span><strong class="num">{{ marginLabel(result) }}</strong><em>алдааны хязгаар</em></div>
                <div class="summary__item"><span>{{ result.measure === 'mean' ? 'σ' : 'p' }}</span><strong class="num">{{ result.measure === 'mean' ? formatCompact(result.S) : formatNumber(result.p * 100, 0) + '%' }}</strong><em>{{ result.measure === 'mean' ? 'стандарт хазайлт' : 'пропорц' }}</em></div>
                <div class="summary__item"><span>z</span><strong class="num">{{ formatNumber(result.z, 3) }}</strong><em>{{ result.confidence }}% итгэлцэл</em></div>
                <div class="summary__item"><span>seed</span><strong class="num">{{ result.seed }}</strong><em>давтагдах түлхүүр</em></div>
              </div>

              <div v-if="result.strata" class="strata">
                <table class="strata__table">
                  <thead>
                    <tr><th>Давхарга</th><th class="r">N<sub>h</sub></th><th class="r">W<sub>h</sub></th><th class="r">n<sub>h</sub></th><th class="r">Хамралт</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="h in result.strata" :key="h.key">
                      <td>{{ h.key }}</td>
                      <td class="r num">{{ formatNumber(h.N) }}</td>
                      <td class="r num">{{ formatNumber(h.W * 100, 1) }}%</td>
                      <td class="r num"><strong>{{ h.n }}</strong></td>
                      <td class="r num">{{ formatNumber(h.f * 100, 1) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <DataTable :columns="resultColumns" :rows="resultRows" :row-key="(r) => r._order" :page-size="15" dense caption="Сонгогдсон түүвэр">
                <template #cell-_order="{ value }"><span class="res__order num">{{ value }}</span></template>
                <template #cell-_count="{ value }"><Tag v-if="value > 1" tone="warning" size="sm">×{{ value }}</Tag><span v-else class="subtle">1</span></template>
              </DataTable>
            </template>

            <template #footer>
              <div class="tools__nav">
                <div class="row">
                  <BaseButton variant="ghost" icon="sliders" @click="step = 2">Параметр засах</BaseButton>
                  <BaseButton variant="ghost" icon="upload" @click="resetFile">Шинэ файл</BaseButton>
                </div>
                <BaseButton variant="secondary" icon="refresh" :loading="running" :disabled="!canRun" @click="run(true)">Шинэ seed-ээр дахин түүвэрлэх</BaseButton>
              </div>
            </template>
          </BaseCard>
        </Transition>
      </div>

      <aside class="span-4 lg-span-12 tools__side">
        <div class="tools__sticky">
          <FormulaCard :design="design" :measure="measure" :allocation="design === 'proportional' ? 'proportional' : allocation" :values="formulaValues" v-reveal="1" />
          <BaseCard title="Сессийн хураангуй" class="session" v-reveal="2">
            <dl class="session__list">
              <div><dt>Файл</dt><dd>{{ file?.name ?? '—' }}</dd></div>
              <div><dt>Мөр</dt><dd class="num">{{ rows.length ? formatNumber(rows.length) : '—' }}</dd></div>
              <div><dt>Дизайн</dt><dd>{{ d.label }}</dd></div>
              <div v-if="d.stratified"><dt>Давхарга</dt><dd>{{ stratumColumn ?? '—' }}<template v-if="strata.length"> ({{ strata.length }})</template></dd></div>
              <div v-if="design === 'nonproportional'"><dt>Хуваарилалт</dt><dd>{{ allocationLabel(allocation) }}</dd></div>
              <div><dt>Утгын багана</dt><dd>{{ valueColumn ?? 'Пропорц' }}</dd></div>
              <div><dt>Итгэлцэл</dt><dd class="num">{{ confidence }}%</dd></div>
              <div><dt>Seed</dt><dd class="num">{{ seed }}</dd></div>
            </dl>
          </BaseCard>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.tools__back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: var(--space-2); font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-3); align-self: flex-start; }
.tools__back:hover { color: var(--primary); text-decoration: none; }
.tools { align-items: start; }
.tools__main { display: flex; flex-direction: column; gap: var(--gutter); min-width: 0; }
.tools__stepper { padding: 20px 24px; }
.tools__sticky { position: sticky; top: calc(var(--nav-top-sticky) + 24px); display: flex; flex-direction: column; gap: var(--gutter); }
.tools__sample { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.tools__status, .tools__error, .tools__hint { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: var(--fs-sm); }
.tools__status { color: var(--text-2); }
.tools__error { color: var(--danger); }
.tools__hint { color: var(--text-3); font-size: var(--fs-xs); }
.tools__nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.tools__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); }
.tools__fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
.tools__alloc { display: flex; align-items: center; gap: 16px; margin-top: 20px; flex-wrap: wrap; }

.file { display: flex; align-items: center; gap: 14px; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-2); margin-bottom: 16px; flex-wrap: wrap; }
.file__icon { width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center; background: var(--success-soft); color: var(--success); flex: none; }
.file__meta { flex: 1; min-width: 180px; }
.file__name { font-weight: var(--fw-semibold); word-break: break-all; }
.file__facts { font-size: var(--fs-xs); color: var(--text-3); margin-top: 2px; }
.file__sheet { width: 180px; }

.cols { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.col-chip { display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 4px 0 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); font-size: var(--fs-xs); color: var(--text-2); }
.col-chip .icon { color: var(--text-3); }

.designs { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.design {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  transition: border-color var(--dur-fast), background-color var(--dur-fast), box-shadow var(--dur-fast);
}
.design:hover { border-color: var(--border-strong); }
.design:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.design.is-active { border-color: var(--primary); background: color-mix(in srgb, var(--primary-soft) 60%, var(--surface)); }
.design.is-active::before { content: ''; position: absolute; top: -1px; left: 16px; width: 32px; height: 2px; border-radius: 2px; background: var(--accent); }
.design__top { display: flex; justify-content: space-between; align-items: center; }
.design__code { font-family: var(--font-mono); font-size: var(--fs-xs); font-weight: var(--fw-semibold); color: var(--primary); letter-spacing: 0.02em; }
.design__radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border-strong); display: grid; place-items: center; }
.design.is-active .design__radio { border-color: var(--primary); box-shadow: inset 0 0 0 4px var(--surface), inset 0 0 0 9px var(--primary); }
.design__title { font-weight: var(--fw-semibold); font-size: var(--fs-sm); margin-top: 6px; }
.design__desc { font-size: var(--fs-xs); color: var(--text-3); line-height: 1.5; }

.strata { margin-top: 20px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.strata__table { font-size: var(--fs-sm); }
.strata__table th { text-align: left; padding: 10px 14px; background: var(--surface-2); color: var(--text-3); font-size: var(--fs-xs); font-weight: var(--fw-semibold); border-bottom: 1px solid var(--border); }
.strata__table td { padding: 9px 14px; border-bottom: 1px solid var(--border); }
.strata__table tr:last-child td { border-bottom: 0; }
.strata__table .r { text-align: right; }
.strata__input { width: 88px; height: 30px; padding: 0 8px; border-radius: 6px; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text); text-align: right; }
.strata__input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }

.params { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 20px; align-items: start; }
.param { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.param__hint { font-size: var(--fs-xs); color: var(--text-3); }

.estimate { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; border-radius: 12px; overflow: hidden; background: var(--border); border: 1px solid var(--border); }
.estimate.is-error { display: flex; align-items: center; gap: 8px; padding: 14px 16px; background: var(--danger-soft); color: var(--danger); border-color: transparent; font-size: var(--fs-sm); }
.estimate__item { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; background: var(--surface-2); }
.estimate__item span { font-size: var(--fs-xs); color: var(--text-3); }
.estimate__item strong { font-size: var(--fs-xl); font-weight: var(--fw-semibold); }

.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.summary__item { display: flex; flex-direction: column; gap: 2px; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface-2); min-width: 0; }
.summary__item span { font-family: var(--font-display); font-style: italic; font-size: var(--fs-sm); color: var(--primary); }
.summary__item strong { font-size: var(--fs-lg); font-weight: var(--fw-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.summary__item em { font-style: normal; font-size: 11px; color: var(--text-3); }
.summary__item.is-key { border-color: var(--primary); background: var(--primary-soft); }
.res__order { color: var(--text-3); }

.session__list { margin: 0; display: flex; flex-direction: column; }
.session__list div { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px dashed var(--border); font-size: var(--fs-sm); }
.session__list div:last-child { border-bottom: 0; }
.session__list dt { color: var(--text-3); flex: none; }
.session__list dd { margin: 0; text-align: right; color: var(--text); min-width: 0; overflow-wrap: anywhere; }

@media (max-width: 1279px) {
  .tools__sticky { position: static; display: grid; grid-template-columns: 1fr 1fr; align-items: start; }
}
@media (max-width: 767px) {
  .tools__sticky, .designs, .tools__fields { grid-template-columns: 1fr; }
  .estimate { grid-template-columns: 1fr 1fr; }
  .summary { grid-template-columns: 1fr 1fr; }
}
</style>

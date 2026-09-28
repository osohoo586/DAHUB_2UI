<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import TextField from '@/components/ui/TextField.vue'
import IconButton from '@/components/ui/IconButton.vue'
import Tag from '@/components/ui/Tag.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import RiskHeatmap from '@/components/charts/RiskHeatmap.vue'
import RiskCard from '@/components/cards/RiskCard.vue'
import AssessmentCard from '@/components/cards/AssessmentCard.vue'
import {
  RISK_TYPES,
  RISK_LEVELS,
  RISK_STATUS,
  LIKELIHOOD,
  IMPACT,
  getRisks,
  getAssessment,
  createRisk,
  updateRisk,
  deleteRisk,
  riskScore,
  levelFor,
} from '@/services/risk'
import { useMembersStore } from '@/stores/members'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { clone } from '@/utils/clone'

const route = useRoute()
const router = useRouter()
const members = useMembersStore()
const { can } = useAuth()
const toast = useToast()
members.load()

const tab = ref(RISK_TYPES.some((t) => t.key === route.query.tab) ? route.query.tab : 'operational')
const risks = ref([])
const assessment = ref(null)
const loading = ref(true)
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
watch(
  () => [route.query.tab, route.query.q],
  ([t, v]) => {
    if (typeof t === 'string' && RISK_TYPES.some((x) => x.key === t) && t !== tab.value) tab.value = t
    if (typeof v === 'string') q.value = v
  },
)
const cell = ref(null)
const levels = ref([])
const status = ref('all')
const sort = ref('score')

async function load() {
  loading.value = true
  const [r, a] = await Promise.all([getRisks(tab.value), getAssessment(tab.value)])
  risks.value = r
  assessment.value = a
  loading.value = false
}
watch(tab, () => {
  cell.value = null
  levels.value = []
  status.value = 'all'
  router.replace({ query: { tab: tab.value, ...(q.value ? { q: q.value } : {}) } })
  load()
})
load()

const tabs = RISK_TYPES.map((t) => ({ key: t.key, label: t.label, icon: t.key === 'it' ? 'cpu' : 'briefcase' }))

const levelCounts = computed(() =>
  RISK_LEVELS.map((l) => ({ ...l, count: risks.value.filter((r) => r.status !== 'closed' && levelFor(riskScore(r)).key === l.key).length })),
)

function toggleLevel(key) {
  levels.value = levels.value.includes(key) ? levels.value.filter((k) => k !== key) : [...levels.value, key]
}

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  let list = risks.value.filter((r) => {
    if (cell.value && (r.likelihood !== cell.value.l || r.impact !== cell.value.i)) return false
    if (levels.value.length && !levels.value.includes(levelFor(riskScore(r)).key)) return false
    if (status.value !== 'all' && r.status !== status.value) return false
    if (needle) {
      const owner = members.byId(r.ownerId)
      const hay = [r.id, r.title, r.category, r.unit, r.description, owner?.firstName, owner?.lastName].join(' ').toLowerCase()
      if (!hay.includes(needle)) return false
    }
    return true
  })
  const by = {
    score: (a, b) => riskScore(b) - riskScore(a) || a.id.localeCompare(b.id),
    due: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    id: (a, b) => a.id.localeCompare(b.id),
  }
  return [...list].sort(by[sort.value])
})
const hasFilters = computed(() => cell.value || levels.value.length || status.value !== 'all' || q.value)
function clearFilters() {
  cell.value = null
  levels.value = []
  status.value = 'all'
  q.value = ''
}

const statusOptions = [{ value: 'all', label: 'Бүх статус' }, ...RISK_STATUS.map((s) => ({ value: s.key, label: s.label }))]
const sortOptions = [
  { value: 'score', label: 'Оноогоор (их → бага)' },
  { value: 'due', label: 'Хугацаагаар' },
  { value: 'updated', label: 'Сүүлд шинэчлэгдсэн' },
  { value: 'id', label: 'Кодоор' },
]

/* ---------------- form ---------------- */
const CATEGORIES = {
  operational: ['Зээл', 'Салбар', 'Төлбөр тооцоо', 'Залилан', 'Комплаенс', 'Гадаад үйлчилгээ', 'Хүний нөөц', 'Хэрэглэгч', 'Трейжери', 'Мэдээллийн хамгаалалт', 'Санхүүгийн тайлагнал'],
  it: ['Хандалт', 'Өөрчлөлт', 'Нөөцлөлт / BCP', 'Кибер', 'Үйлдлийн систем'],
}
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = ref(blank())
const errors = ref({})
function blank() {
  return { title: '', category: CATEGORIES[tab.value][0], unit: '', description: '', likelihood: 3, impact: 3, ownerId: null, controls: [''], status: 'open', dueDate: '' }
}
function openCreate() {
  editing.value = null
  form.value = blank()
  errors.value = {}
  formOpen.value = true
}
function openEdit(r) {
  editing.value = r
  form.value = { ...clone(r), controls: r.controls.length ? [...r.controls] : [''] }
  errors.value = {}
  formOpen.value = true
}
const formScore = computed(() => form.value.likelihood * form.value.impact)
const formLevel = computed(() => levelFor(formScore.value))
const ownerOptions = computed(() =>
  members.list.filter((m) => m.unitId !== 'leadership').map((m) => ({ value: m.id, label: `${m.lastName} ${m.firstName}`, description: m.position })),
)
const categoryOptions = computed(() => CATEGORIES[tab.value].map((c) => ({ value: c, label: c })))
const scaleOptions = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))

function validate() {
  const f = form.value
  const e = {}
  if (f.title.trim().length < 6) e.title = 'Эрсдэлийн нэрийг тодорхой бичнэ үү (6+ тэмдэгт).'
  if (!f.unit.trim()) e.unit = 'Хамаарах нэгжийг оруулна уу.'
  if (!f.ownerId) e.ownerId = 'Эзэмшигчийг сонгоно уу.'
  if (!f.dueDate) e.dueDate = 'Хугацааг сонгоно уу.'
  if (!f.controls.some((c) => c.trim())) e.controls = 'Дор хаяж нэг хяналтын арга хэмжээ оруулна уу.'
  errors.value = e
  return !Object.keys(e).length
}
async function save() {
  if (!validate()) return
  saving.value = true
  const payload = { ...form.value, title: form.value.title.trim(), unit: form.value.unit.trim(), controls: form.value.controls.map((c) => c.trim()).filter(Boolean) }
  if (editing.value) {
    const updated = await updateRisk(tab.value, editing.value.id, payload)
    risks.value = risks.value.map((r) => (r.id === updated.id ? updated : r))
    toast.success('Эрсдэл шинэчлэгдлээ', `${updated.id} · ${updated.title}`)
  } else {
    const created = await createRisk(tab.value, payload)
    risks.value = [created, ...risks.value]
    toast.success('Шинэ эрсдэл бүртгэгдлээ', `${created.id} · ${levelFor(riskScore(created)).label} түвшин`)
  }
  saving.value = false
  formOpen.value = false
}

const toDelete = ref(null)
const deleting = ref(false)
async function confirmDelete() {
  deleting.value = true
  await deleteRisk(tab.value, toDelete.value.id)
  risks.value = risks.value.filter((r) => r.id !== toDelete.value.id)
  toast.info('Эрсдэл устгагдлаа', toDelete.value.id)
  deleting.value = false
  toDelete.value = null
}
</script>

<template>
  <div class="page container">
    <PageHeader eyebrow="Эрсдэлд суурилсан аудит" title="Эрсдэлийн үнэлгээ" description="Магадлал × нөлөөллийн матрицаар эрсдэлийг эрэмбэлж, хяналтын арга хэмжээ ба үнэлгээний явцыг нэг дор хянана.">
      <template #actions>
        <BaseButton v-if="can('risk', 'edit')" icon="plus" @click="openCreate">Шинэ эрсдэл</BaseButton>
      </template>
    </PageHeader>

    <div class="risk__tabs" v-reveal="1"><Tabs v-model="tab" :items="tabs" label="Үнэлгээний төрөл" /></div>

    <div class="grid risk__top">
      <BaseCard class="span-7 lg-span-12" title="Магадлал × Нөлөөлөл" subtitle="Нүдэн дээр дарж бүртгэлийг шүүнэ" v-reveal>
        <template #actions>
          <Tag v-if="cell" tone="primary" size="md">
            {{ LIKELIHOOD[cell.l - 1] }} × {{ IMPACT[cell.i - 1] }}
            <button type="button" class="risk__chip-x" aria-label="Нүдний шүүлтүүр арилгах" @click="cell = null"><AppIcon name="x" :size="12" :stroke="2" /></button>
          </Tag>
        </template>
        <RiskHeatmap v-if="!loading" class="risk__hm" :risks="risks.filter((r) => r.status !== 'closed')" :selected="cell" @select="cell = $event" />
        <Skeleton v-else height="320px" radius="12px" />
      </BaseCard>
      <div class="span-5 lg-span-12" v-reveal="1">
        <AssessmentCard v-if="assessment" :assessment="assessment" :lead="members.byId(assessment.leadId)" :level-counts="levelCounts" />
        <BaseCard v-else><Skeleton :lines="6" height="20px" /></BaseCard>
      </div>
    </div>

    <section class="section-tight" aria-labelledby="register-title">
      <div class="risk__bar">
        <div>
          <h2 id="register-title" class="risk__h">Эрсдэлийн бүртгэл</h2>
          <p class="risk__count num">{{ filtered.length }} / {{ risks.length }} эрсдэл</p>
        </div>
        <div class="risk__tools">
          <SearchInput v-model="q" class="risk__search" placeholder="Код, нэр, нэгж, эзэмшигч…" label="Эрсдэл хайх" />
          <SelectMenu v-model="status" :options="statusOptions" class="risk__select" size="sm" />
          <SelectMenu v-model="sort" :options="sortOptions" class="risk__select" size="sm" />
        </div>
      </div>
      <div class="risk__levels" role="group" aria-label="Түвшнээр шүүх">
        <button
          v-for="l in levelCounts"
          :key="l.key"
          type="button"
          class="lchip"
          :class="[`is-${l.key}`, { 'is-on': levels.includes(l.key) }]"
          :aria-pressed="levels.includes(l.key)"
          @click="toggleLevel(l.key)"
        >
          <span class="lchip__dot" />{{ l.label }}<span class="lchip__n num">{{ l.count }}</span>
        </button>
        <button v-if="hasFilters" type="button" class="risk__clear" @click="clearFilters"><AppIcon name="x" :size="14" />Шүүлтүүр арилгах</button>
      </div>

      <TransitionGroup v-if="filtered.length" tag="div" name="list" class="grid risk__list">
        <div v-for="(r, i) in filtered" :key="r.id" class="span-4 lg-span-6 md-span-12 risk__item" v-reveal="i % 3">
          <RiskCard
            :risk="r"
            :owner="members.byId(r.ownerId)"
            :can-edit="can('risk', 'edit')"
            :can-delete="can('risk', 'delete')"
            @edit="openEdit"
            @delete="toDelete = $event"
          />
        </div>
      </TransitionGroup>
      <BaseCard v-else-if="!loading">
        <EmptyState variant="search" title="Шүүлтүүрт тохирох эрсдэл алга" description="Матрицын нүд, түвшин эсвэл хайлтын нөхцөлөө өөрчилж үзнэ үү.">
          <BaseButton variant="secondary" icon="x" @click="clearFilters">Шүүлтүүр арилгах</BaseButton>
        </EmptyState>
      </BaseCard>
    </section>

    <BaseModal v-model:open="formOpen" :title="editing ? `${editing.id} засах` : 'Шинэ эрсдэл'" :description="RISK_TYPES.find((t) => t.key === tab).label" size="lg">
      <form class="rf" novalidate @submit.prevent="save">
        <TextField v-model="form.title" label="Эрсдэлийн нэр" required :error="errors.title" placeholder="Жишээ: Давуу эрхтэй хэрэглэгчийн хяналт сул" />
        <div class="rf__row">
          <SelectMenu v-model="form.category" :options="categoryOptions" label="Ангилал" required />
          <TextField v-model="form.unit" label="Хамаарах нэгж" required :error="errors.unit" placeholder="Жишээ: МТ газар" />
        </div>
        <TextField v-model="form.description" label="Тайлбар" multiline :rows="3" placeholder="Нөхцөл байдал, илэрсэн шинж тэмдэг" />

        <div class="rf__score">
          <div class="rf__scale">
            <span class="rf__label">Магадлал · <strong>{{ LIKELIHOOD[form.likelihood - 1] }}</strong></span>
            <SegmentedControl v-model="form.likelihood" :options="scaleOptions" label="Магадлал" block />
          </div>
          <div class="rf__scale">
            <span class="rf__label">Нөлөөлөл · <strong>{{ IMPACT[form.impact - 1] }}</strong></span>
            <SegmentedControl v-model="form.impact" :options="scaleOptions" label="Нөлөөлөл" block />
          </div>
          <div class="rf__result" :class="`is-${formLevel.key}`" aria-live="polite">
            <span class="rf__result-score num">{{ formScore }}</span>
            <span class="rf__result-label">{{ formLevel.label }}</span>
          </div>
        </div>

        <div class="rf__row">
          <SelectMenu v-model="form.ownerId" :options="ownerOptions" label="Эзэмшигч (аудитор)" required :error="errors.ownerId" placeholder="Гишүүн сонгох" />
          <TextField v-model="form.dueDate" type="date" label="Хугацаа" required :error="errors.dueDate" />
        </div>

        <div class="rf__controls">
          <span class="rf__label">Хяналтын арга хэмжээ<span class="req">*</span></span>
          <div v-for="(c, i) in form.controls" :key="i" class="rf__control">
            <TextField v-model="form.controls[i]" :placeholder="`Хяналт ${i + 1}`" size="sm" />
            <IconButton icon="minus" label="Хасах" size="sm" :disabled="form.controls.length === 1" @click="form.controls.splice(i, 1)" />
          </div>
          <BaseButton variant="ghost" size="sm" icon="plus" @click="form.controls.push('')">Хяналт нэмэх</BaseButton>
          <p v-if="errors.controls" class="rf__err">{{ errors.controls }}</p>
        </div>

        <div class="rf__status">
          <span class="rf__label">Статус</span>
          <SegmentedControl v-model="form.status" :options="RISK_STATUS.map((s) => ({ value: s.key, label: s.label }))" label="Статус" />
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="formOpen = false">Болих</BaseButton>
        <BaseButton icon="check" :loading="saving" @click="save">{{ editing ? 'Хадгалах' : 'Бүртгэх' }}</BaseButton>
      </template>
    </BaseModal>

    <ConfirmDialog
      :open="!!toDelete"
      title="Эрсдэлийг устгах уу?"
      :message="toDelete ? `${toDelete.id} · ${toDelete.title} — бүртгэлээс бүрмөсөн хасагдана.` : ''"
      :loading="deleting"
      @update:open="!$event && (toDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.risk__tabs { margin-bottom: var(--space-6); }
.risk__top { align-items: stretch; }
.risk__top > * { min-width: 0; }
.risk__hm { margin-block: auto; }
.risk__chip-x { display: inline-grid; place-items: center; width: 16px; height: 16px; margin-left: 2px; border-radius: 50%; color: inherit; }
.risk__chip-x:hover { background: var(--primary-soft-2); }
.risk__bar { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.risk__h { font-size: var(--fs-2xl); }
.risk__count { font-size: var(--fs-sm); color: var(--text-3); margin-top: 2px; }
.risk__tools { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.risk__search { width: 300px; }
.risk__select { width: 200px; }
.risk__levels { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; align-items: center; }
.lchip {
  --c: var(--risk-low);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: var(--fs-sm);
  color: var(--text-2);
  transition: all var(--dur-fast);
}
.lchip.is-medium { --c: var(--risk-medium); }
.lchip.is-high { --c: var(--risk-high); }
.lchip.is-critical { --c: var(--risk-critical); }
.lchip:hover { border-color: var(--border-strong); }
.lchip.is-on { border-color: var(--c); background: color-mix(in srgb, var(--c) 14%, var(--surface)); color: var(--text); }
.lchip:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.lchip__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
.lchip__n { font-size: var(--fs-xs); color: var(--text-3); }
.risk__clear { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-sm); color: var(--primary); padding: 0 8px; height: 32px; border-radius: 8px; }
.risk__clear:hover { background: var(--primary-soft); }
.risk__list { position: relative; }
.risk__item { display: flex; }
.risk__item > * { flex: 1; }

.rf { display: flex; flex-direction: column; gap: 16px; }
.rf__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.rf__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); }
.rf__label strong { color: var(--text); }
.req { color: var(--danger); margin-left: 2px; }
.rf__score { display: grid; grid-template-columns: 1fr 1fr 120px; gap: 16px; align-items: end; padding: 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--border); }
.rf__scale { display: flex; flex-direction: column; gap: 8px; }
.rf__result { --c: var(--risk-low); height: 64px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: color-mix(in srgb, var(--c) 18%, var(--surface)); border: 1px solid color-mix(in srgb, var(--c) 45%, transparent); transition: background-color var(--dur-base); }
.rf__result.is-medium { --c: var(--risk-medium); }
.rf__result.is-high { --c: var(--risk-high); }
.rf__result.is-critical { --c: var(--risk-critical); }
.rf__result-score { font-size: var(--fs-2xl); font-weight: var(--fw-semibold); line-height: 1; }
.rf__result-label { font-size: var(--fs-xs); color: var(--text-2); margin-top: 2px; }
.rf__controls { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.rf__control { display: flex; gap: 6px; width: 100%; align-items: center; }
.rf__control > :first-child { flex: 1; }
.rf__err { font-size: var(--fs-xs); color: var(--danger); }
.rf__status { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
@media (max-width: 1023px) {
  .risk__search { width: 100%; }
  .risk__tools { width: 100%; }
}
@media (max-width: 767px) {
  .rf__row, .rf__score { grid-template-columns: 1fr; }
}
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import DataTable from '@/components/ui/DataTable.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Tag from '@/components/ui/Tag.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MemberCard from '@/components/cards/MemberCard.vue'
import MemberForm from '@/components/cards/MemberForm.vue'
import PermissionMatrix from '@/components/cards/PermissionMatrix.vue'
import OrgTree from '@/components/cards/OrgTree.vue'
import { useMembersStore } from '@/stores/members'
import { usePermissionsStore } from '@/stores/permissions'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const members = useMembersStore()
const perms = usePermissionsStore()
const { can, auth, role } = useAuth()
const toast = useToast()
members.load()

const TAB_KEYS = ['structure', 'list', 'access']
const tab = ref(TAB_KEYS.includes(route.query.tab) ? route.query.tab : route.query.q ? 'list' : 'structure')
watch(tab, (t) => router.replace({ query: t === 'structure' ? {} : { tab: t } }))
const tabs = computed(() => [
  { key: 'structure', label: 'Бүтэц', icon: 'network' },
  { key: 'list', label: 'Гишүүд', icon: 'users', count: members.list.length },
  { key: 'access', label: 'Эрхийн тохиргоо', icon: 'key' },
])

/* ---- list ---- */
const VIEW_KEY = 'dahub.members.view'
const view = ref((() => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'table' ? 'table' : 'cards'
  } catch {
    return 'cards'
  }
})())
watch(view, (v) => {
  try {
    localStorage.setItem(VIEW_KEY, v)
  } catch {
    /* ignore */
  }
})
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
watch(() => route.query.q, (v) => {
  if (typeof v === 'string') {
    q.value = v
    tab.value = 'list'
  }
})
const unit = ref('all')
const roleFilter = ref('all')

const unitOptions = computed(() => [{ value: 'all', label: 'Бүх нэгж' }, ...members.units.map((u) => ({ value: u.id, label: u.name }))])
const roleOptions = computed(() => [{ value: 'all', label: 'Бүх эрх' }, ...perms.roles.map((r) => ({ value: r.key, label: r.label }))])

const filtered = computed(() => {
  const needle = q.value.trim().toLowerCase()
  const order = members.units.map((u) => u.id)
  return members.list
    .filter((m) => unit.value === 'all' || m.unitId === unit.value)
    .filter((m) => roleFilter.value === 'all' || m.role === roleFilter.value)
    .filter((m) => !needle || [m.lastName, m.firstName, m.position, m.latin, members.unitName(m.unitId)].join(' ').toLowerCase().includes(needle))
    .sort((a, b) => order.indexOf(a.unitId) - order.indexOf(b.unitId) || a.id.localeCompare(b.id))
})

const columns = [
  { key: 'name', label: 'Гишүүн', sortable: true, sortValue: (r) => `${r.lastName} ${r.firstName}` },
  { key: 'position', label: 'Албан тушаал', sortable: true },
  { key: 'unit', label: 'Нэгж', sortable: true, sortValue: (r) => members.unitName(r.unitId) },
  { key: 'role', label: 'Эрх', sortable: true, sortValue: (r) => perms.roleLabel(r.role) },
  { key: 'email', label: 'И-мэйл' },
  { key: 'phone', label: 'Утас', numeric: true },
  { key: 'joinedAt', label: 'Ажилд орсон', sortable: true, numeric: true, format: (v) => formatDate(v) },
  { key: 'actions', label: '', align: 'right', width: '56px' },
]

function menuFor(m) {
  const items = []
  if (can('members', 'edit')) items.push({ label: 'Засах', icon: 'pencil', action: () => openEdit(m) })
  if (can('members', 'delete')) items.push({ label: 'Устгах', icon: 'trash', tone: 'danger', action: () => askDelete(m) })
  return items
}

/* ---- create / edit ---- */
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
function openCreate() {
  editing.value = null
  formOpen.value = true
}
function openEdit(m) {
  editing.value = m
  formOpen.value = true
}
async function save(data) {
  saving.value = true
  try {
    if (editing.value) {
      const m = await members.update(editing.value.id, data)
      auth.refreshMember(m)
      toast.success('Мэдээлэл шинэчлэгдлээ', `${m.lastName} ${m.firstName}`)
    } else {
      const m = await members.create(data)
      toast.success('Гишүүн нэмэгдлээ', `${m.lastName} ${m.firstName} · ${perms.roleLabel(m.role)}`)
    }
    formOpen.value = false
  } finally {
    saving.value = false
  }
}

/* ---- delete ---- */
const toDelete = ref(null)
const deleting = ref(false)
function askDelete(m) {
  if (m.id === auth.member?.id) {
    toast.warning('Өөрийгөө устгах боломжгүй', 'Өөр админаар дамжуулан хийнэ үү.')
    return
  }
  toDelete.value = m
}
async function confirmDelete() {
  deleting.value = true
  await members.remove(toDelete.value.id)
  toast.info('Гишүүн хасагдлаа', `${toDelete.value.lastName} ${toDelete.value.firstName}`)
  deleting.value = false
  toDelete.value = null
}

/* ---- permissions ---- */
const isAdmin = computed(() => role.value === 'admin')
const memberCounts = computed(() => members.list.reduce((acc, m) => ({ ...acc, [m.role]: (acc[m.role] || 0) + 1 }), {}))
const myModules = computed(() => perms.modules.filter((m) => perms.can(role.value, m.key, 'view')).map((m) => m.label))
function onPermChange({ role: r, module, action, value }) {
  const mod = perms.modules.find((m) => m.key === module)
  const msg = `${perms.roleLabel(r)} · ${mod.label} · ${perms.actionLabels[action]} ${value ? 'нээгдлээ' : 'хаагдлаа'}`
  if (r === role.value) toast.info('Таны эрх шинэчлэгдлээ', msg)
  else toast.success('Эрх хадгалагдлаа', msg)
}
const resetting = ref(false)
async function resetPerms() {
  resetting.value = true
  await perms.reset()
  resetting.value = false
  toast.info('Анхны эрх сэргээгдлээ', 'Бүх role-ийн эрх анхны тохиргоонд буцлаа.')
}
</script>

<template>
  <div class="page container">
    <PageHeader eyebrow="Байгууллага" title="Гишүүд ба эрх" description="Дотоод аудитын газрын бүтэц, гишүүдийн бүртгэл, role бүрийн модулийн хандах эрх.">
      <template #actions>
        <BaseButton v-if="tab === 'list' && can('members', 'edit')" icon="plus" @click="openCreate">Гишүүн нэмэх</BaseButton>
        <BaseButton v-if="tab === 'access' && isAdmin" variant="secondary" icon="reset" :loading="resetting" @click="resetPerms">Анхны эрх</BaseButton>
      </template>
    </PageHeader>

    <div class="mem__tabs" v-reveal="1"><Tabs v-model="tab" :items="tabs" label="Хэсэг" /></div>

    <Transition name="rise" mode="out-in">
      <section v-if="tab === 'structure'" key="structure" aria-labelledby="org-title">
        <BaseCard padding="lg" class="mem__org">
          <header class="mem__org-head">
            <span class="eyebrow">Бидний тухай</span>
            <h2 id="org-title" class="mem__org-title">Дотоод аудитын газрын бүтэц</h2>
            <p v-if="members.org" class="mem__org-desc">
              Удирдлага ба {{ members.org.units.length }} нэгж, нийт {{ members.list.length }} хүн. Нэгж дээр дарж багийн гишүүдтэй танилцана уу.
            </p>
          </header>
          <OrgTree v-if="members.org" :org="members.org" :members="members.list" :role-label="perms.roleLabel" />
          <Skeleton v-else height="220px" radius="12px" />
        </BaseCard>
      </section>

      <section v-else-if="tab === 'list'" key="list">
        <div class="mem__bar">
          <SearchInput v-model="q" class="mem__search" placeholder="Нэр, албан тушаалаар хайх…" label="Гишүүн хайх" />
          <SelectMenu v-model="unit" :options="unitOptions" class="mem__select" size="sm" />
          <SelectMenu v-model="roleFilter" :options="roleOptions" class="mem__select mem__select--sm" size="sm" />
          <span class="mem__count num">{{ filtered.length }} гишүүн</span>
          <div class="mem__views" role="group" aria-label="Харагдац">
            <IconButton icon="grid" label="Card харагдац" size="sm" :active="view === 'cards'" @click="view = 'cards'" />
            <IconButton icon="table" label="Хүснэгт харагдац" size="sm" :active="view === 'table'" @click="view = 'table'" />
          </div>
        </div>

        <div v-if="!members.loaded" class="grid">
          <div v-for="n in 8" :key="n" class="span-3 lg-span-4 md-span-6"><BaseCard><Skeleton :lines="4" height="16px" /></BaseCard></div>
        </div>

        <template v-else-if="filtered.length">
          <TransitionGroup v-if="view === 'cards'" tag="div" name="list" class="grid mem__grid">
            <div v-for="(m, i) in filtered" :key="m.id" class="span-3 lg-span-4 md-span-6" v-reveal="i % 4">
              <MemberCard :member="m" :unit-name="members.unitShort(m.unitId)" :role-label="perms.roleLabel(m.role)">
                <template v-if="menuFor(m).length" #actions>
                  <DropdownMenu :items="menuFor(m)" :width="180" :label="`${m.firstName} — үйлдэл`">
                    <template #trigger><IconButton icon="more" :label="`${m.firstName} — үйлдэл`" size="sm" /></template>
                  </DropdownMenu>
                </template>
              </MemberCard>
            </div>
          </TransitionGroup>

          <BaseCard v-else padding="none" class="mem__table" v-reveal>
            <DataTable :columns="columns" :rows="filtered" :page-size="12" caption="Гишүүдийн жагсаалт">
              <template #cell-name="{ row }">
                <span class="mem__who"><Avatar :member="row" size="sm" /><span><strong>{{ row.lastName }} {{ row.firstName }}</strong></span></span>
              </template>
              <template #cell-unit="{ row }">{{ members.unitShort(row.unitId) }}</template>
              <template #cell-role="{ row }"><Tag tone="primary" size="sm">{{ perms.roleLabel(row.role) }}</Tag></template>
              <template #cell-email="{ row }"><a :href="`mailto:${row.latin}@golomtbank.com`">{{ row.latin }}@golomtbank.com</a></template>
              <template #cell-actions="{ row }">
                <DropdownMenu v-if="menuFor(row).length" :items="menuFor(row)" :width="180" :label="`${row.firstName} — үйлдэл`">
                  <template #trigger><IconButton icon="more" :label="`${row.firstName} — үйлдэл`" size="sm" /></template>
                </DropdownMenu>
              </template>
            </DataTable>
          </BaseCard>
        </template>

        <BaseCard v-else>
          <EmptyState variant="search" title="Гишүүн олдсонгүй" description="Хайлтын үг эсвэл нэгж, эрхийн шүүлтүүрээ өөрчилнө үү.">
            <BaseButton variant="secondary" icon="x" @click="q = ''; unit = 'all'; roleFilter = 'all'">Шүүлтүүр арилгах</BaseButton>
          </EmptyState>
        </BaseCard>
      </section>

      <section v-else key="access" class="mem__access">
        <div class="grid">
          <BaseCard class="span-8 lg-span-12" padding="md">
            <div class="mem__note">
              <AppIcon :name="isAdmin ? 'info' : 'lock'" :size="18" />
              <p v-if="isAdmin">
                Switch бүр шууд хадгалагдаж, navbar-ын цэс болон «Шинэ эрсдэл», «Гишүүн нэмэх» зэрэг товчнуудад тэр даруй нөлөөлнө.
                <strong>Засах</strong> эсвэл <strong>Устгах</strong>-ыг асаавал <strong>Харах</strong> автоматаар асна.
              </p>
              <p v-else>Эрхийн тохиргоог зөвхөн <strong>Админ</strong> өөрчилнө. Та одоогийн тохиргоог харах боломжтой.</p>
            </div>
          </BaseCard>
          <BaseCard class="span-4 lg-span-12" padding="md">
            <p class="eyebrow">Таны эрх · {{ perms.roleLabel(role) }}</p>
            <div class="mem__mine">
              <Tag v-for="m in myModules" :key="m" size="sm" tone="primary" icon="check">{{ m }}</Tag>
            </div>
          </BaseCard>
        </div>
        <div class="mem__matrix" v-reveal>
          <PermissionMatrix :editable="isAdmin" :member-counts="memberCounts" :current-role="role" @change="onPermChange" />
        </div>
      </section>
    </Transition>

    <MemberForm v-model:open="formOpen" :member="editing" :saving="saving" @save="save" />
    <ConfirmDialog
      :open="!!toDelete"
      title="Гишүүнийг хасах уу?"
      :message="toDelete ? `${toDelete.lastName} ${toDelete.firstName} (${toDelete.position}) бүртгэлээс хасагдаж, DAHUB-д нэвтрэх эрхгүй болно.` : ''"
      confirm-label="Хасах"
      :loading="deleting"
      @update:open="!$event && (toDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.mem__tabs { margin-bottom: var(--space-6); }
.mem__org-head { display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--space-8); }
.mem__org-title { font-size: var(--fs-2xl); }
.mem__org-desc { color: var(--text-2); font-size: var(--fs-sm); max-width: 640px; }
.mem__bar { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.mem__search { width: 320px; }
.mem__select { width: 240px; }
.mem__select--sm { width: 170px; }
.mem__count { margin-left: auto; font-size: var(--fs-sm); color: var(--text-3); }
.mem__views { display: flex; gap: 2px; padding: 3px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-2); }
.mem__grid { position: relative; }
.mem__grid > * { display: flex; }
.mem__grid > * > * { flex: 1; }
.mem__table { overflow: hidden; }
.mem__table :deep(.dt__scroll) { border: 0; border-radius: 0; }
.mem__table :deep(.dt__foot) { padding: 0 16px 14px; }
.mem__who { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
.mem__who strong { font-weight: var(--fw-semibold); }
.mem__access { display: flex; flex-direction: column; gap: var(--gutter); }
.mem__note { display: flex; gap: 12px; color: var(--text-2); font-size: var(--fs-sm); line-height: 1.6; }
.mem__note .icon { flex: none; color: var(--primary); margin-top: 2px; }
.mem__note strong { color: var(--text); }
.mem__mine { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
@media (max-width: 1023px) {
  .mem__search { width: 100%; }
  .mem__count { margin-left: 0; }
}
</style>

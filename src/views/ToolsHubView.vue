<script setup>
import { ref, computed, nextTick } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ToolCard from '@/components/cards/ToolCard.vue'
import ToolForm from '@/components/cards/ToolForm.vue'
import { TOOL_CATEGORIES } from '@/services/tools'
import { useToolsStore } from '@/stores/tools'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const tools = useToolsStore()
const { can } = useAuth()
const toast = useToast()
tools.load()

const canEdit = computed(() => can('tools', 'edit'))
const q = ref('')
const cat = ref('all')

const tabs = computed(() => [
  { key: 'all', label: 'Бүгд', count: tools.list.length },
  ...TOOL_CATEGORIES.map((c) => ({ key: c.key, label: c.label, count: tools.list.filter((t) => t.category === c.key).length })),
])
const filtering = computed(() => cat.value !== 'all' || q.value.trim() !== '')
const visible = computed(() => {
  const needle = q.value.trim().toLowerCase()
  return tools.list
    .filter((t) => cat.value === 'all' || t.category === cat.value)
    .filter((t) => !needle || `${t.name} ${t.description}`.toLowerCase().includes(needle))
})
// Reordering only makes sense on the full, unfiltered list.
const sortable = computed(() => canEdit.value && !filtering.value)

/* ---- drag & drop ---- */
const dragId = ref(null)
const announce = ref('')
let lockUntil = 0
let moved = false

function onDragStart(e, tool) {
  if (!sortable.value) return e.preventDefault()
  dragId.value = tool.id
  moved = false
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', tool.id)
}
function onDragEnter(tool) {
  if (!dragId.value || tool.id === dragId.value || performance.now() < lockUntil) return
  // Hold briefly while the cards glide, so the one sliding past the pointer can't swap back.
  if (tools.move(dragId.value, tools.list.findIndex((t) => t.id === tool.id))) {
    moved = true
    lockUntil = performance.now() + 320
  }
}
function onDragEnd() {
  if (dragId.value && moved) persistOrder(tools.byId(dragId.value))
  dragId.value = null
}
async function moveBy(tool, d) {
  if (!tools.move(tool.id, tools.list.findIndex((t) => t.id === tool.id) + d)) return
  persistOrder(tool)
  // Moving the node in the DOM drops focus — hand it back to the same handle.
  await nextTick()
  document.querySelector(`[data-tool="${tool.id}"] .tool__handle`)?.focus()
}
async function persistOrder(tool) {
  await tools.saveOrder()
  const pos = tools.list.findIndex((t) => t.id === tool.id) + 1
  announce.value = `«${tool.name}» ${pos}-р байранд шилжлээ`
}

/* ---- add / edit / delete ---- */
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
function openCreate() {
  editing.value = null
  formOpen.value = true
}
function openEdit(tool) {
  editing.value = tool
  formOpen.value = true
}
async function save(data) {
  saving.value = true
  try {
    if (editing.value) {
      const t = await tools.update(editing.value.id, data)
      toast.success('Хэрэгсэл шинэчлэгдлээ', t.name)
    } else {
      const t = await tools.create(data)
      toast.success('Хэрэгсэл нэмэгдлээ', t.name)
      q.value = ''
      cat.value = 'all'
    }
    formOpen.value = false
  } finally {
    saving.value = false
  }
}

const toDelete = ref(null)
const deleting = ref(false)
async function confirmDelete() {
  deleting.value = true
  await tools.remove(toDelete.value.id)
  toast.info('Хэрэгсэл устгагдлаа', toDelete.value.name)
  deleting.value = false
  toDelete.value = null
}
</script>

<template>
  <div class="page container">
    <PageHeader eyebrow="Аудитын хэрэгсэл" title="Хэрэгсэл" />

    <div class="hub__bar" v-reveal="1">
      <Tabs v-model="cat" :items="tabs" label="Ангилал" class="hub__tabs" />
      <SearchInput v-model="q" class="hub__search" placeholder="Хэрэгсэл хайх…" label="Хэрэгсэл хайх" />
    </div>

    <div v-if="!tools.loaded" class="grid">
      <div v-for="n in 8" :key="n" class="span-3 lg-span-4 md-span-6"><BaseCard><Skeleton :lines="4" height="16px" /></BaseCard></div>
    </div>

    <template v-else>
      <TransitionGroup tag="div" name="list" class="grid hub__grid" :class="{ 'is-dragging': dragId }">
        <div
          v-for="t in visible"
          :key="t.id"
          class="span-3 lg-span-4 md-span-6 hub__cell"
          :class="{ 'is-drag-source': dragId === t.id }"
          :data-tool="t.id"
          :draggable="sortable"
          @dragstart="onDragStart($event, t)"
          @dragenter.prevent="onDragEnter(t)"
          @dragover.prevent
          @drop.prevent
          @dragend="onDragEnd"
        >
          <ToolCard :tool="t" :sortable="sortable" :editable="canEdit" @edit="openEdit" @remove="toDelete = $event" @move="moveBy(t, $event)" />
        </div>

        <div v-if="canEdit && !filtering" key="__add" class="span-3 lg-span-4 md-span-6 hub__cell">
          <button type="button" class="hub__add" @click="openCreate">
            <span class="hub__add-icon"><AppIcon name="plus" :size="22" /></span>
            Хэрэгсэл нэмэх
          </button>
        </div>
      </TransitionGroup>

      <BaseCard v-if="!visible.length" class="hub__empty">
        <EmptyState variant="search" title="Хэрэгсэл олдсонгүй" description="Хайлтын үг эсвэл ангиллаа өөрчилнө үү.">
          <BaseButton variant="secondary" icon="x" @click="q = ''; cat = 'all'">Шүүлтүүр арилгах</BaseButton>
        </EmptyState>
      </BaseCard>
    </template>

    <p class="sr-only" aria-live="polite">{{ announce }}</p>

    <ToolForm v-model:open="formOpen" :tool="editing" :saving="saving" @save="save" />
    <ConfirmDialog
      :open="!!toDelete"
      title="Хэрэгслийг устгах уу?"
      :message="toDelete ? `«${toDelete.name}» card хэрэгслийн сангаас хасагдана.` : ''"
      :loading="deleting"
      @update:open="!$event && (toDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.hub__bar { display: flex; align-items: flex-end; gap: var(--space-6); margin-bottom: var(--space-6); }
.hub__tabs { flex: 1; min-width: 0; }
.hub__search { width: 300px; flex: none; margin-bottom: 4px; }
.hub__grid { position: relative; }
.hub__cell { display: flex; min-width: 0; }
.hub__cell > * { flex: 1; }
.hub__cell[draggable='true'] { cursor: grab; }
.hub__cell.is-drag-source { opacity: 0.45; }
.hub__cell.is-drag-source :deep(.card) { border-style: dashed; box-shadow: none; }
.hub__grid.is-dragging :deep(.card--interactive:hover) { transform: none; }

.hub__add {
  min-height: 196px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: var(--radius-lg);
  border: 1.5px dashed var(--border-strong);
  background: transparent;
  color: var(--text-2);
  font-weight: var(--fw-medium);
  transition: border-color var(--dur-base), background-color var(--dur-base), color var(--dur-base);
}
.hub__add-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: background-color var(--dur-base), color var(--dur-base), transform var(--dur-base) var(--ease-out);
}
.hub__add:hover { border-color: var(--primary); background: color-mix(in srgb, var(--primary-soft) 55%, transparent); color: var(--primary); }
.hub__add:hover .hub__add-icon { background: var(--primary); color: var(--on-primary); border-color: transparent; transform: rotate(90deg); }
.hub__add:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.hub__empty { margin-top: var(--space-4); }

@media (max-width: 767px) {
  .hub__bar { flex-direction: column-reverse; align-items: stretch; gap: var(--space-3); }
  .hub__search { width: 100%; }
}
</style>

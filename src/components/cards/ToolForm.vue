<script setup>
import { ref, watch, nextTick } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { TOOL_CATEGORIES, TOOL_ICONS } from '@/services/tools'

const props = defineProps({
  open: { type: Boolean, default: false },
  tool: { type: Object, default: null }, // null → create
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'save'])

const form = ref(blank())
const errors = ref({})
const iconGrid = ref(null)
const categoryOptions = TOOL_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))

function blank() {
  return { name: '', description: '', category: TOOL_CATEGORIES[0].key, icon: 'tools' }
}
watch(
  () => props.open,
  (on) => {
    if (!on) return
    errors.value = {}
    form.value = props.tool ? { name: props.tool.name, description: props.tool.description, category: props.tool.category, icon: props.tool.icon } : blank()
  },
)

function pickIcon(name) {
  form.value.icon = name
}
function onIconKey(e, i) {
  const cols = getComputedStyle(iconGrid.value).gridTemplateColumns.split(' ').length
  const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key]
  if (!d) return
  e.preventDefault()
  const next = TOOL_ICONS[(i + d + TOOL_ICONS.length) % TOOL_ICONS.length]
  pickIcon(next)
  nextTick(() => iconGrid.value?.querySelector(`[data-icon="${next}"]`)?.focus())
}

function submit() {
  const f = form.value
  const e = {}
  if (!f.name.trim()) e.name = 'Нэр оруулна уу.'
  if (!f.description.trim()) e.description = 'Нэг мөр тайлбар оруулна уу.'
  errors.value = e
  if (Object.keys(e).length) return
  emit('save', { ...f })
}
</script>

<template>
  <BaseModal :open="open" :title="tool ? 'Хэрэгсэл засах' : 'Хэрэгсэл нэмэх'" size="md" @update:open="emit('update:open', $event)">
    <form class="tf" @submit.prevent="submit">
      <TextField v-model="form.name" label="Нэр" required :error="errors.name" placeholder="Жишээ: Хугацаа хэтрэлтийн шинжилгээ" />
      <TextField v-model="form.description" label="Тайлбар" required :error="errors.description" placeholder="Нэг өгүүлбэр" @enter="submit" />

      <div class="tf__field">
        <span class="tf__label">Ангилал</span>
        <SegmentedControl v-model="form.category" :options="categoryOptions" label="Ангилал" block />
      </div>

      <div class="tf__field">
        <span id="tf-icon-label" class="tf__label">Icon</span>
        <div ref="iconGrid" class="tf__icons" role="radiogroup" aria-labelledby="tf-icon-label">
          <button
            v-for="(name, i) in TOOL_ICONS"
            :key="name"
            :data-icon="name"
            type="button"
            role="radio"
            class="tf__icon"
            :class="{ 'is-active': form.icon === name }"
            :aria-checked="form.icon === name"
            :aria-label="name"
            :tabindex="form.icon === name ? 0 : -1"
            @click="pickIcon(name)"
            @keydown="onIconKey($event, i)"
          >
            <AppIcon :name="name" :size="20" />
          </button>
        </div>
      </div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('update:open', false)">Болих</BaseButton>
      <BaseButton icon="check" :loading="saving" @click="submit">{{ tool ? 'Хадгалах' : 'Нэмэх' }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.tf { display: flex; flex-direction: column; gap: 16px; }
.tf__field { display: flex; flex-direction: column; gap: 6px; }
.tf__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); }
.tf__icons { display: grid; grid-template-columns: repeat(8, 46px); gap: 8px; }
.tf__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  transition: border-color var(--dur-fast), background-color var(--dur-fast), color var(--dur-fast);
}
.tf__icon:hover { border-color: var(--border-strong); color: var(--text); }
.tf__icon:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.tf__icon.is-active { border-color: var(--primary); background: var(--primary-soft); color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
@media (max-width: 480px) {
  .tf__icons { grid-template-columns: repeat(6, 42px); }
  .tf__icon { width: 42px; height: 42px; }
}
</style>

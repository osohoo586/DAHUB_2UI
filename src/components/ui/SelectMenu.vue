<script setup>
import { computed, ref, nextTick, useId, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'
import { useFloating } from '@/composables/useFloating'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  options: { type: Array, required: true }, // [{ value, label, description?, icon? }]
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Сонгох' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['update:modelValue'])

const id = useId()
const open = ref(false)
const active = ref(-1)
const root = ref(null)
const list = ref(null)
const selected = computed(() => props.options.find((o) => o.value === props.modelValue))
const floating = useFloating({ estimate: 300 })

function toggle() {
  if (props.disabled) return
  open.value ? close() : show()
}
async function show() {
  open.value = true
  floating.start(root.value.querySelector('.select__trigger'), Math.min(300, props.options.length * 46 + 14))
  active.value = Math.max(0, props.options.findIndex((o) => o.value === props.modelValue))
  await nextTick()
  list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
}
function close() {
  open.value = false
  floating.stop()
}
function choose(o) {
  emit('update:modelValue', o.value)
  close()
  root.value?.querySelector('button')?.focus()
}
function onKey(e) {
  if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault()
    if (!open.value) return show()
    const d = e.key === 'ArrowDown' ? 1 : -1
    active.value = (active.value + d + props.options.length) % props.options.length
    nextTick(() => list.value?.children[active.value]?.scrollIntoView({ block: 'nearest' }))
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    if (open.value && active.value >= 0) choose(props.options[active.value])
    else show()
  } else if (e.key === 'Escape') {
    if (open.value) {
      e.stopPropagation()
      close()
    }
  } else if (e.key === 'Tab') close()
}
function onDoc(e) {
  if (open.value && root.value && !root.value.contains(e.target)) close()
}
onMounted(() => document.addEventListener('pointerdown', onDoc))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDoc))
</script>

<template>
  <div ref="root" class="select" :class="[`select--${size}`, { 'is-open': open, 'has-error': error }]">
    <label v-if="label" :id="`${id}-label`" class="select__label" @click="toggle">
      {{ label }}<span v-if="required" class="req" aria-hidden="true">*</span>
    </label>
    <button
      type="button"
      class="select__trigger"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-labelledby="label ? `${id}-label ${id}-value` : undefined"
      :aria-controls="`${id}-list`"
      @click="toggle"
      @keydown="onKey"
    >
      <AppIcon v-if="selected?.icon" :name="selected.icon" :size="16" class="select__lead" />
      <span :id="`${id}-value`" class="select__value" :class="{ 'is-placeholder': !selected }">{{ selected?.label ?? placeholder }}</span>
      <AppIcon name="chevron-down" :size="16" class="select__chev" />
    </button>
    <Transition name="pop">
      <ul v-if="open" :id="`${id}-list`" ref="list" class="select__list" :style="floating.style.value" role="listbox" :aria-labelledby="label ? `${id}-label` : undefined">
        <li
          v-for="(o, i) in options"
          :key="String(o.value)"
          role="option"
          class="select__opt"
          :class="{ 'is-active': i === active, 'is-selected': o.value === modelValue }"
          :aria-selected="o.value === modelValue"
          @pointerenter="active = i"
          @click="choose(o)"
        >
          <AppIcon v-if="o.icon" :name="o.icon" :size="16" class="select__opt-icon" />
          <span class="select__opt-text">
            <span class="select__opt-label">{{ o.label }}</span>
            <span v-if="o.description" class="select__opt-desc">{{ o.description }}</span>
          </span>
          <AppIcon v-if="o.value === modelValue" name="check" :size="16" class="select__check" />
        </li>
      </ul>
    </Transition>
    <p v-if="error || hint" class="select__desc" :class="{ 'is-error': error }">{{ error || hint }}</p>
  </div>
</template>

<style scoped>
.select { position: relative; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.select__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); cursor: default; }
.req { color: var(--danger); margin-left: 2px; }
.select__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  text-align: left;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.select--sm .select__trigger { height: 34px; font-size: var(--fs-sm); }
.select__trigger:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 35%, var(--border-strong)); }
.select__trigger:focus-visible, .is-open .select__trigger { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }
.select__trigger:disabled { background: var(--surface-2); color: var(--text-3); cursor: not-allowed; }
.has-error .select__trigger { border-color: var(--danger); }
.select__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select__value.is-placeholder { color: var(--text-3); }
.select__lead { color: var(--text-3); }
.select__chev { color: var(--text-3); transition: transform var(--dur-base) var(--ease-out); }
.is-open .select__chev { transform: rotate(180deg); }
.select__list {
  position: fixed;
  z-index: calc(var(--z-modal) + 5);
  max-height: 300px;
  overflow: auto;
  list-style: none;
  padding: 6px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-3);
}
.select__opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text);
}
.select__opt.is-active { background: var(--primary-soft); }
.select__opt-icon { margin-top: 2px; color: var(--text-3); }
.select__opt-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.select__opt-label { font-size: var(--fs-base); line-height: 1.3; }
.select__opt-desc { font-size: var(--fs-xs); color: var(--text-3); line-height: 1.4; }
.select__check { color: var(--primary); margin-top: 2px; }
.select__desc { font-size: var(--fs-xs); color: var(--text-3); }
.select__desc.is-error { color: var(--danger); }
</style>

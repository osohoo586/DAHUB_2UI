<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  items: { type: Array, required: true }, // [{ key, label, count?, icon? }]
  label: { type: String, default: 'Табууд' },
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const indicator = ref({ left: 0, width: 0 })

function measure() {
  const el = root.value?.querySelector(`[data-key="${CSS.escape(String(props.modelValue))}"]`)
  if (el) indicator.value = { left: el.offsetLeft, width: el.offsetWidth }
}

function select(key) {
  emit('update:modelValue', key)
}

function onKey(e, index) {
  const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!dir) return
  e.preventDefault()
  const next = props.items[(index + dir + props.items.length) % props.items.length]
  select(next.key)
  nextTick(() => root.value?.querySelector(`[data-key="${CSS.escape(String(next.key))}"]`)?.focus())
}

watch(() => [props.modelValue, props.items.map((i) => i.count).join()], () => nextTick(measure))
let ro
onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(root.value)
  document.fonts?.ready.then(measure)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div ref="root" class="tabs" :class="`tabs--${size}`" role="tablist" :aria-label="label">
    <button
      v-for="(item, i) in items"
      :key="item.key"
      :data-key="item.key"
      type="button"
      role="tab"
      class="tab"
      :class="{ 'is-active': item.key === modelValue }"
      :aria-selected="item.key === modelValue"
      :tabindex="item.key === modelValue ? 0 : -1"
      @click="select(item.key)"
      @keydown="onKey($event, i)"
    >
      <AppIcon v-if="item.icon" :name="item.icon" :size="16" />
      <span>{{ item.label }}</span>
      <span v-if="item.count != null" class="tab__count">{{ item.count }}</span>
    </button>
    <span class="tabs__indicator" :style="{ transform: `translateX(${indicator.left}px)`, width: indicator.width + 'px' }" aria-hidden="true" />
  </div>
</template>

<style scoped>
.tabs {
  position: relative;
  display: flex;
  gap: var(--space-6);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar { display: none; }
.tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 2px;
  color: var(--text-3);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-out);
}
.tab:hover { color: var(--text); }
.tab.is-active { color: var(--text); }
.tab:focus-visible { outline: none; box-shadow: inset 0 -2px 0 var(--focus-ring); }
.tab__count {
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-pill);
  display: inline-grid;
  place-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.tab.is-active .tab__count { background: var(--primary-soft); border-color: transparent; color: var(--primary); }
.tabs__indicator {
  position: absolute;
  left: 0;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
  transition: transform 320ms var(--ease-out), width 320ms var(--ease-out);
}
.tabs__indicator::after {
  /* the ember at the leading edge */
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 10px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
}
.tabs--sm .tab { height: 38px; font-size: var(--fs-sm); }
.tabs--sm { gap: var(--space-5); }
</style>

<script setup>
import { ref, toRef, watch, onBeforeUnmount, useId } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import IconButton from './IconButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  width: { type: Number, default: 400 },
})
const emit = defineEmits(['update:open', 'request-close'])
const panel = ref(null)
const id = useId()

// Parents may intercept closing (e.g. unsaved changes) by listening to request-close.
function requestClose() {
  emit('request-close')
}
function onKey(e) {
  if (e.key === 'Escape' && props.open) requestClose()
}
useFocusTrap(panel, toRef(props, 'open'))
watch(
  () => props.open,
  (on) => {
    if (on) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer" @pointerdown.self="requestClose">
        <aside ref="panel" class="drawer-panel" :style="{ width: width + 'px' }" role="dialog" aria-modal="true" :aria-labelledby="`${id}-t`">
          <header class="drawer__head">
            <div class="drawer__titles">
              <h2 :id="`${id}-t`" class="drawer__title">{{ title }}</h2>
              <p v-if="subtitle" class="drawer__subtitle">{{ subtitle }}</p>
            </div>
            <IconButton icon="x" label="Хаах" size="sm" @click="requestClose" />
          </header>
          <div class="drawer__body"><slot /></div>
          <footer v-if="$slots.footer" class="drawer__foot"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
  background: color-mix(in srgb, var(--overlay) 55%, transparent);
  display: flex;
  justify-content: flex-end;
}
.drawer-panel {
  height: 100%;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-3);
}
.drawer__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--border);
}
.drawer__title { font-family: var(--font-sans); font-size: var(--fs-md); font-weight: var(--fw-semibold); }
.drawer__subtitle { font-size: var(--fs-xs); color: var(--text-3); margin-top: 2px; }
.drawer__body { flex: 1; overflow-y: auto; padding: var(--space-5); }
.drawer__foot { padding: var(--space-4) var(--space-5); border-top: 1px solid var(--border); background: var(--surface-2); }
</style>

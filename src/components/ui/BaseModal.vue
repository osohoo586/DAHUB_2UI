<script setup>
import { ref, toRef, watch, onBeforeUnmount, useId } from 'vue'
import { useFocusTrap } from '@/composables/useFocusTrap'
import IconButton from './IconButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  dismissable: { type: Boolean, default: true },
})
const emit = defineEmits(['update:open', 'close'])
const panel = ref(null)
const id = useId()

function close() {
  if (!props.dismissable) return
  emit('update:open', false)
  emit('close')
}
function onKey(e) {
  if (e.key === 'Escape' && props.open) close()
}

useFocusTrap(panel, toRef(props, 'open'))
watch(
  () => props.open,
  (on) => {
    document.documentElement.style.overflow = on ? 'hidden' : ''
    if (on) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @pointerdown.self="close">
        <div
          ref="panel"
          class="modal-panel"
          :class="`modal-panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${id}-t` : undefined"
          :aria-describedby="description ? `${id}-d` : undefined"
        >
          <header v-if="title" class="modal__head">
            <div>
              <h2 :id="`${id}-t`" class="modal__title">{{ title }}</h2>
              <p v-if="description" :id="`${id}-d`" class="modal__desc">{{ description }}</p>
            </div>
            <IconButton v-if="dismissable" icon="x" label="Хаах" size="sm" @click="close" />
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__foot"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background: var(--overlay);
  overflow-y: auto;
}
.modal-panel {
  width: 100%;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
}
.modal-panel--sm { max-width: 440px; }
.modal-panel--md { max-width: 600px; }
.modal-panel--lg { max-width: 820px; }
.modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) var(--space-4);
}
.modal__title { font-size: var(--fs-xl); }
.modal__desc { margin-top: 6px; color: var(--text-3); font-size: var(--fs-sm); }
.modal__body { padding: 0 var(--space-6) var(--space-6); overflow-y: auto; }
.modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
</style>

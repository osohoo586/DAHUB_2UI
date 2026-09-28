<script setup>
import { useUiStore } from '@/stores/ui'
import AppIcon from './AppIcon.vue'

const ui = useUiStore()
const icon = { success: 'check-circle', info: 'info', warning: 'alert', danger: 'alert-circle' }
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`is-${t.tone}`" role="status">
        <AppIcon :name="icon[t.tone]" :size="20" class="toast__icon" />
        <div class="toast__text">
          <p class="toast__title">{{ t.title }}</p>
          <p v-if="t.message" class="toast__msg">{{ t.message }}</p>
        </div>
        <button type="button" class="toast__close" aria-label="Хаах" @click="ui.dismiss(t.id)"><AppIcon name="x" :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 24px;
  bottom: calc(var(--nav-bottom) + 24px);
  transition: bottom var(--dur-nav) var(--ease-out);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}
.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-3);
  position: relative;
  overflow: hidden;
}
.toast::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--c); }
.toast.is-success { --c: var(--success); }
.toast.is-info { --c: var(--primary); }
.toast.is-warning { --c: var(--warning); }
.toast.is-danger { --c: var(--danger); }
.toast__icon { color: var(--c); margin-top: 1px; }
.toast__text { flex: 1; min-width: 0; }
.toast__title { font-weight: var(--fw-semibold); font-size: var(--fs-sm); }
.toast__msg { font-size: var(--fs-sm); color: var(--text-2); margin-top: 2px; }
.toast__close { color: var(--text-3); border-radius: 6px; padding: 2px; }
.toast__close:hover { color: var(--text); background: var(--surface-2); }
.toast-enter-active { transition: opacity 280ms var(--ease-out), transform 280ms var(--ease-out); }
.toast-leave-active { transition: opacity 180ms var(--ease-out); }
.toast-enter-from { opacity: 0; transform: translateY(12px); }
.toast-leave-to { opacity: 0; }
</style>

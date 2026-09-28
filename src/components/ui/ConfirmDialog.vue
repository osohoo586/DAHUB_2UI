<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import AppIcon from './AppIcon.vue'

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Итгэлтэй байна уу?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Устгах' },
  cancelLabel: { type: String, default: 'Болих' },
  tone: { type: String, default: 'danger' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'confirm'])
</script>

<template>
  <BaseModal :open="open" size="sm" @update:open="emit('update:open', $event)">
    <div class="confirm">
      <span class="confirm__icon" :class="`is-${tone}`"><AppIcon :name="tone === 'danger' ? 'trash' : 'info'" :size="22" /></span>
      <h2 class="confirm__title">{{ title }}</h2>
      <p v-if="message" class="confirm__msg">{{ message }}</p>
    </div>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('update:open', false)">{{ cancelLabel }}</BaseButton>
      <BaseButton :variant="tone === 'danger' ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm { padding-top: var(--space-6); display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2); }
.confirm__icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; margin-bottom: var(--space-2); }
.confirm__icon.is-danger { background: var(--danger-soft); color: var(--danger); }
.confirm__icon.is-primary { background: var(--primary-soft); color: var(--primary); }
.confirm__title { font-size: var(--fs-lg); }
.confirm__msg { color: var(--text-2); }
</style>

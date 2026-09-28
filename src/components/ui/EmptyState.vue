<script setup>
import HearthEmpty from '@/components/illustrations/HearthEmpty.vue'
import SearchEmpty from '@/components/illustrations/SearchEmpty.vue'
import UploadEmpty from '@/components/illustrations/UploadEmpty.vue'

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  variant: { type: String, default: 'hearth' }, // hearth | search | upload
  compact: { type: Boolean, default: false },
})
const art = { hearth: HearthEmpty, search: SearchEmpty, upload: UploadEmpty }
</script>

<template>
  <div class="empty" :class="{ 'empty--compact': compact }">
    <component :is="art[variant]" class="empty__art" />
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div v-if="$slots.default" class="empty__actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  gap: var(--space-2);
}
.empty--compact { padding: var(--space-8) var(--space-4); }
.empty__art { width: 148px; height: auto; margin-bottom: var(--space-4); }
.empty--compact .empty__art { width: 112px; }
.empty__title { font-family: var(--font-sans); font-size: var(--fs-md); font-weight: var(--fw-semibold); }
.empty__desc { max-width: 420px; color: var(--text-3); font-size: var(--fs-sm); }
.empty__actions { margin-top: var(--space-4); display: flex; gap: var(--space-3); }
</style>

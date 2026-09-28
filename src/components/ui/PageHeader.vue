<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <header class="ph" v-reveal>
    <div class="ph__text">
      <slot name="before" />
      <span v-if="eyebrow" class="eyebrow ph__eyebrow">{{ eyebrow }}</span>
      <h1 class="ph__title">{{ title }}</h1>
      <p v-if="description" class="ph__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="ph__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.ph {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
}
.ph__text { display: flex; flex-direction: column; gap: var(--space-2); max-width: 760px; }
.ph__eyebrow { display: inline-flex; align-items: center; gap: 8px; }
.ph__eyebrow::before { content: ''; width: 16px; height: 2px; border-radius: 2px; background: var(--accent); }
.ph__title { font-size: var(--fs-3xl); line-height: 1.12; }
.ph__desc { color: var(--text-2); font-size: var(--fs-md); line-height: var(--lh-normal); }
.ph__actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
@media (max-width: 767px) {
  .ph__title { font-size: var(--fs-2xl); }
}
</style>

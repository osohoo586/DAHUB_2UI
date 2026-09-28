<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="sh" v-reveal>
    <div class="sh__text">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h2 class="sh__title">{{ title }}</h2>
      <p v-if="description" class="sh__desc">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="sh__actions"><slot name="actions" /></div>
  </div>
</template>

<style scoped>
.sh { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-6); margin-bottom: var(--space-6); flex-wrap: wrap; }
.sh__text { display: flex; flex-direction: column; gap: 6px; max-width: 680px; }
.sh__title { font-size: var(--fs-2xl); }
.sh__desc { color: var(--text-2); }
.sh__actions { display: flex; gap: var(--space-3); }
</style>

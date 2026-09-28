<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm | md
  variant: { type: String, default: 'ghost' }, // ghost | soft | outline | on-hero
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    class="ibtn"
    :class="[`ibtn--${size}`, `ibtn--${variant}`, { 'is-active': active }]"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
  >
    <AppIcon :name="icon" :size="size === 'sm' ? 16 : 20" />
  </button>
</template>

<style scoped>
.ibtn {
  --s: 40px;
  width: var(--s);
  height: var(--s);
  display: inline-grid;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  border: 1px solid transparent;
  transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), border-color var(--dur-fast);
  flex: none;
}
.ibtn--sm { --s: 32px; border-radius: 7px; }
.ibtn:hover:not(:disabled) { background: var(--primary-soft); color: var(--primary); }
.ibtn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.ibtn:disabled { opacity: 0.45; cursor: not-allowed; }
.ibtn--soft { background: var(--surface-2); }
.ibtn--outline { border-color: var(--border); background: var(--surface); }
.ibtn--on-hero { color: var(--on-hero-2); }
.ibtn--on-hero:hover:not(:disabled) { background: rgba(255, 255, 255, 0.14); color: var(--on-hero); }
.ibtn.is-active { background: var(--primary-soft); color: var(--primary); }
</style>

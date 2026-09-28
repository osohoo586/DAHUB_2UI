<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'
import GSpinner from './GSpinner.vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger | subtle | on-hero
  size: { type: String, default: 'md' }, // sm | md | lg
  icon: { type: String, default: '' },
  iconRight: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  type: { type: String, default: 'button' },
})

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))
const iconSize = computed(() => (props.size === 'sm' ? 16 : 18))
</script>

<template>
  <component
    :is="tag"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block, 'is-loading': loading }]"
    :to="to || undefined"
    :href="href || undefined"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' ? disabled || loading : undefined"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
  >
    <GSpinner v-if="loading" :size="iconSize" :on-dark="variant === 'primary' || variant === 'on-hero'" />
    <AppIcon v-else-if="icon" :name="icon" :size="iconSize" />
    <span v-if="$slots.default" class="btn__label"><slot /></span>
    <AppIcon v-if="iconRight && !loading" :name="iconRight" :size="iconSize" class="btn__right" />
  </component>
</template>

<style scoped>
.btn {
  --h: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: var(--h);
  padding: 0 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  line-height: 1;
  white-space: nowrap;
  text-decoration: none !important;
  user-select: none;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled, .btn[aria-disabled='true'] { opacity: 0.55; cursor: not-allowed; }
.btn.is-loading { opacity: 1; cursor: progress; }

.btn--sm { --h: 32px; padding: 0 12px; font-size: var(--fs-sm); gap: 6px; }
.btn--lg { --h: 48px; padding: 0 22px; font-size: var(--fs-md); }
.btn--block { width: 100%; }

.btn--primary { background: var(--primary); color: var(--on-primary); }
.btn--primary:hover:not(:disabled) { background: var(--primary-hover); }

.btn--secondary { background: var(--surface); color: var(--text); border-color: var(--border-strong); }
.btn--secondary:hover:not(:disabled) { background: var(--surface-hover); border-color: color-mix(in srgb, var(--primary) 40%, var(--border-strong)); }

.btn--ghost { background: transparent; color: var(--text-2); }
.btn--ghost:hover:not(:disabled) { background: var(--primary-soft); color: var(--primary); }

.btn--subtle { background: var(--primary-soft); color: var(--primary); }
.btn--subtle:hover:not(:disabled) { background: var(--primary-soft-2); }

.btn--danger { background: var(--danger-soft); color: var(--danger); border-color: color-mix(in srgb, var(--danger) 25%, transparent); }
.btn--danger:hover:not(:disabled) { background: var(--danger); color: #fff; }

.btn--on-hero { background: rgba(255, 255, 255, 0.12); color: var(--on-hero); border-color: rgba(255, 255, 255, 0.24); }
.btn--on-hero:hover:not(:disabled) { background: rgba(255, 255, 255, 0.2); }

.btn__right { transition: transform var(--dur-base) var(--ease-out); }
.btn:hover .btn__right { transform: translateX(2px); }
</style>

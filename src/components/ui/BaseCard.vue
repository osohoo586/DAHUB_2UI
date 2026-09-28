<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  title: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  interactive: { type: Boolean, default: false },
  accent: { type: Boolean, default: false },
  padding: { type: String, default: 'md' }, // none | sm | md | lg
  to: { type: [String, Object], default: null },
  as: { type: String, default: 'section' },
})

const tag = computed(() => (props.to ? RouterLink : props.as))
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    class="card"
    :class="[`card--pad-${padding}`, { 'card--interactive': interactive || to, 'card--accent': accent }]"
  >
    <header v-if="title || eyebrow || $slots.actions || $slots.header" class="card__head">
      <slot name="header">
        <div class="card__titles">
          <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
          <h3 v-if="title" class="card__title">{{ title }}</h3>
          <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
        </div>
      </slot>
      <div v-if="$slots.actions" class="card__actions"><slot name="actions" /></div>
    </header>
    <slot />
    <footer v-if="$slots.footer" class="card__foot"><slot name="footer" /></footer>
  </component>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1), inset 0 1px 0 var(--card-highlight);
  text-decoration: none !important;
  isolation: isolate;
}

/* Accent line — the "flame" that brightens on hover */
.card::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 20px;
  right: 20px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent-glow);
  opacity: 0;
  transform: scaleX(0.4);
  transition: opacity var(--dur-base) var(--ease-out), transform 360ms var(--ease-out);
  pointer-events: none;
}
/* Soft hover light from the top edge */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(120% 70% at 50% -10%, var(--accent-glow), transparent 55%);
  opacity: 0;
  transition: opacity var(--dur-slow) var(--ease-out);
  pointer-events: none;
  z-index: -1;
}

.card--interactive {
  cursor: pointer;
  transition:
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.card--interactive:hover,
.card--interactive:focus-visible {
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
  border-color: var(--border-strong);
}
.card--interactive:hover::before,
.card--interactive:focus-visible::before,
.card--accent::before {
  opacity: 1;
  transform: scaleX(1);
}
.card--interactive:hover::after { opacity: 0.45; }
.card--interactive:focus-visible { outline: none; box-shadow: var(--shadow-2), 0 0 0 3px var(--focus-ring); }

.card--pad-none { padding: 0; }
.card--pad-sm { padding: var(--space-4); }
.card--pad-md { padding: var(--space-6); }
.card--pad-lg { padding: var(--space-8); }

.card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}
.card--pad-none .card__head { padding: var(--space-6) var(--space-6) 0; }
.card__titles { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.card__title {
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  letter-spacing: -0.005em;
  line-height: var(--lh-snug);
}
.card__subtitle { font-size: var(--fs-sm); color: var(--text-3); }
.card__actions { display: flex; align-items: center; gap: var(--space-2); flex: none; }
.card__foot {
  margin-top: auto;
  padding-top: var(--space-5);
}

@media (max-width: 767px) {
  .card--pad-md { padding: var(--space-5); }
  .card--pad-lg { padding: var(--space-6); }
}
</style>

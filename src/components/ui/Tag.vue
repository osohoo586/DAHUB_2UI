<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  tone: { type: String, default: 'neutral' }, // neutral | primary | success | warning | danger | info | accent | low | medium | high | critical
  size: { type: String, default: 'md' }, // sm | md
  icon: { type: String, default: '' },
  dot: { type: Boolean, default: false },
})
</script>

<template>
  <span class="tag" :class="[`tag--${tone}`, `tag--${size}`]">
    <span v-if="dot" class="tag__dot" aria-hidden="true" />
    <AppIcon v-if="icon" :name="icon" :size="size === 'sm' ? 12 : 14" :stroke="1.8" />
    <slot />
  </span>
</template>

<style scoped>
.tag {
  --fg: var(--text-2);
  --bg: var(--surface-2);
  --bd: var(--border);
  --dot: var(--text-3);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px;
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  line-height: 1;
  white-space: nowrap;
  color: var(--fg);
  background: var(--bg);
  border: 1px solid var(--bd);
  font-variant-numeric: tabular-nums;
}
.tag--sm { height: 20px; padding: 0 8px; font-size: 11px; gap: 5px; }
.tag__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dot); flex: none; }

.tag--primary, .tag--info { --fg: var(--primary); --bg: var(--primary-soft); --bd: transparent; --dot: var(--primary); }
.tag--success { --fg: var(--success); --bg: var(--success-soft); --bd: transparent; --dot: var(--success); }
.tag--warning { --fg: var(--warning); --bg: var(--warning-soft); --bd: transparent; --dot: var(--warning); }
.tag--danger { --fg: var(--danger); --bg: var(--danger-soft); --bd: transparent; --dot: var(--danger); }
.tag--accent { --fg: var(--text); --bg: var(--accent-soft); --bd: transparent; --dot: var(--accent); }
.tag--teal { --fg: color-mix(in srgb, var(--chart-3) 62%, var(--text)); --bg: color-mix(in srgb, var(--chart-3) 12%, var(--surface)); --bd: transparent; --dot: var(--chart-3); }
.tag--violet { --fg: color-mix(in srgb, var(--chart-5) 70%, var(--text)); --bg: color-mix(in srgb, var(--chart-5) 12%, var(--surface)); --bd: transparent; --dot: var(--chart-5); }
.tag--low { --fg: var(--risk-low-ink); --bg: var(--risk-low-soft); --bd: transparent; --dot: var(--risk-low); }
.tag--medium { --fg: var(--risk-medium-ink); --bg: var(--risk-medium-soft); --bd: transparent; --dot: var(--risk-medium); }
.tag--high { --fg: var(--risk-high-ink); --bg: var(--risk-high-soft); --bd: transparent; --dot: var(--risk-high); }
.tag--critical { --fg: var(--risk-critical-ink); --bg: var(--risk-critical-soft); --bd: transparent; --dot: var(--risk-critical); }
</style>

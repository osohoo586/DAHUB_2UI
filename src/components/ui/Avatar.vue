<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  member: { type: Object, default: null },
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  size: { type: String, default: 'md' }, // xs 24 · sm 32 · md 40 · lg 56 · xl 88
  ring: { type: Boolean, default: false },
})

const failed = ref(false)
const photo = computed(() => props.src || props.member?.photo || '')
watch(photo, () => (failed.value = false))

const initials = computed(() => {
  if (props.member) return `${props.member.lastName?.[0] ?? ''}${props.member.firstName?.[0] ?? ''}`.toUpperCase()
  return props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
})

const label = computed(() => (props.member ? `${props.member.lastName} ${props.member.firstName}` : props.name))

const tint = computed(() => {
  const key = props.member?.id || props.name || 'x'
  let h = 0
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % 6
})
</script>

<template>
  <span class="avatar" :class="[`avatar--${size}`, `tint-${tint}`, { 'avatar--ring': ring }]" :title="label">
    <img v-if="photo && !failed" :src="photo" :alt="label" loading="lazy" @error="failed = true" />
    <span v-else class="avatar__mono" aria-hidden="true">{{ initials }}</span>
    <span v-if="!photo || failed" class="sr-only">{{ label }}</span>
  </span>
</template>

<style scoped>
.avatar {
  --s: 40px;
  --c: var(--chart-1);
  position: relative;
  flex: none;
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  overflow: hidden;
  display: inline-grid;
  place-items: center;
  background: color-mix(in srgb, var(--c) 15%, var(--surface));
  color: color-mix(in srgb, var(--c) 70%, var(--text));
  font-weight: var(--fw-semibold);
  letter-spacing: 0.02em;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 18%, transparent);
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar__mono { font-size: calc(var(--s) * 0.36); line-height: 1; }
.avatar--xs { --s: 24px; }
.avatar--sm { --s: 32px; }
.avatar--md { --s: 40px; }
.avatar--lg { --s: 56px; }
.avatar--xl { --s: 88px; }
.avatar--xl .avatar__mono { font-family: var(--font-display); font-weight: 500; }
.avatar--ring { box-shadow: 0 0 0 2px var(--surface), 0 0 0 3px color-mix(in srgb, var(--c) 35%, transparent); }

.tint-0 { --c: var(--chart-1); }
.tint-1 { --c: var(--chart-3); }
.tint-2 { --c: var(--chart-2); }
.tint-3 { --c: var(--chart-5); }
.tint-4 { --c: var(--chart-4); }
.tint-5 { --c: var(--chart-6); }
</style>

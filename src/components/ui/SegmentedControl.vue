<script setup>
defineProps({
  modelValue: { type: [String, Number, Boolean], required: true },
  options: { type: Array, required: true }, // [{ value, label }]
  label: { type: String, default: '' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="seg" :class="[`seg--${size}`, { 'seg--block': block }]" role="radiogroup" :aria-label="label || undefined">
    <button
      v-for="o in options"
      :key="String(o.value)"
      type="button"
      role="radio"
      class="seg__opt"
      :class="{ 'is-active': o.value === modelValue }"
      :aria-checked="o.value === modelValue"
      @click="$emit('update:modelValue', o.value)"
    >
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.seg--block { display: flex; }
.seg--block .seg__opt { flex: 1; }
.seg__opt {
  height: 32px;
  padding: 0 14px;
  border-radius: 7px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--text-3);
  transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast), box-shadow var(--dur-fast);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.seg__opt:hover { color: var(--text); }
.seg__opt.is-active {
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 2px rgba(19, 36, 58, 0.08), 0 0 0 1px var(--border);
}
.seg__opt:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.seg--sm .seg__opt { height: 28px; padding: 0 10px; font-size: var(--fs-xs); }
</style>

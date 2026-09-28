<script setup>
import AppIcon from './AppIcon.vue'
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="check" :class="{ 'is-disabled': disabled }">
    <input type="checkbox" class="sr-only" :checked="modelValue" :disabled="disabled" @change="$emit('update:modelValue', $event.target.checked)" />
    <span class="check__box" aria-hidden="true"><AppIcon name="check" :size="13" :stroke="2.4" /></span>
    <span v-if="label || $slots.default" class="check__label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style scoped>
.check { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; color: var(--text-2); font-size: var(--fs-sm); }
.check.is-disabled { opacity: 0.55; cursor: not-allowed; }
.check__box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  display: grid;
  place-items: center;
  border: 1.5px solid var(--border-strong);
  background: var(--surface);
  color: transparent;
  transition: background-color var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
  flex: none;
}
input:checked + .check__box { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
input:focus-visible + .check__box { box-shadow: 0 0 0 3px var(--focus-ring); }
.check:hover input:not(:checked) + .check__box { border-color: var(--primary); }
</style>

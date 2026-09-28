<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  srLabel: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="switch" :class="[`switch--${size}`, { 'is-on': modelValue, 'is-disabled': disabled }]">
    <input
      type="checkbox"
      role="switch"
      class="sr-only"
      :checked="modelValue"
      :disabled="disabled"
      :aria-checked="modelValue"
      :aria-label="srLabel || undefined"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="switch__track" aria-hidden="true"><span class="switch__thumb" /></span>
    <span v-if="label" class="switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.switch.is-disabled { cursor: not-allowed; opacity: 0.5; }
.switch__track {
  --w: 38px;
  --h: 22px;
  position: relative;
  width: var(--w);
  height: var(--h);
  border-radius: 999px;
  background: var(--border-strong);
  transition: background-color var(--dur-base) var(--ease-out);
  flex: none;
}
.switch--sm .switch__track { --w: 30px; --h: 18px; }
.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(var(--h) - 4px);
  height: calc(var(--h) - 4px);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform var(--dur-base) var(--ease-out);
}
.is-on .switch__track { background: var(--primary); }
.is-on .switch__thumb { transform: translateX(calc(var(--w) - var(--h))); }
input:focus-visible + .switch__track { box-shadow: 0 0 0 3px var(--focus-ring); }
.switch__label { font-size: var(--fs-sm); color: var(--text-2); }
</style>

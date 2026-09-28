<script setup>
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  icon: { type: String, default: '' },
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 4 },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  min: { type: [Number, String], default: undefined },
  max: { type: [Number, String], default: undefined },
  step: { type: [Number, String], default: undefined },
  size: { type: String, default: 'md' },
})
const emit = defineEmits(['update:modelValue', 'blur', 'enter'])
const id = useId()
const describedBy = computed(() => (props.error || props.hint ? `${id}-desc` : undefined))

function onInput(e) {
  const v = e.target.value
  emit('update:modelValue', props.type === 'number' ? (v === '' ? '' : Number(v)) : v)
}
</script>

<template>
  <div class="field" :class="[`field--${size}`, { 'has-error': error, 'has-icon': icon, 'is-disabled': disabled }]">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true">*</span>
    </label>
    <div class="field__control">
      <AppIcon v-if="icon" :name="icon" :size="18" class="field__icon" />
      <textarea
        v-if="multiline"
        :id="id"
        class="field__input field__input--area"
        :rows="rows"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-invalid="!!error || undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="$emit('blur')"
      />
      <input
        v-else
        :id="id"
        class="field__input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :aria-invalid="!!error || undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="$emit('blur')"
        @keydown.enter="$emit('enter')"
      />
      <div v-if="$slots.suffix" class="field__suffix"><slot name="suffix" /></div>
    </div>
    <p v-if="error || hint" :id="`${id}-desc`" class="field__desc" :class="{ 'is-error': error }">
      <AppIcon v-if="error" name="alert-circle" :size="14" />
      {{ error || hint }}
    </p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-2); }
.field__req { color: var(--danger); margin-left: 2px; }
.field__control { position: relative; display: flex; align-items: center; }
.field__icon { position: absolute; left: 12px; color: var(--text-3); pointer-events: none; }
.field__input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-size: var(--fs-base);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.field--sm .field__input { height: 34px; font-size: var(--fs-sm); }
.field--lg .field__input { height: 48px; font-size: var(--fs-md); }
.field__input--area { height: auto; padding: 10px 12px; resize: vertical; line-height: var(--lh-normal); }
.has-icon .field__input { padding-left: 38px; }
.field__input::placeholder { color: var(--text-3); opacity: 0.85; }
.field__input:hover:not(:disabled) { border-color: color-mix(in srgb, var(--primary) 35%, var(--border-strong)); }
.field__input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }
.field__input:disabled { background: var(--surface-2); color: var(--text-3); cursor: not-allowed; }
.has-error .field__input { border-color: var(--danger); }
.has-error .field__input:focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 25%, transparent); }
.field__suffix { position: absolute; right: 6px; display: flex; align-items: center; gap: 4px; }
.field__desc { display: flex; align-items: center; gap: 6px; font-size: var(--fs-xs); color: var(--text-3); }
.field__desc.is-error { color: var(--danger); }
.field__input[type='number'] { font-variant-numeric: tabular-nums; }
</style>

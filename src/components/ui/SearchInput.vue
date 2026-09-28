<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Хайх…' },
  size: { type: String, default: 'md' }, // md | lg
  label: { type: String, default: 'Хайх' },
})
const emit = defineEmits(['update:modelValue', 'submit'])
const input = ref(null)
defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <form class="search" :class="`search--${size}`" role="search" @submit.prevent="$emit('submit', modelValue)">
    <AppIcon name="search" :size="size === 'lg' ? 20 : 18" class="search__icon" />
    <input
      ref="input"
      class="search__input"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="label"
      @input="emit('update:modelValue', $event.target.value)"
      @keydown.esc="emit('update:modelValue', '')"
    />
    <button v-if="modelValue" type="button" class="search__clear" aria-label="Цэвэрлэх" @click="emit('update:modelValue', ''); input?.focus()">
      <AppIcon name="x" :size="16" />
    </button>
  </form>
</template>

<style scoped>
.search { position: relative; display: flex; align-items: center; width: 100%; }
.search__icon { position: absolute; left: 14px; color: var(--text-3); pointer-events: none; }
.search__input {
  width: 100%;
  height: 42px;
  padding: 0 40px 0 42px;
  border-radius: 10px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-size: var(--fs-base);
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
  -webkit-appearance: none;
  appearance: none;
}
.search__input::-webkit-search-cancel-button { display: none; }
.search__input::placeholder { color: var(--text-3); }
.search__input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }
.search--lg .search__input { height: 54px; font-size: var(--fs-md); border-radius: 12px; padding-left: 48px; }
.search--lg .search__icon { left: 16px; }
.search__clear {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--text-3);
}
.search__clear:hover { background: var(--surface-2); color: var(--text); }
.search--lg .search__clear { right: 12px; }
</style>

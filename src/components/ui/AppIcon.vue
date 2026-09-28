<script setup>
import { computed } from 'vue'
import { icons } from '@/assets/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.5 },
  label: { type: String, default: '' },
})

const markup = computed(() => icons[props.name] ?? icons.circle)
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    v-html="markup"
  />
</template>

<style scoped>
.icon {
  flex: none;
  display: inline-block;
  vertical-align: middle;
}
</style>

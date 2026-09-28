<script setup>
import { computed } from 'vue'
import { useCountUp } from '@/composables/useCountUp'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  value: { type: Number, required: true },
  decimals: { type: Number, default: 0 },
  duration: { type: Number, default: 600 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
})
const { el, display } = useCountUp(() => props.value, { duration: props.duration })
const text = computed(() => `${props.prefix}${formatNumber(display.value, props.decimals)}${props.suffix}`)
</script>

<template>
  <span ref="el" class="countup" :aria-label="`${prefix}${formatNumber(value, decimals)}${suffix}`">
    <span aria-hidden="true">{{ text }}</span>
  </span>
</template>

<style scoped>
.countup { font-variant-numeric: tabular-nums lining-nums; }
</style>

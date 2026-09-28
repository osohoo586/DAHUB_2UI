<script setup>
/** The Golomt logo — always proportional (height only), never stretched, never captioned. */
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  variant: { type: String, default: 'horizontal' }, // horizontal | vertical | white | mark
  height: { type: Number, default: 34 },
})
const theme = useThemeStore()
const RATIO = { horizontal: 1344 / 240, vertical: 986 / 480, white: 1800 / 510, mark: 1 }
const src = computed(() => {
  if (props.variant === 'white') return '/brand/golomt-white.png'
  if (props.variant === 'mark') return '/brand/mark-180.png'
  const dark = theme.resolved === 'dark' ? '-dark' : ''
  return `/brand/golomt-${props.variant}${dark}.png`
})
const width = computed(() => Math.round(props.height * RATIO[props.variant]))
</script>

<template>
  <img class="logo" :class="`logo--${variant}`" :src="src" :width="width" :height="height" :style="{ height: height + 'px' }" alt="Голомт банк" decoding="async" draggable="false" />
</template>

<style scoped>
.logo { width: auto; max-width: none; object-fit: contain; user-select: none; }
.logo--mark { border-radius: 22%; }
</style>

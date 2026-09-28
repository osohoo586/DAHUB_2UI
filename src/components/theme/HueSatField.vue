<script setup>
/** 2-D picker: x = hue (0–360°), y = saturation (100% top → 0% bottom), at the given lightness. */
import { computed, ref } from 'vue'

const props = defineProps({
  h: { type: Number, required: true },
  s: { type: Number, required: true },
  l: { type: Number, required: true },
})
const emit = defineEmits(['change'])
const el = ref(null)
let dragging = false

const background = computed(() => {
  const L = props.l
  const hues = [0, 60, 120, 180, 240, 300, 360].map((h) => `hsl(${h} 100% ${L}%)`).join(', ')
  return `linear-gradient(to bottom, transparent, hsl(0 0% ${L}%)), linear-gradient(to right, ${hues})`
})
const thumb = computed(() => ({ left: `${(props.h / 360) * 100}%`, top: `${100 - props.s}%` }))

function fromEvent(e) {
  const r = el.value.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
  emit('change', { h: Math.round(x * 360), s: Math.round((1 - y) * 100) })
}
function down(e) {
  dragging = true
  el.value.setPointerCapture(e.pointerId)
  fromEvent(e)
}
function move(e) {
  if (dragging) fromEvent(e)
}
function up(e) {
  dragging = false
  el.value.releasePointerCapture?.(e.pointerId)
}
function key(e) {
  const step = e.shiftKey ? 10 : 2
  const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }
  const d = map[e.key]
  if (!d) return
  e.preventDefault()
  emit('change', { h: Math.min(360, Math.max(0, props.h + d[0])), s: Math.min(100, Math.max(0, props.s + d[1])) })
}
</script>

<template>
  <div
    ref="el"
    class="hs"
    :style="{ background }"
    role="slider"
    tabindex="0"
    aria-label="Өнгөний тон ба ханалт"
    :aria-valuetext="`Тон ${h}°, ханалт ${s}%`"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
    @keydown="key"
  >
    <span class="hs__thumb" :style="thumb" />
  </div>
</template>

<style scoped>
.hs {
  position: relative;
  height: 132px;
  border-radius: 10px;
  cursor: crosshair;
  touch-action: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
}
.hs:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.hs__thumb {
  position: absolute;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
</style>

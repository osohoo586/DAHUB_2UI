<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  slides: { type: Array, required: true }, // [{ id, src, alt }]
  interval: { type: Number, default: 5500 },
})

const index = ref(0)
const hovering = ref(false)
const reduced = ref(false)
const running = computed(() => !hovering.value && !reduced.value && props.slides.length > 1)
let timer = null
let startedAt = 0
let remaining = props.interval

function go(i) {
  index.value = (i + props.slides.length) % props.slides.length
  remaining = props.interval
  schedule()
}
function schedule() {
  clearTimeout(timer)
  if (!running.value) return
  startedAt = performance.now()
  timer = setTimeout(() => go(index.value + 1), remaining)
}
function hold() {
  if (timer) remaining = Math.max(400, remaining - (performance.now() - startedAt))
  clearTimeout(timer)
}
function setHover(v) {
  hovering.value = v
  v ? hold() : schedule()
}
function onKey(e) {
  if (e.key === 'ArrowRight') go(index.value + 1)
  if (e.key === 'ArrowLeft') go(index.value - 1)
}

onMounted(() => {
  reduced.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  schedule()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section
    class="ps"
    :class="{ 'is-paused': !running }"
    aria-roledescription="carousel"
    aria-label="Зургийн цомог"
    @mouseenter="setHover(true)"
    @mouseleave="setHover(false)"
    @focusin="setHover(true)"
    @focusout="setHover(false)"
    @keydown="onKey"
  >
    <img
      v-for="(s, i) in slides"
      :key="s.id"
      class="ps__img"
      :class="{ 'is-active': i === index }"
      :src="s.src"
      :alt="i === index ? s.alt : ''"
      :aria-hidden="i === index ? undefined : 'true'"
      decoding="async"
      draggable="false"
    />

    <div class="ps__dots" role="tablist" aria-label="Зураг сонгох">
      <button
        v-for="(s, i) in slides"
        :key="s.id"
        type="button"
        role="tab"
        class="ps__dot"
        :class="{ 'is-active': i === index }"
        :aria-selected="i === index"
        :aria-label="`${i + 1} / ${slides.length}`"
        :tabindex="i === index ? 0 : -1"
        @click="go(i)"
      >
        <span v-if="i === index" :key="`f${index}`" class="ps__fill" :style="{ animationDuration: interval + 'ms' }" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.ps {
  position: relative;
  height: 100%;
  min-height: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  isolation: isolate;
  background: var(--hero-fill);
  box-shadow: var(--shadow-1);
}
.ps__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.04);
  transition: opacity 1100ms var(--ease-standard), transform 7000ms linear;
  user-select: none;
}
.ps__img.is-active { opacity: 1; transform: scale(1); }
:root[data-theme='dark'] .ps__img { filter: brightness(0.92) saturate(0.95); }
/* Soft shade so the indicator reads on any image */
.ps::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 96px;
  background: linear-gradient(to top, rgba(4, 16, 34, 0.32), transparent);
  pointer-events: none;
}

.ps__dots {
  position: absolute;
  left: 50%;
  bottom: 16px;
  z-index: 1;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--radius-pill);
  background: rgba(6, 18, 36, 0.28);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
.ps__dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.45);
  overflow: hidden;
  transition: width 360ms var(--ease-out), background-color var(--dur-fast);
}
.ps__dot:hover { background: rgba(255, 255, 255, 0.75); }
.ps__dot.is-active { width: 28px; background: rgba(255, 255, 255, 0.4); }
.ps__dot:focus-visible { outline: none; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.85); }
.ps__fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--brand-yellow);
  transform-origin: left;
  animation: ps-fill linear both;
}
.is-paused .ps__fill { animation-play-state: paused; }
@keyframes ps-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

@media (prefers-reduced-motion: reduce) {
  .ps__img { transition: none; transform: none; }
  .ps__fill { animation: none; }
}
</style>

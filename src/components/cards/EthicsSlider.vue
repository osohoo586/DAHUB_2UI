<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  principles: { type: Array, required: true }, // [{ id, number, icon, title, summary }]
  interval: { type: Number, default: 6500 },
})

const index = ref(0)
const dir = ref(1)
const hovering = ref(false)
const reduced = ref(false)
const running = computed(() => !hovering.value && !reduced.value && props.principles.length > 1)
const current = computed(() => props.principles[index.value])
let timer = null
let startedAt = 0
let remaining = props.interval

function go(i, d = i > index.value ? 1 : -1) {
  dir.value = d
  index.value = (i + props.principles.length) % props.principles.length
  remaining = props.interval
  schedule()
}
const next = () => go(index.value + 1, 1)
const prev = () => go(index.value - 1, -1)
function schedule() {
  clearTimeout(timer)
  if (!running.value) return
  startedAt = performance.now()
  timer = setTimeout(next, remaining)
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
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
  reduced.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  schedule()
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <BaseCard
    class="es"
    padding="none"
    :class="{ 'is-paused': !running }"
    aria-roledescription="carousel"
    aria-label="Аудиторын ёс зүйн зарчмууд"
    @mouseenter="setHover(true)"
    @mouseleave="setHover(false)"
    @focusin="setHover(true)"
    @focusout="setHover(false)"
    @keydown="onKey"
  >
    <svg class="es__arcs" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle v-for="(r, i) in [36, 62, 88, 114, 140]" :key="r" cx="200" cy="200" :r="r" :style="{ opacity: 0.5 - i * 0.08 }" />
    </svg>

    <header class="es__head">
      <span class="eyebrow es__eyebrow">IIA · Ёс зүйн дүрэм</span>
      <div class="es__nav">
        <IconButton icon="chevron-left" label="Өмнөх зарчим" size="sm" variant="outline" @click="prev" />
        <IconButton icon="chevron-right" label="Дараагийн зарчим" size="sm" variant="outline" @click="next" />
      </div>
    </header>

    <div class="es__stage" :aria-live="running ? 'off' : 'polite'">
      <Transition :name="dir > 0 ? 'es-next' : 'es-prev'" mode="out-in">
        <article :key="current.id" class="es__slide" role="group" aria-roledescription="slide" :aria-label="`${index + 1} / ${principles.length}`">
          <div class="es__top">
            <span class="es__icon"><AppIcon :name="current.icon" :size="26" /></span>
            <span class="es__num num">{{ current.number }}</span>
          </div>
          <h2 class="es__title">{{ current.title }}</h2>
          <p class="es__summary">{{ current.summary }}</p>
        </article>
      </Transition>
    </div>

    <div class="es__progress" role="tablist" aria-label="Зарчим сонгох">
      <button
        v-for="(p, i) in principles"
        :key="p.id"
        type="button"
        role="tab"
        class="es__bar"
        :class="{ 'is-active': i === index, 'is-done': i < index }"
        :aria-selected="i === index"
        :aria-label="p.title"
        :tabindex="i === index ? 0 : -1"
        @click="go(i)"
      >
        <span v-if="i === index" :key="`f${index}`" class="es__fill" :style="{ animationDuration: interval + 'ms' }" />
      </button>
    </div>
  </BaseCard>
</template>

<style scoped>
.es { height: 100%; min-height: 0; padding: var(--home-pad, var(--space-6)); overflow: hidden; }
/* Brand motif — the eternal-sky arcs, very faint */
.es__arcs { position: absolute; right: -1px; bottom: -1px; width: min(70%, 320px); height: auto; z-index: -1; pointer-events: none; opacity: 0.22; }
.es__arcs circle { stroke: var(--primary); stroke-width: 1; }
:root[data-theme='dark'] .es__arcs { opacity: 0.32; }
.es__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.es__eyebrow { display: inline-flex; align-items: center; gap: 8px; }
.es__eyebrow::before { content: ''; width: 16px; height: 2px; border-radius: 2px; background: var(--accent); }
.es__nav { display: flex; gap: 6px; }

.es__stage { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: clamp(16px, 3.4vh, 40px) 0 clamp(16px, 3vh, 32px); }
/* Mark and number sit at the top, the principle itself settles at the bottom */
.es__slide { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.es__top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: auto; padding-bottom: clamp(12px, 2.4vh, 24px); }
.es__icon {
  width: clamp(48px, 7vh, 64px);
  height: clamp(48px, 7vh, 64px);
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: var(--primary-soft);
  color: var(--primary);
}
.es__num {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 11vh, 7rem);
  font-weight: 300;
  line-height: 0.78;
  color: var(--border-strong);
  font-variant-numeric: lining-nums;
}
.es__title { font-size: clamp(1.375rem, 3.4vh, 2rem); line-height: 1.15; }
.es__summary { margin-top: clamp(8px, 1.6vh, 14px); color: var(--text-2); font-size: clamp(0.875rem, 1.9vh, 1.0625rem); line-height: 1.6; }

.es__progress { display: flex; gap: 6px; }
.es__bar { position: relative; flex: 1; height: 16px; display: grid; align-items: center; border-radius: 4px; }
.es__bar::before { content: ''; height: 3px; border-radius: 3px; background: var(--border); transition: background-color var(--dur-fast); }
.es__bar.is-done::before { background: var(--primary-soft-2); }
.es__bar:hover::before { background: var(--border-strong); }
.es__bar:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--focus-ring); }
.es__fill {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  margin-top: -1.5px;
  border-radius: 3px;
  background: var(--primary);
  transform-origin: left;
  animation: es-fill linear both;
}
.es__fill::after { content: ''; position: absolute; right: 0; top: 0; width: 8px; height: 3px; border-radius: 3px; background: var(--accent); }
.is-paused .es__fill { animation-play-state: paused; }
@keyframes es-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.es-next-enter-active, .es-prev-enter-active { transition: opacity 420ms var(--ease-out), transform 420ms var(--ease-out); }
.es-next-leave-active, .es-prev-leave-active { transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out); }
.es-next-enter-from { opacity: 0; transform: translateX(24px); }
.es-next-leave-to { opacity: 0; transform: translateX(-12px); }
.es-prev-enter-from { opacity: 0; transform: translateX(-24px); }
.es-prev-leave-to { opacity: 0; transform: translateX(12px); }

@media (prefers-reduced-motion: reduce) {
  .es__fill { animation: none; }
}
</style>

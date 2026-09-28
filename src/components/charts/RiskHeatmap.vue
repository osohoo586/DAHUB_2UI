<script setup>
import { computed } from 'vue'
import { LIKELIHOOD, IMPACT, levelFor, RISK_LEVELS } from '@/services/risk'

const props = defineProps({
  risks: { type: Array, required: true },
  selected: { type: Object, default: null }, // { l, i }
})
const emit = defineEmits(['select'])

const counts = computed(() => {
  const m = {}
  for (const r of props.risks) {
    const k = `${r.likelihood}-${r.impact}`
    m[k] = (m[k] || 0) + 1
  }
  return m
})
const rows = [5, 4, 3, 2, 1]
const cols = [1, 2, 3, 4, 5]
const isSel = (l, i) => props.selected && props.selected.l === l && props.selected.i === i
function toggle(l, i) {
  emit('select', isSel(l, i) ? null : { l, i })
}
const legend = RISK_LEVELS.map((l) => ({ ...l, range: `${l.min}–${l.max}` }))
</script>

<template>
  <div class="hm">
    <div class="hm__ylabel" aria-hidden="true">Магадлал</div>
    <div class="hm__grid" role="grid" aria-label="Магадлал ба нөлөөллийн матриц">
      <template v-for="l in rows" :key="l">
        <div class="hm__rowhead" role="rowheader"><span class="num">{{ l }}</span>{{ LIKELIHOOD[l - 1] }}</div>
        <button
          v-for="i in cols"
          :key="`${l}-${i}`"
          type="button"
          role="gridcell"
          class="hm__cell"
          :class="[`is-${levelFor(l * i).key}`, { 'has-risk': counts[`${l}-${i}`], 'is-selected': isSel(l, i) }]"
          :aria-pressed="isSel(l, i)"
          :aria-label="`Магадлал ${l}, нөлөөлөл ${i}, оноо ${l * i} (${levelFor(l * i).label}): ${counts[`${l}-${i}`] || 0} эрсдэл`"
          :title="`${LIKELIHOOD[l - 1]} × ${IMPACT[i - 1]} = ${l * i} · ${levelFor(l * i).label} · ${counts[`${l}-${i}`] || 0} эрсдэл`"
          @click="toggle(l, i)"
        >
          <span class="hm__score num">{{ l * i }}</span>
          <span v-if="counts[`${l}-${i}`]" class="hm__count num">{{ counts[`${l}-${i}`] }}</span>
        </button>
      </template>
      <div />
      <div v-for="i in cols" :key="`x${i}`" class="hm__colhead"><span class="num">{{ i }}</span>{{ IMPACT[i - 1] }}</div>
    </div>
    <div class="hm__xlabel" aria-hidden="true">Нөлөөлөл</div>
    <ul class="hm__legend">
      <li v-for="lv in legend" :key="lv.key"><span class="hm__sw" :class="`is-${lv.key}`" />{{ lv.label }} <span class="num subtle">{{ lv.range }}</span></li>
    </ul>
  </div>
</template>

<style scoped>
.hm { display: grid; grid-template-columns: 22px 1fr; grid-template-areas: 'y grid' '. x' '. legend'; column-gap: 8px; }
.hm__ylabel { grid-area: y; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; font-size: var(--fs-xs); font-weight: var(--fw-semibold); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--text-3); }
.hm__xlabel { grid-area: x; text-align: center; margin: 4px 0 0 96px; font-size: var(--fs-xs); font-weight: var(--fw-semibold); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--text-3); }
.hm__grid { grid-area: grid; display: grid; grid-template-columns: 96px repeat(5, minmax(0, 1fr)); gap: 6px; }
.hm__rowhead, .hm__colhead { display: flex; flex-direction: column; justify-content: center; gap: 1px; font-size: 11px; color: var(--text-3); line-height: 1.25; }
.hm__rowhead .num, .hm__colhead .num { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-2); }
.hm__colhead { align-items: center; text-align: center; padding-top: 4px; }
.hm__cell {
  --c: var(--risk-low);
  position: relative;
  aspect-ratio: 1.35;
  min-height: 48px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--c) 16%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
  display: grid;
  place-items: center;
  transition: transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast), background-color var(--dur-base);
}
.hm__cell.is-medium { --c: var(--risk-medium); }
.hm__cell.is-high { --c: var(--risk-high); }
.hm__cell.is-critical { --c: var(--risk-critical); }
.hm__cell.has-risk { background: color-mix(in srgb, var(--c) 58%, var(--surface)); }
.hm__cell:hover { transform: translateY(-1px); box-shadow: var(--shadow-2); }
.hm__cell:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.hm__cell.is-selected { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--primary); }
.hm__cell.is-selected::after { content: ''; position: absolute; top: 5px; right: 5px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 2px var(--surface); }
.hm__score { position: absolute; left: 7px; top: 5px; font-size: 10px; color: color-mix(in srgb, var(--c) 45%, var(--text)); opacity: 0.8; }
.hm__count {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.hm__legend { grid-area: legend; list-style: none; display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 14px 0 0 96px; font-size: var(--fs-xs); color: var(--text-2); }
.hm__legend li { display: inline-flex; align-items: center; gap: 6px; }
.hm__sw { width: 12px; height: 12px; border-radius: 4px; background: var(--risk-low); }
.hm__sw.is-medium { background: var(--risk-medium); }
.hm__sw.is-high { background: var(--risk-high); }
.hm__sw.is-critical { background: var(--risk-critical); }
@media (max-width: 767px) {
  .hm__grid { grid-template-columns: 64px repeat(5, minmax(0, 1fr)); gap: 4px; }
  .hm__xlabel, .hm__legend { margin-left: 64px; }
  .hm__rowhead { font-size: 10px; }
}
</style>

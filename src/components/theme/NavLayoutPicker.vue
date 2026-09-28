<script setup>
import { ref, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { NAV_LAYOUTS, useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
const root = ref(null)

function pick(value) {
  layout.setNav(value)
}
function onKey(e, i) {
  const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!d) return
  e.preventDefault()
  const next = NAV_LAYOUTS[(i + d + NAV_LAYOUTS.length) % NAV_LAYOUTS.length]
  pick(next.value)
  nextTick(() => root.value?.querySelector(`[data-value="${next.value}"]`)?.focus())
}
</script>

<template>
  <div ref="root" class="nlp" role="radiogroup" aria-label="Навигацийн хэлбэр">
    <button
      v-for="(l, i) in NAV_LAYOUTS"
      :key="l.value"
      :data-value="l.value"
      type="button"
      role="radio"
      class="nlp__opt"
      :class="{ 'is-active': layout.nav === l.value }"
      :aria-checked="layout.nav === l.value"
      :tabindex="layout.nav === l.value ? 0 : -1"
      @click="pick(l.value)"
      @keydown="onKey($event, i)"
    >
      <span class="nlp__art" :class="`nlp__art--${l.value}`" aria-hidden="true">
        <span class="nlp__bar"><i /><i /><i /><i /></span>
        <span class="nlp__body"><b /><b /><b /></span>
        <span v-if="l.value === 'dropdown'" class="nlp__drop"><i /><i /><i /></span>
      </span>
      <span class="nlp__name">{{ l.label }}</span>
      <AppIcon v-if="layout.nav === l.value" name="check" :size="12" :stroke="2.4" class="nlp__check" />
    </button>
  </div>
</template>

<style scoped>
.nlp { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.nlp__opt {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 6px 8px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast), transform var(--dur-base) var(--ease-out);
}
.nlp__opt:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.nlp__opt:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.nlp__opt.is-active { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.nlp__name { font-size: 11px; font-weight: var(--fw-semibold); color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 16px 0 2px; }
.nlp__opt.is-active .nlp__name { color: var(--text); }
.nlp__check { position: absolute; bottom: 8px; right: 6px; color: var(--on-primary); background: var(--primary); border-radius: 50%; padding: 2px; width: 16px; height: 16px; }

/* Mini page: bar = the navigation, body = cards */
.nlp__art {
  --bar: 9px;
  position: relative;
  height: 54px;
  border-radius: 7px;
  overflow: hidden;
  background: var(--bg);
  box-shadow: inset 0 0 0 1px var(--border);
  display: flex;
}
.nlp__bar { flex: none; display: flex; align-items: center; gap: 3px; background: var(--surface); box-shadow: 0 0 0 1px var(--border); z-index: 1; }
.nlp__bar i { display: block; width: 7px; height: 2px; border-radius: 2px; background: var(--text-3); opacity: 0.55; }
.nlp__bar i:first-child { width: 5px; height: 5px; border-radius: 1.5px; background: var(--primary); opacity: 1; margin-right: auto; }
.nlp__bar i:nth-child(2) { background: var(--accent); opacity: 1; }
.nlp__body { flex: 1; display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 5px; gap: 3px; padding: 5px; }
.nlp__body b { border-radius: 2px; background: var(--surface); box-shadow: inset 0 0 0 1px var(--border); }
.nlp__body b:first-child { background: var(--primary); box-shadow: none; opacity: 0.85; }
.nlp__body b:last-child { grid-column: 1 / -1; }

.nlp__art--top, .nlp__art--dropdown { flex-direction: column; }
.nlp__art--top .nlp__bar, .nlp__art--dropdown .nlp__bar { height: var(--bar); padding: 0 5px; }
.nlp__art--bottom { flex-direction: column-reverse; }
.nlp__art--bottom .nlp__bar { height: 10px; justify-content: center; gap: 4px; padding: 0 5px; }
.nlp__art--bottom .nlp__bar i { width: 4px; height: 4px; border-radius: 1px; }
.nlp__art--bottom .nlp__bar i:first-child { margin-right: 0; }
.nlp__art--side .nlp__bar { width: 14px; flex-direction: column; align-items: center; padding: 5px 0; gap: 4px; }
.nlp__art--side .nlp__bar i { width: 6px; }
.nlp__art--side .nlp__bar i:first-child { margin: 0 0 3px; }

/* Dropdown: only logo + menu button, the menu hangs below */
.nlp__art--dropdown .nlp__bar i:nth-child(2),
.nlp__art--dropdown .nlp__bar i:nth-child(3) { display: none; }
.nlp__art--dropdown .nlp__bar i:last-child { width: 9px; height: 4px; border-radius: 2px; background: var(--text-3); opacity: 0.8; }
.nlp__drop {
  position: absolute;
  top: calc(var(--bar) + 2px);
  right: 4px;
  width: 22px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-radius: 3px;
  background: var(--surface);
  box-shadow: 0 0 0 1px var(--border-strong), 0 3px 6px -2px rgba(0, 0, 0, 0.25);
  z-index: 2;
}
.nlp__drop i { height: 2px; border-radius: 2px; background: var(--text-3); opacity: 0.55; }
.nlp__drop i:first-child { background: var(--accent); opacity: 1; }
</style>

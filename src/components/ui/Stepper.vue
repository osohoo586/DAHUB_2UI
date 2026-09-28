<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  steps: { type: Array, required: true }, // [{ key, label, description }]
  current: { type: Number, required: true },
  maxReached: { type: Number, default: 0 },
})
defineEmits(['go'])
</script>

<template>
  <ol class="stepper">
    <li
      v-for="(s, i) in steps"
      :key="s.key"
      class="step"
      :class="{ 'is-done': i < current, 'is-current': i === current, 'is-reachable': i <= maxReached }"
    >
      <button type="button" class="step__btn" :disabled="i > maxReached" :aria-current="i === current ? 'step' : undefined" @click="$emit('go', i)">
        <span class="step__dot">
          <AppIcon v-if="i < current" name="check" :size="14" :stroke="2.2" />
          <span v-else>{{ i + 1 }}</span>
        </span>
        <span class="step__text">
          <span class="step__label">{{ s.label }}</span>
          <span class="step__desc">{{ s.description }}</span>
        </span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
  counter-reset: step;
}
.step { position: relative; }
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 17px;
  left: 46px;
  right: 8px;
  height: 2px;
  border-radius: 2px;
  background: var(--border);
  transition: background-color var(--dur-slow) var(--ease-out);
}
.step.is-done:not(:last-child)::after { background: var(--primary); }
.step__btn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
  width: 100%;
  padding: 0;
  border-radius: 8px;
}
.step__btn:disabled { cursor: default; }
.step__dot {
  position: relative;
  z-index: 1;
  width: 36px;
  height: 36px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  background: var(--surface);
  border: 1.5px solid var(--border-strong);
  color: var(--text-3);
  transition: all var(--dur-base) var(--ease-out);
  font-variant-numeric: tabular-nums;
}
.is-current .step__dot {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft);
}
.is-current .step__dot::after {
  /* ember marker on the active step */
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 2px var(--surface);
}
.is-done .step__dot { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
.step__text { display: flex; flex-direction: column; gap: 2px; padding-top: 2px; min-width: 0; padding-right: 8px; background: var(--surface); position: relative; z-index: 1; }
.step__label { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text-2); }
.is-current .step__label, .is-done .step__label { color: var(--text); }
.step__desc { font-size: var(--fs-xs); color: var(--text-3); line-height: 1.35; }
.step__btn:focus-visible { outline: none; }
.step__btn:focus-visible .step__dot { box-shadow: 0 0 0 3px var(--focus-ring); }
@media (max-width: 1023px) {
  .step__desc { display: none; }
}
@media (max-width: 767px) {
  .stepper { grid-template-columns: repeat(4, auto); justify-content: space-between; }
  .step__text { display: none; }
  .step:not(:last-child)::after { display: none; }
}
</style>

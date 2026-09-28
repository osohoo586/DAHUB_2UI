<script setup>
defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, required: true },
  track: { type: String, default: '' }, // CSS background for the track (e.g. a gradient)
})
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="range"
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :value="modelValue"
    :aria-label="label"
    :style="track ? { '--track': track } : { '--pct': ((modelValue - min) / (max - min)) * 100 + '%' }"
    :class="{ 'range--custom': track }"
    @input="$emit('update:modelValue', Number($event.target.value))"
  />
</template>

<style scoped>
.range {
  --track: linear-gradient(to right, var(--primary) 0 var(--pct), var(--border-strong) var(--pct) 100%);
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 20px;
  background: transparent;
  cursor: pointer;
}
.range::-webkit-slider-runnable-track { height: 8px; border-radius: 999px; background: var(--track); box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06); }
.range::-moz-range-track { height: 8px; border-radius: 999px; background: var(--track); }
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -5px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 1px rgba(19, 36, 58, 0.25), 0 1px 3px rgba(0, 0, 0, 0.25);
}
.range::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid var(--surface); box-shadow: 0 0 0 1px rgba(19, 36, 58, 0.25); }
.range:focus-visible { outline: none; }
.range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px var(--focus-ring); }
</style>

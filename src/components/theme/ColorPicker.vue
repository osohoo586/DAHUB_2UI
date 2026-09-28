<script setup>
import { ref, computed, watch } from 'vue'
import HueSatField from './HueSatField.vue'
import RangeSlider from '@/components/ui/RangeSlider.vue'
import { hexToRgb, rgbToHex, hexToHsl, hslToHex, normalizeHex, harmonies } from '@/utils/color'

const props = defineProps({ modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])

// Local HSL state so hue survives when saturation hits 0 (greys).
const hsl = ref(hexToHsl(props.modelValue))
const hexDraft = ref(props.modelValue)
const hexError = ref('')
let lastEmitted = props.modelValue

watch(
  () => props.modelValue,
  (v) => {
    hexDraft.value = v
    hexError.value = ''
    if (v !== lastEmitted) {
      const next = hexToHsl(v)
      hsl.value = next.s < 1 ? { ...next, h: hsl.value.h } : next
    }
  },
)

function emitHex(hex) {
  lastEmitted = hex
  emit('update:modelValue', hex)
}

const rgb = computed(() => hexToRgb(props.modelValue))

function setHS({ h, s }) {
  hsl.value = { ...hsl.value, h, s }
  emitHex(hslToHex(hsl.value))
}
function setL(l) {
  hsl.value = { ...hsl.value, l }
  emitHex(hslToHex(hsl.value))
}
function setChannel(ch, v) {
  const n = Math.min(255, Math.max(0, Math.round(Number(v) || 0)))
  const next = { ...rgb.value, [ch]: n }
  const hex = rgbToHex(next)
  const h = hexToHsl(hex)
  hsl.value = h.s < 1 ? { ...h, h: hsl.value.h } : h
  emitHex(hex)
}
function commitHex() {
  const hex = normalizeHex(hexDraft.value)
  if (!hex) {
    hexError.value = 'HEX буруу (жишээ: #005AA9)'
    return
  }
  hexError.value = ''
  hsl.value = hexToHsl(hex)
  emitHex(hex)
}
function pick(hex) {
  hsl.value = hexToHsl(hex)
  emitHex(hex)
}

const tracks = computed(() => {
  const { r, g, b } = rgb.value
  return {
    r: `linear-gradient(to right, rgb(0 ${g} ${b}), rgb(255 ${g} ${b}))`,
    g: `linear-gradient(to right, rgb(${r} 0 ${b}), rgb(${r} 255 ${b}))`,
    b: `linear-gradient(to right, rgb(${r} ${g} 0), rgb(${r} ${g} 255))`,
    l: `linear-gradient(to right, #000, hsl(${hsl.value.h} ${hsl.value.s}% 50%), #fff)`,
  }
})
const suggestions = computed(() => harmonies(props.modelValue))
const CHANNELS = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
]
</script>

<template>
  <div class="cp">
    <HueSatField :h="Math.round(hsl.h)" :s="Math.round(hsl.s)" :l="Math.round(hsl.l)" @change="setHS" />
    <div class="cp__row">
      <span class="cp__ch">L</span>
      <RangeSlider :model-value="Math.round(hsl.l)" :min="0" :max="100" label="Гэрэлтэлт" :track="tracks.l" @update:model-value="setL" />
      <span class="cp__val num">{{ Math.round(hsl.l) }}%</span>
    </div>
    <div v-for="c in CHANNELS" :key="c.key" class="cp__row">
      <span class="cp__ch">{{ c.label }}</span>
      <RangeSlider :model-value="rgb[c.key]" :min="0" :max="255" :label="`${c.label} суваг`" :track="tracks[c.key]" @update:model-value="setChannel(c.key, $event)" />
      <input
        class="cp__num num"
        type="number"
        min="0"
        max="255"
        :value="rgb[c.key]"
        :aria-label="`${c.label} утга`"
        @change="setChannel(c.key, $event.target.value)"
      />
    </div>
    <div class="cp__hex">
      <span class="cp__swatch" :style="{ background: modelValue }" />
      <input
        v-model="hexDraft"
        class="cp__hex-input"
        :class="{ 'is-error': hexError }"
        type="text"
        maxlength="7"
        spellcheck="false"
        aria-label="HEX утга"
        @change="commitHex"
        @keydown.enter.prevent="commitHex"
      />
    </div>
    <p v-if="hexError" class="cp__err">{{ hexError }}</p>
    <div class="cp__harmony">
      <span class="cp__hlabel">Зохицол</span>
      <div class="cp__chips">
        <button v-for="s in suggestions" :key="s.key" type="button" class="cp__chip" :title="`${s.label} · ${s.hex}`" @click="pick(s.hex)">
          <span class="cp__chip-sw" :style="{ background: s.hex }" />
          <span>{{ s.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cp { display: flex; flex-direction: column; gap: 10px; }
.cp__row { display: grid; grid-template-columns: 16px 1fr 56px; align-items: center; gap: 10px; }
.cp__ch { font-size: var(--fs-xs); font-weight: var(--fw-semibold); color: var(--text-3); }
.cp__val { font-size: var(--fs-xs); color: var(--text-2); text-align: right; }
.cp__num {
  width: 56px;
  height: 30px;
  padding: 0 6px;
  border-radius: 6px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-size: var(--fs-sm);
  text-align: right;
}
.cp__num:focus, .cp__hex-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--focus-ring); }
.cp__hex { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.cp__swatch { width: 34px; height: 34px; border-radius: 8px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12); flex: none; }
.cp__hex-input {
  flex: 1;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--border-strong);
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  text-transform: uppercase;
}
.cp__hex-input.is-error { border-color: var(--danger); }
.cp__err { font-size: var(--fs-xs); color: var(--danger); }
.cp__harmony { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.cp__hlabel { font-size: var(--fs-xs); color: var(--text-3); font-weight: var(--fw-medium); }
.cp__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.cp__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px 0 4px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  font-size: 11px;
  color: var(--text-2);
}
.cp__chip:hover { border-color: var(--border-strong); color: var(--text); }
.cp__chip-sw { width: 20px; height: 20px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12); }
</style>

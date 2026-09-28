<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import { designById } from '@/utils/sampling'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  design: { type: String, required: true },
  measure: { type: String, default: 'mean' }, // mean | proportion
  allocation: { type: String, default: 'proportional' },
  values: { type: Object, default: null }, // { z, S, E, N, n, p }
})

const katex = ref(null)
onMounted(async () => {
  const [mod] = await Promise.all([import('katex'), import('katex/dist/katex.min.css')])
  katex.value = mod.default
})

const d = computed(() => designById(props.design))

const formulas = computed(() => {
  const out = []
  const wor = !d.value.replacement
  if (!d.value.stratified) {
    if (props.measure === 'mean') {
      out.push({ caption: 'Анхны түүврийн хэмжээ', tex: 'n_0 = \\left(\\dfrac{z_{\\alpha/2}\\,\\sigma}{E}\\right)^{2}' })
      if (wor) out.push({ caption: 'Төгсгөлөг олонлогийн засвар (FPC)', tex: 'n = \\dfrac{n_0}{1 + \\dfrac{n_0}{N}}' })
      out.push({
        caption: 'Алдааны хязгаар',
        tex: wor ? 'E = z_{\\alpha/2}\\,\\dfrac{\\sigma}{\\sqrt{n}}\\sqrt{1-\\dfrac{n}{N}}' : 'E = z_{\\alpha/2}\\,\\dfrac{\\sigma}{\\sqrt{n}}',
      })
      out.push({ caption: 'Стандарт хазайлт', tex: '\\sigma = \\sqrt{\\dfrac{1}{N-1}\\sum_{i=1}^{N}\\left(x_i-\\bar{x}\\right)^{2}}' })
    } else {
      out.push({ caption: 'Анхны түүврийн хэмжээ', tex: 'n_0 = \\dfrac{z_{\\alpha/2}^{2}\\,p\\,(1-p)}{E^{2}}' })
      if (wor) out.push({ caption: 'Төгсгөлөг олонлогийн засвар (FPC)', tex: 'n = \\dfrac{n_0}{1 + \\dfrac{n_0 - 1}{N}}' })
      out.push({
        caption: 'Алдааны хязгаар',
        tex: wor ? 'E = z_{\\alpha/2}\\sqrt{\\dfrac{p(1-p)}{n}\\cdot\\dfrac{N-n}{N-1}}' : 'E = z_{\\alpha/2}\\sqrt{\\dfrac{p(1-p)}{n}}',
      })
    }
  } else {
    const alloc =
      props.design === 'proportional' || props.allocation === 'proportional'
        ? { caption: 'Пропорциональ хуваарилалт', tex: 'n_h = n\\cdot\\dfrac{N_h}{N}' }
        : props.allocation === 'neyman'
          ? { caption: 'Neyman хуваарилалт', tex: 'n_h = n\\cdot\\dfrac{N_h\\,\\sigma_h}{\\sum_{h} N_h\\,\\sigma_h}' }
          : props.allocation === 'equal'
            ? { caption: 'Тэнцүү хуваарилалт', tex: 'n_h = \\dfrac{n}{H}' }
            : { caption: 'Гараар хуваарилалт', tex: 'n = \\sum_{h=1}^{H} n_h' }
    out.push(alloc)
    out.push({ caption: 'Давхаргат дундажийн дисперс', tex: 'V(\\bar{y}_{st}) = \\sum_{h} W_h^{2}\\left(1-\\dfrac{n_h}{N_h}\\right)\\dfrac{\\sigma_h^{2}}{n_h}' })
    out.push({ caption: 'Алдааны хязгаар', tex: 'E = z_{\\alpha/2}\\sqrt{V(\\bar{y}_{st})},\\qquad W_h = \\dfrac{N_h}{N}' })
    if (props.allocation !== 'manual')
      out.push({ caption: 'Түүврийн нийт хэмжээ', tex: 'n = \\dfrac{\\sum_{h} W_h^{2}\\sigma_h^{2}/a_h}{(E/z)^{2} + \\frac{1}{N}\\sum_{h} W_h\\sigma_h^{2}}' })
  }
  return out
})

const substitution = computed(() => {
  const v = props.values
  if (!v || d.value.stratified || !v.E) return ''
  if (props.measure === 'mean') {
    const n0 = ((v.z * v.S) / v.E) ** 2
    return `n₀ = (${formatNumber(v.z, 3)} × ${formatNumber(v.S, 0)} ÷ ${formatNumber(v.E, 0)})² = ${formatNumber(n0, 2)}`
  }
  const n0 = (v.z * v.z * v.p * (1 - v.p)) / (v.E * v.E)
  return `n₀ = ${formatNumber(v.z, 3)}² × ${formatNumber(v.p, 2)} × ${formatNumber(1 - v.p, 2)} ÷ ${formatNumber(v.E, 3)}² = ${formatNumber(n0, 2)}`
})

const render = (tex) => katex.value.renderToString(tex, { displayMode: true, throwOnError: false, output: 'html' })

const symbols = computed(() => {
  const base = [
    ['N', 'Эх олонлогийн хэмжээ'],
    ['n', 'Түүврийн хэмжээ'],
    ['z', 'Итгэлцлийн коэффициент'],
    ['E', 'Алдааны хязгаар'],
  ]
  if (props.measure === 'mean' || d.value.stratified) base.push(['σ', 'Стандарт хазайлт'])
  if (props.measure === 'proportion' && !d.value.stratified) base.push(['p', 'Хүлээгдэж буй пропорц'])
  if (d.value.stratified) base.push(['W_h', 'Давхаргын жин'], ['H', 'Давхаргын тоо'])
  return base
})
</script>

<template>
  <BaseCard title="Томьёо" :subtitle="`${d.label} · ${d.title}`" class="fc">
    <div v-if="katex" class="fc__list">
      <figure v-for="f in formulas" :key="f.tex" class="fc__item">
        <figcaption class="fc__cap">{{ f.caption }}</figcaption>
        <div class="fc__tex" v-html="render(f.tex)" />
      </figure>
      <p v-if="substitution" class="fc__sub num">{{ substitution }}</p>
    </div>
    <Skeleton v-else :lines="4" height="28px" />
    <dl class="fc__symbols">
      <div v-for="[s, label] in symbols" :key="s"><dt>{{ s }}</dt><dd>{{ label }}</dd></div>
    </dl>
  </BaseCard>
</template>

<style scoped>
.fc__list { display: flex; flex-direction: column; gap: 4px; }
.fc__item { margin: 0; padding: 10px 0; border-bottom: 1px dashed var(--border); }
.fc__item:last-of-type { border-bottom: 0; }
.fc__cap { font-size: var(--fs-xs); color: var(--text-3); font-weight: var(--fw-medium); }
.fc__tex { color: var(--text); overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
.fc__tex :deep(.katex-display) { margin: 6px 0 0; text-align: left; }
.fc__tex :deep(.katex-display > .katex) { text-align: left; }
.fc__tex :deep(.katex) { font-size: 1.08em; }
.fc__sub { margin-top: 6px; padding: 10px 12px; border-radius: 8px; background: var(--primary-soft); color: var(--text); font-size: var(--fs-sm); }
.fc__symbols { margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; }
.fc__symbols div { display: flex; gap: 8px; font-size: var(--fs-xs); }
.fc__symbols dt { font-family: var(--font-display); font-style: italic; color: var(--primary); min-width: 22px; }
.fc__symbols dd { margin: 0; color: var(--text-3); }
</style>

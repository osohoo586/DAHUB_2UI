<script setup>
/**
 * Generated line-art cover for DAG News — one visual language per category,
 * varied deterministically by seed. Sky-blue structure, a single yellow "ember".
 */
import { computed } from 'vue'
import { mulberry32 } from '@/utils/prng'

const props = defineProps({
  category: { type: String, required: true }, // it | cyber | general
  seed: { type: Number, default: 1 },
  title: { type: String, default: '' },
})

const W = 320
const H = 180

const art = computed(() => {
  const r = mulberry32(props.seed * 7919 + props.category.length * 131)
  const rnd = (a, b) => a + r() * (b - a)
  const pick = (arr) => arr[Math.floor(r() * arr.length)]

  if (props.category === 'it') {
    // Circuit: grid nodes connected by orthogonal traces
    const cols = 7
    const rows = 4
    const gx = W / (cols + 1)
    const gy = H / (rows + 1)
    const nodes = []
    for (let i = 1; i <= cols; i++) for (let j = 1; j <= rows; j++) if (r() > 0.28) nodes.push([i * gx, j * gy])
    const traces = []
    for (let k = 0; k < 9; k++) {
      const a = pick(nodes)
      const b = pick(nodes)
      if (!a || !b || a === b) continue
      traces.push(`M${a[0]} ${a[1]}H${b[0]}V${b[1]}`)
    }
    const ember = pick(nodes)
    return { kind: 'it', nodes, traces, ember }
  }

  if (props.category === 'cyber') {
    const cx = rnd(190, 250)
    const cy = rnd(70, 110)
    const rings = [22, 40, 58, 78, 100, 124].map((rad, i) => ({ rad, dash: i % 2 ? `${rnd(4, 14)} ${rnd(6, 12)}` : 'none' }))
    const ticks = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2
      const r1 = 132
      const r2 = i % 3 ? 138 : 146
      return `M${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}L${cx + Math.cos(a) * r2} ${cy + Math.sin(a) * r2}`
    })
    const emberAngle = rnd(-2.4, -0.6)
    return { kind: 'cyber', cx, cy, rings, ticks, emberAngle }
  }

  // general: stacked pages under a sky arc
  const baseX = rnd(150, 190)
  const pages = [0, 1, 2].map((i) => ({ x: baseX + i * 18, y: 44 + i * 12, w: 118, h: 150 }))
  const lines = Array.from({ length: 6 }, (_, i) => ({ y: 76 + i * 12 + 24, w: rnd(48, 88) }))
  return { kind: 'general', pages, lines, sun: { x: rnd(54, 96), y: rnd(58, 86) } }
})

// ember on a cyber ring
function arcPath(cx, cy, rad, a0, a1) {
  const p0 = [cx + Math.cos(a0) * rad, cy + Math.sin(a0) * rad]
  const p1 = [cx + Math.cos(a1) * rad, cy + Math.sin(a1) * rad]
  return `M${p0[0]} ${p0[1]}A${rad} ${rad} 0 0 1 ${p1[0]} ${p1[1]}`
}
</script>

<template>
  <svg class="cover" :class="`cover--${category}`" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid slice" role="img" :aria-label="title || 'Нийтлэлийн зураг'">
    <rect class="bg" :width="W" :height="H" />
    <path class="horizon" :d="`M-20 ${H - 26}Q${W / 2} ${H - 60} ${W + 20} ${H - 26}`" />

    <template v-if="art.kind === 'it'">
      <path v-for="(d, i) in art.traces" :key="'t' + i" class="trace" :d="d" />
      <circle v-for="(n, i) in art.nodes" :key="'n' + i" class="node" :cx="n[0]" :cy="n[1]" r="3" />
      <circle v-if="art.ember" class="ember-ring" :cx="art.ember[0]" :cy="art.ember[1]" r="9" />
      <circle v-if="art.ember" class="ember" :cx="art.ember[0]" :cy="art.ember[1]" r="3.5" />
    </template>

    <template v-else-if="art.kind === 'cyber'">
      <circle v-for="(ring, i) in art.rings" :key="'r' + i" class="ring" :cx="art.cx" :cy="art.cy" :r="ring.rad" :stroke-dasharray="ring.dash" />
      <path v-for="(d, i) in art.ticks" :key="'k' + i" class="tick" :d="d" />
      <path class="shield" :transform="`translate(${art.cx - 12} ${art.cy - 14})`" d="M12 1.5 22 5v8.2c0 6.3-4.3 10.6-10 12.3C6.3 23.8 2 19.5 2 13.2V5z" />
      <path class="ember-arc" :d="arcPath(art.cx, art.cy, 78, art.emberAngle, art.emberAngle + 0.55)" />
    </template>

    <template v-else>
      <path class="sky" :d="`M${art.sun.x - 44} ${art.sun.y + 30}a44 44 0 0 1 88 0`" />
      <path class="sky faint" :d="`M${art.sun.x - 64} ${art.sun.y + 30}a64 64 0 0 1 128 0`" />
      <circle class="ember" :cx="art.sun.x" :cy="art.sun.y + 30" r="5" />
      <rect v-for="(p, i) in art.pages" :key="'p' + i" class="page" :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="8" />
      <path v-for="(l, i) in art.lines" :key="'l' + i" class="text-line" :d="`M${art.pages[2].x + 16} ${l.y}h${l.w}`" />
      <path class="text-line strong" :d="`M${art.pages[2].x + 16} ${art.pages[2].y + 22}h54`" />
    </template>
  </svg>
</template>

<style scoped>
.cover { display: block; width: 100%; height: 100%; }
.bg { fill: color-mix(in srgb, var(--c) 9%, var(--surface)); }
.cover--it { --c: var(--primary); }
.cover--cyber { --c: var(--chart-3); }
.cover--general { --c: var(--chart-5); }
.horizon { fill: none; stroke: color-mix(in srgb, var(--c) 30%, transparent); stroke-width: 1; }

.trace { fill: none; stroke: color-mix(in srgb, var(--c) 45%, transparent); stroke-width: 1.4; stroke-linejoin: round; }
.node { fill: var(--surface); stroke: color-mix(in srgb, var(--c) 70%, var(--text)); stroke-width: 1.4; }

.ring { fill: none; stroke: color-mix(in srgb, var(--c) 42%, transparent); stroke-width: 1.2; }
.tick { stroke: color-mix(in srgb, var(--c) 35%, transparent); stroke-width: 1.2; stroke-linecap: round; }
.shield { fill: var(--surface); stroke: color-mix(in srgb, var(--c) 75%, var(--text)); stroke-width: 1.5; stroke-linejoin: round; }
.ember-arc { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; }

.sky { fill: none; stroke: color-mix(in srgb, var(--c) 50%, transparent); stroke-width: 1.4; stroke-linecap: round; }
.sky.faint { opacity: 0.5; }
.page { fill: var(--surface); stroke: color-mix(in srgb, var(--c) 40%, var(--border)); stroke-width: 1.2; }
.text-line { stroke: color-mix(in srgb, var(--c) 25%, var(--border-strong)); stroke-width: 3; stroke-linecap: round; }
.text-line.strong { stroke: color-mix(in srgb, var(--c) 60%, var(--text)); stroke-width: 4; }

.ember { fill: var(--accent); }
.ember-ring { fill: none; stroke: var(--accent); stroke-width: 1.4; opacity: 0.55; }
</style>

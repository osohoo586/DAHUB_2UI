<script setup>
const bars = [62, 84, 48, 72, 38]
</script>

<template>
  <div class="tp">
    <div class="tp__hero"><span class="tp__hero-line" /></div>
    <div class="tp__card">
      <span class="tp__eyebrow">Жишээ card</span>
      <p class="tp__title">Нээлттэй олдвор</p>
      <p class="tp__value">46</p>
      <p class="tp__text">Өмнөх улиралтай харьцуулахад 15-аар буурсан.</p>
      <svg class="tp__chart" viewBox="0 0 150 56" aria-hidden="true">
        <line x1="0" y1="55.5" x2="150" y2="55.5" class="tp__axis" />
        <rect v-for="(b, i) in bars" :key="i" :x="6 + i * 29" :y="56 - b * 0.62" width="18" :height="b * 0.62" rx="3" :class="`tp__bar c${i + 1}`" />
      </svg>
      <div class="tp__actions">
        <span class="tp__btn">Үндсэн товч</span>
        <span class="tp__link">Холбоос</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tp { border-radius: 12px; border: 1px solid var(--border); background: var(--bg); padding: 10px; }
.tp__hero { height: 34px; border-radius: 8px; background: var(--hero-fill); margin-bottom: 10px; display: flex; align-items: flex-end; padding: 0 12px 8px; }
.tp__hero-line { width: 24px; height: 2px; border-radius: 2px; background: var(--accent); }
.tp__card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; box-shadow: var(--shadow-1); }
.tp__card::before { content: ''; position: absolute; top: -1px; left: 14px; right: 14px; height: 2px; border-radius: 2px; background: var(--accent); }
.tp__eyebrow { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); font-weight: var(--fw-semibold); }
.tp__title { font-weight: var(--fw-semibold); margin-top: 4px; font-size: var(--fs-sm); }
.tp__value { font-size: 28px; font-weight: var(--fw-semibold); line-height: 1.1; margin-top: 2px; font-variant-numeric: tabular-nums; }
.tp__text { font-size: var(--fs-xs); color: var(--text-2); margin-top: 2px; }
.tp__chart { width: 100%; height: 56px; margin: 10px 0 12px; }
.tp__axis { stroke: var(--chart-axis); stroke-width: 1; }
.tp__bar.c1 { fill: var(--chart-1); }
.tp__bar.c2 { fill: var(--chart-2); }
.tp__bar.c3 { fill: var(--chart-3); }
.tp__bar.c4 { fill: var(--chart-4); }
.tp__bar.c5 { fill: var(--chart-5); }
.tp__actions { display: flex; align-items: center; gap: 12px; }
.tp__btn { display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 7px; background: var(--primary); color: var(--on-primary); font-size: var(--fs-xs); font-weight: var(--fw-medium); }
.tp__link { font-size: var(--fs-xs); color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
</style>

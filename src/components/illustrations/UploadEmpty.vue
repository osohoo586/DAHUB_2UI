<template>
  <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" class="art">
    <path class="sky s1" d="M20 92a60 60 0 0 1 120 0" />
    <path class="sky s2" d="M40 92a40 40 0 0 1 80 0" />
    <rect class="sheet" x="54" y="36" width="52" height="62" rx="6" />
    <path class="grid" d="M54 52h52M54 66h52M54 80h52M72 52v46M90 52v46" />
    <rect class="head" x="54" y="36" width="52" height="16" rx="6" />
    <path class="arrow" d="M80 30V12m-7 7 7-7 7 7" />
    <circle class="spark" cx="80" cy="8" r="1.8" />
  </svg>
</template>

<style scoped>
.art { display: block; }
.sky { stroke: var(--primary); stroke-width: 1.5; stroke-linecap: round; }
.s1 { opacity: 0.16; }
.s2 { opacity: 0.3; }
.sheet { fill: var(--surface); stroke: var(--text-3); stroke-width: 1.5; }
.head { fill: var(--primary-soft); stroke: var(--text-3); stroke-width: 1.5; }
.grid { stroke: var(--border-strong); stroke-width: 1.2; }
.arrow { stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.spark { fill: var(--accent); }
</style>

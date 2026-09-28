<template>
  <!-- Empty state: the hearth (голомт) beneath the eternal blue sky arcs -->
  <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" class="art">
    <path class="sky s1" d="M16 84a64 64 0 0 1 128 0" />
    <path class="sky s2" d="M32 84a48 48 0 0 1 96 0" />
    <path class="sky s3" d="M48 84a32 32 0 0 1 64 0" />
    <path class="ground" d="M20 98h120" />
    <path class="line" d="M60 98l5-14h30l5 14" />
    <path class="line" d="M68 84v-4h24v4" />
    <path class="flame" d="M80 44c6 8 13 13 11 23-1 7-6 11-11 11s-11-4-11-11c0-6 4-9 6-13 1 4 3 6 5 6 1-5-1-10 0-16z" />
    <path class="flame-core" d="M80 62c3 4 5 6 4 10-.5 3-2 4-4 4s-4-1.5-4-4c0-3 2-5 4-10z" />
    <circle class="spark" cx="94" cy="42" r="1.6" />
    <circle class="spark" cx="68" cy="38" r="1.2" />
    <circle class="spark" cx="86" cy="30" r="1" />
  </svg>
</template>

<style scoped>
.art { display: block; }
.sky { stroke: var(--primary); stroke-width: 1.5; stroke-linecap: round; }
.s1 { opacity: 0.18; }
.s2 { opacity: 0.3; }
.s3 { opacity: 0.45; }
.ground { stroke: var(--border-strong); stroke-width: 1.5; stroke-linecap: round; }
.line { stroke: var(--text-3); stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; }
.flame { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.5; stroke-linejoin: round; }
.flame-core { fill: var(--accent); opacity: 0.7; }
.spark { fill: var(--accent); opacity: 0.7; }
</style>

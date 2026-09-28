<template>
  <svg viewBox="0 0 160 120" fill="none" aria-hidden="true" class="art">
    <path class="sky s1" d="M16 84a64 64 0 0 1 128 0" />
    <path class="sky s2" d="M36 84a44 44 0 0 1 88 0" />
    <path class="ground" d="M20 98h120" />
    <circle class="lens" cx="74" cy="58" r="20" />
    <path class="line" d="M88.5 72.5 104 88" />
    <path class="line faint" d="M66 54h16M66 61h10" />
    <circle class="spark" cx="112" cy="40" r="2" />
    <circle class="spark s" cx="50" cy="36" r="1.3" />
  </svg>
</template>

<style scoped>
.art { display: block; }
.sky { stroke: var(--primary); stroke-width: 1.5; stroke-linecap: round; }
.s1 { opacity: 0.18; }
.s2 { opacity: 0.32; }
.ground { stroke: var(--border-strong); stroke-width: 1.5; stroke-linecap: round; }
.lens { stroke: var(--text-3); stroke-width: 1.8; fill: var(--surface); }
.line { stroke: var(--text-3); stroke-width: 2.4; stroke-linecap: round; }
.faint { stroke-width: 1.5; opacity: 0.6; }
.spark { fill: var(--accent); }
.spark.s { opacity: 0.6; }
</style>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
defineProps({ blocks: { type: Array, required: true } })
</script>

<template>
  <div class="prose">
    <template v-for="(b, i) in blocks" :key="i">
      <h2 v-if="b.t === 'h2'">{{ b.text }}</h2>
      <p v-else-if="b.t === 'p'">{{ b.text }}</p>
      <ul v-else-if="b.t === 'ul'">
        <li v-for="item in b.items" :key="item">{{ item }}</li>
      </ul>
      <ol v-else-if="b.t === 'ol'">
        <li v-for="item in b.items" :key="item">{{ item }}</li>
      </ol>
      <blockquote v-else-if="b.t === 'quote'">
        <AppIcon name="quote" :size="20" class="prose__q" />
        <p>{{ b.text }}</p>
      </blockquote>
    </template>
  </div>
</template>

<style scoped>
.prose { font-size: 1.125rem; line-height: var(--lh-relaxed); color: var(--text); }
.prose > * + * { margin-top: 1.1em; }
.prose h2 { font-size: 1.625rem; line-height: 1.3; margin-top: 2em; margin-bottom: -0.2em; }
.prose p { color: color-mix(in srgb, var(--text) 88%, var(--text-2)); }
.prose ul, .prose ol { padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 0.6em; }
.prose li { position: relative; padding-left: 1.6em; }
.prose ul li::before { content: ''; position: absolute; left: 0.35em; top: 0.72em; width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
.prose ol { counter-reset: item; }
.prose ol li { counter-increment: item; }
.prose ol li::before {
  content: counter(item);
  position: absolute;
  left: 0;
  top: 0.2em;
  width: 1.3em;
  height: 1.3em;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 0.72em;
  font-weight: var(--fw-semibold);
  color: var(--primary);
  background: var(--primary-soft);
  font-variant-numeric: tabular-nums;
}
.prose blockquote {
  position: relative;
  margin: 2em 0;
  padding: 0.2em 0 0.2em 1.4em;
  border-left: 2px solid var(--accent);
}
.prose blockquote p { font-family: var(--font-display); font-size: 1.35rem; line-height: 1.5; color: var(--text); font-style: italic; }
.prose__q { position: absolute; left: -0.1em; top: -1.6em; color: var(--accent); opacity: 0.8; }
</style>

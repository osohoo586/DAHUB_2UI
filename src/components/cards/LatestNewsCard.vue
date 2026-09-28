<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import Tag from '@/components/ui/Tag.vue'
import NewsCover from '@/components/illustrations/NewsCover.vue'
import { categoryLabel, categoryTone } from '@/services/news'
import { formatDate } from '@/utils/format'

defineProps({
  article: { type: Object, required: true },
})
</script>

<template>
  <BaseCard :to="`/news/${article.slug}`" padding="none" class="ln" as="article">
    <div class="ln__cover" aria-hidden="true">
      <NewsCover :category="article.category" :seed="article.cover?.seed ?? 1" />
    </div>
    <div class="ln__body">
      <Tag size="sm" :tone="categoryTone(article.category)">{{ categoryLabel(article.category) }}</Tag>
      <h3 class="ln__title clamp-2" :title="article.title">{{ article.title }}</h3>
      <time class="ln__date num" :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
    </div>
  </BaseCard>
</template>

<style scoped>
.ln { height: 100%; overflow: hidden; }
.ln__cover {
  flex: none;
  height: var(--ln-cover, 88px);
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-bottom: 1px solid var(--border);
}
.ln__cover :deep(svg) { transition: transform 600ms var(--ease-out); }
.ln:hover .ln__cover :deep(svg) { transform: scale(1.04); }
.ln__body { flex: 1; min-height: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: var(--ln-pad, 12px 14px 12px); }
.ln__title {
  font-family: var(--font-sans);
  font-size: var(--ln-title, var(--fs-base));
  font-weight: var(--fw-semibold);
  line-height: 1.35;
  color: var(--text);
  overflow-wrap: anywhere;
}
.ln__date { margin-top: auto; font-size: var(--fs-xs); color: var(--text-3); }
</style>

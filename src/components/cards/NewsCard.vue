<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import Tag from '@/components/ui/Tag.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import NewsCover from '@/components/illustrations/NewsCover.vue'
import { categoryLabel, categoryTone } from '@/services/news'
import { formatDate } from '@/utils/format'

defineProps({
  article: { type: Object, required: true },
  author: { type: Object, default: null },
})
</script>

<template>
  <BaseCard :to="`/news/${article.slug}`" padding="none" class="nc" as="article">
    <div class="nc__cover">
      <NewsCover :category="article.category" :seed="article.cover?.seed ?? 1" :title="article.title" />
    </div>
    <div class="nc__body">
      <Tag size="sm" :tone="categoryTone(article.category)">{{ categoryLabel(article.category) }}</Tag>
      <h3 class="nc__title clamp-2">{{ article.title }}</h3>
      <p class="nc__excerpt clamp-3">{{ article.excerpt }}</p>
      <div class="nc__meta">
        <span class="nc__author">
          <Avatar v-if="author" :member="author" size="xs" />
          <span v-if="author">{{ author.lastName[0] }}. {{ author.firstName }}</span>
        </span>
        <span class="nc__facts num">
          {{ formatDate(article.publishedAt) }}
          <span class="nc__dot" aria-hidden="true" />
          <AppIcon name="clock" :size="13" />{{ article.readMinutes }} мин
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.nc { height: 100%; overflow: hidden; }
.nc__cover { aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0; border-bottom: 1px solid var(--border); }
.nc__cover :deep(svg) { transition: transform 600ms var(--ease-out); }
.nc:hover .nc__cover :deep(svg) { transform: scale(1.03); }
.nc__body { flex: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding: 18px 20px 18px; }
.nc__title { font-family: var(--font-display); font-size: var(--fs-lg); font-weight: 560; line-height: 1.3; letter-spacing: -0.005em; }
.nc__excerpt { color: var(--text-2); font-size: var(--fs-sm); line-height: 1.6; }
.nc__meta { margin-top: auto; width: 100%; padding-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: var(--fs-xs); color: var(--text-3); }
.nc__author { display: inline-flex; align-items: center; gap: 8px; min-width: 0; white-space: nowrap; overflow: hidden; }
.nc__facts { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.nc__dot { width: 3px; height: 3px; border-radius: 50%; background: var(--text-3); margin: 0 2px; }
</style>

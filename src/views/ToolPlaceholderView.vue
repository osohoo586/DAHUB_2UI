<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Tag from '@/components/ui/Tag.vue'
import { categoryOf } from '@/services/tools'
import { useToolsStore } from '@/stores/tools'

const route = useRoute()
const tools = useToolsStore()
tools.load()

const tool = computed(() => tools.byId(route.params.id))
const category = computed(() => (tool.value ? categoryOf(tool.value.category) : null))
</script>

<template>
  <div class="page container tph">
    <RouterLink to="/tools" class="tph__back"><AppIcon name="arrow-left" :size="16" />Хэрэгсэл</RouterLink>

    <BaseCard v-if="!tools.loaded" padding="lg"><Skeleton :lines="4" height="18px" /></BaseCard>

    <BaseCard v-else-if="tool" padding="lg" class="tph__card" v-reveal>
      <div class="tph__id">
        <span class="tph__icon"><AppIcon :name="tool.icon" :size="26" /></span>
        <div>
          <h1 class="tph__title">{{ tool.name }}</h1>
          <Tag size="sm" :tone="category.tone" dot>{{ category.label }}</Tag>
        </div>
      </div>
      <EmptyState title="Хөгжүүлэлт хийгдэж байна" :description="tool.description">
        <BaseButton to="/tools" variant="secondary" icon="arrow-left">Хэрэгслийн сан</BaseButton>
      </EmptyState>
    </BaseCard>

    <BaseCard v-else padding="lg" v-reveal>
      <EmptyState variant="search" title="Хэрэгсэл олдсонгүй" description="Энэ хэрэгсэл устгагдсан эсвэл холбоос буруу байна.">
        <BaseButton to="/tools" variant="secondary" icon="arrow-left">Хэрэгслийн сан</BaseButton>
      </EmptyState>
    </BaseCard>
  </div>
</template>

<style scoped>
.tph { max-width: calc(880px + var(--page-x) * 2); }
.tph__back { display: inline-flex; align-items: center; gap: 6px; margin-bottom: var(--space-5); font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-3); }
.tph__back:hover { color: var(--primary); text-decoration: none; }
.tph__id { display: flex; align-items: center; gap: 16px; padding-bottom: var(--space-6); border-bottom: 1px solid var(--border); }
.tph__icon { width: 56px; height: 56px; flex: none; display: grid; place-items: center; border-radius: 16px; background: var(--primary-soft); color: var(--primary); }
.tph__title { font-size: var(--fs-2xl); margin-bottom: 8px; }
</style>

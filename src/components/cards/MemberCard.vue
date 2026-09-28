<script setup>
import BaseCard from '@/components/ui/BaseCard.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Tag from '@/components/ui/Tag.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  member: { type: Object, required: true },
  unitName: { type: String, default: '' },
  roleLabel: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <BaseCard class="mc" :class="{ 'mc--compact': compact }" :padding="compact ? 'sm' : 'md'">
    <div class="mc__head">
      <Avatar :member="member" :size="compact ? 'md' : 'lg'" />
      <div class="mc__id">
        <h3 class="mc__name">{{ member.lastName }} {{ member.firstName }}</h3>
        <p class="mc__pos">{{ member.position }}</p>
      </div>
      <div v-if="$slots.actions" class="mc__actions"><slot name="actions" /></div>
    </div>
    <div class="mc__tags">
      <Tag tone="primary" size="sm">{{ roleLabel }}</Tag>
      <Tag v-if="unitName && unitName !== roleLabel" size="sm">{{ unitName }}</Tag>
      <Tag v-for="c in member.certifications?.slice(0, compact ? 1 : 2)" :key="c" size="sm" tone="accent">{{ c }}</Tag>
    </div>
    <div v-if="!compact" class="mc__contact">
      <a :href="`mailto:${member.latin}@golomtbank.com`" class="mc__line"><AppIcon name="mail" :size="15" />{{ member.latin }}@golomtbank.com</a>
      <span class="mc__line num"><AppIcon name="phone" :size="15" />{{ member.phone }}</span>
    </div>
  </BaseCard>
</template>

<style scoped>
.mc { height: 100%; }
.mc__head { display: flex; gap: 14px; align-items: flex-start; }
.mc__id { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.mc__name { font-family: var(--font-sans); font-size: var(--fs-base); font-weight: var(--fw-semibold); line-height: 1.3; }
.mc__pos { font-size: var(--fs-sm); color: var(--text-3); line-height: 1.4; }
.mc--compact .mc__name { font-size: var(--fs-sm); }
.mc--compact .mc__pos { font-size: var(--fs-xs); }
.mc__actions { margin: -6px -8px 0 0; }
.mc__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.mc--compact .mc__tags { margin-top: 10px; }
.mc__contact { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
.mc__line { display: flex; align-items: center; gap: 8px; font-size: var(--fs-xs); color: var(--text-2); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc__line .icon { color: var(--text-3); }
a.mc__line:hover { color: var(--primary); }
</style>

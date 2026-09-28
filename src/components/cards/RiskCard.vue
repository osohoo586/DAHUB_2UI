<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Tag from '@/components/ui/Tag.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { riskScore, levelFor, statusFor } from '@/services/risk'
import { formatDate, daysUntil } from '@/utils/format'

const props = defineProps({
  risk: { type: Object, required: true },
  owner: { type: Object, default: null },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
})
defineEmits(['edit', 'delete'])

const score = computed(() => riskScore(props.risk))
const level = computed(() => levelFor(score.value))
const status = computed(() => statusFor(props.risk.status))
const days = computed(() => daysUntil(props.risk.dueDate))
const overdue = computed(() => days.value < 0 && props.risk.status !== 'closed')
</script>

<template>
  <BaseCard class="rc" :class="`rc--${level.key}`" padding="md" as="article">
    <div class="rc__top">
      <span class="rc__id num">{{ risk.id }}</span>
      <Tag :tone="level.key" dot size="sm">{{ level.label }} · {{ score }}</Tag>
      <div v-if="canEdit || canDelete" class="rc__actions">
        <IconButton v-if="canEdit" icon="pencil" label="Засах" size="sm" @click="$emit('edit', risk)" />
        <IconButton v-if="canDelete" icon="trash" label="Устгах" size="sm" @click="$emit('delete', risk)" />
      </div>
    </div>
    <h3 class="rc__title">{{ risk.title }}</h3>
    <p class="rc__meta"><AppIcon name="building" :size="14" />{{ risk.unit }} <span class="rc__sep">·</span> {{ risk.category }}</p>
    <p class="rc__desc clamp-2">{{ risk.description }}</p>

    <div class="rc__lxi num" :title="`Магадлал ${risk.likelihood} × Нөлөөлөл ${risk.impact}`">
      <span>M <strong>{{ risk.likelihood }}</strong></span>
      <span class="rc__x">×</span>
      <span>Н <strong>{{ risk.impact }}</strong></span>
    </div>

    <ul class="rc__controls">
      <li v-for="c in risk.controls.slice(0, 2)" :key="c"><AppIcon name="shield-check" :size="14" />{{ c }}</li>
      <li v-if="risk.controls.length > 2" class="rc__more">+{{ risk.controls.length - 2 }} хяналт</li>
    </ul>

    <footer class="rc__foot">
      <span class="rc__owner">
        <Avatar v-if="owner" :member="owner" size="xs" />
        <span>{{ owner ? `${owner.lastName[0]}. ${owner.firstName}` : '—' }}</span>
      </span>
      <span class="rc__due num" :class="{ 'is-overdue': overdue }"><AppIcon name="calendar" :size="13" />{{ formatDate(risk.dueDate) }}</span>
      <Tag :tone="status.tone" size="sm">{{ status.label }}</Tag>
    </footer>
  </BaseCard>
</template>

<style scoped>
.rc { height: 100%; }
.rc::before { opacity: 1; transform: none; left: 0; right: auto; top: 20px; width: 3px; height: 28px; border-radius: 0 3px 3px 0; box-shadow: none; }
.rc--low::before { background: var(--risk-low); }
.rc--medium::before { background: var(--risk-medium); }
.rc--high::before { background: var(--risk-high); }
.rc--critical::before { background: var(--risk-critical); }
.rc__top { display: flex; align-items: center; gap: 10px; min-height: 32px; }
.rc__id { font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-3); }
.rc__actions { margin-left: auto; display: flex; gap: 2px; margin-right: -8px; }
.rc__title { font-family: var(--font-sans); font-size: var(--fs-base); font-weight: var(--fw-semibold); line-height: 1.4; margin-top: 10px; }
.rc__meta { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: var(--fs-xs); color: var(--text-3); }
.rc__sep { opacity: 0.6; }
.rc__desc { margin-top: 10px; font-size: var(--fs-sm); color: var(--text-2); line-height: 1.55; }
.rc__lxi { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 4px 10px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); font-size: var(--fs-xs); color: var(--text-3); align-self: flex-start; }
.rc__lxi strong { color: var(--text); font-size: var(--fs-sm); }
.rc__x { opacity: 0.6; }
.rc__controls { list-style: none; margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.rc__controls li { display: flex; gap: 8px; font-size: var(--fs-xs); color: var(--text-2); line-height: 1.45; }
.rc__controls .icon { color: var(--success); flex: none; margin-top: 1px; }
.rc__more { color: var(--text-3) !important; padding-left: 22px; }
.rc__foot { margin-top: auto; padding-top: 14px; display: flex; align-items: center; gap: 10px; border-top: 1px solid var(--border); margin-top: 16px; }
.rc__owner { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-xs); color: var(--text-2); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; }
.rc__due { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-xs); color: var(--text-3); }
.rc__due.is-overdue { color: var(--danger); font-weight: var(--fw-semibold); }
</style>

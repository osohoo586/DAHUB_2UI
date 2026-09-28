<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ProgressRing from '@/components/charts/ProgressRing.vue'
import { formatDate, daysUntil, formatNumber } from '@/utils/format'

const props = defineProps({
  assessment: { type: Object, required: true },
  lead: { type: Object, default: null },
  levelCounts: { type: Array, required: true }, // [{ key, label, count }]
})
const days = computed(() => daysUntil(props.assessment.dueDate))
</script>

<template>
  <BaseCard class="ac" :title="assessment.title" :subtitle="assessment.period">
    <div class="ac__head">
      <ProgressRing :value="assessment.progress" :size="104" :stroke="9" label="Үнэлгээний явц">
        <div>
          <span class="ac__pct num">{{ assessment.progress }}%</span>
          <span class="ac__pct-label">явц</span>
        </div>
      </ProgressRing>
      <dl class="ac__facts">
        <div><dt>Хамрагдсан нэгж</dt><dd class="num">{{ assessment.unitsAssessed }} / {{ assessment.units }}</dd></div>
        <div>
          <dt>Дуусах хугацаа</dt>
          <dd class="num">{{ formatDate(assessment.dueDate) }} <span class="ac__left" :class="{ 'is-late': days < 0 }">{{ days >= 0 ? `${days} хоног үлдсэн` : `${-days} хоног хэтэрсэн` }}</span></dd>
        </div>
        <div v-if="lead"><dt>Удирдагч</dt><dd class="ac__lead"><Avatar :member="lead" size="xs" />{{ lead.lastName[0] }}. {{ lead.firstName }}</dd></div>
      </dl>
    </div>

    <ol class="ac__stages">
      <li v-for="s in assessment.stages" :key="s.key" class="stage" :class="`is-${s.status}`">
        <span class="stage__mark">
          <AppIcon v-if="s.status === 'done'" name="check" :size="12" :stroke="2.4" />
        </span>
        <span class="stage__label">{{ s.label }}</span>
        <span class="stage__date num">{{ formatDate(s.date) }}</span>
      </li>
    </ol>

    <div class="ac__levels">
      <div v-for="l in levelCounts" :key="l.key" class="lvl" :class="`is-${l.key}`">
        <span class="lvl__count num">{{ l.count }}</span>
        <span class="lvl__label">{{ l.label }}</span>
      </div>
    </div>

    <div v-if="assessment.domains" class="ac__domains">
      <p class="eyebrow">Домэйн · бэлэн байдал (0–5)</p>
      <div v-for="dm in assessment.domains" :key="dm.key" class="dom">
        <div class="dom__row"><span>{{ dm.label }}</span><span class="num">{{ formatNumber(dm.score, 1) }} <span class="subtle">/ {{ formatNumber(dm.target, 1) }}</span></span></div>
        <div class="dom__bar" role="meter" :aria-valuenow="dm.score" aria-valuemin="0" aria-valuemax="5" :aria-label="dm.label">
          <span class="dom__fill" :class="{ 'is-short': dm.score < dm.target - 0.75 }" :style="{ width: (dm.score / 5) * 100 + '%' }" />
          <span class="dom__target" :style="{ left: (dm.target / 5) * 100 + '%' }" title="Зорилтот түвшин" />
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.ac { height: 100%; }
.ac__head { display: flex; gap: 24px; align-items: center; }
.ac__pct { display: block; font-size: var(--fs-xl); font-weight: var(--fw-semibold); line-height: 1; }
.ac__pct-label { font-size: 11px; color: var(--text-3); }
.ac__facts { margin: 0; display: flex; flex-direction: column; gap: 10px; }
.ac__facts dt { font-size: var(--fs-xs); color: var(--text-3); }
.ac__facts dd { margin: 2px 0 0; font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.ac__left { margin-left: 6px; font-size: var(--fs-xs); font-weight: var(--fw-regular); color: var(--text-3); }
.ac__left.is-late { color: var(--danger); }
.ac__lead { display: inline-flex; align-items: center; gap: 6px; }

.ac__stages { list-style: none; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; }
.stage { position: relative; display: grid; grid-template-columns: 20px 1fr auto; gap: 12px; align-items: center; padding: 7px 0; }
.stage:not(:last-child)::after { content: ''; position: absolute; left: 9px; top: 26px; bottom: -8px; width: 2px; background: var(--border); }
.stage.is-done:not(:last-child)::after { background: var(--primary); }
.stage__mark { position: relative; z-index: 1; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; border: 2px solid var(--border-strong); background: var(--surface); }
.is-done .stage__mark { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
.is-active .stage__mark { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-soft); }
.is-active .stage__mark::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
.stage__label { font-size: var(--fs-sm); color: var(--text-2); }
.is-active .stage__label { color: var(--text); font-weight: var(--fw-semibold); }
.is-done .stage__label { color: var(--text); }
.stage__date { font-size: var(--fs-xs); color: var(--text-3); }

.ac__levels { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 18px; }
.lvl { --c: var(--risk-low); display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 10px; background: color-mix(in srgb, var(--c) 12%, var(--surface)); border-left: 3px solid var(--c); }
.lvl.is-medium { --c: var(--risk-medium); }
.lvl.is-high { --c: var(--risk-high); }
.lvl.is-critical { --c: var(--risk-critical); }
.lvl__count { font-size: var(--fs-xl); font-weight: var(--fw-semibold); line-height: 1.1; }
.lvl__label { font-size: 11px; color: var(--text-2); }

.ac__domains { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.dom__row { display: flex; justify-content: space-between; font-size: var(--fs-xs); color: var(--text-2); margin-bottom: 5px; }
.dom__bar { position: relative; height: 6px; border-radius: 999px; background: var(--primary-soft); }
.dom__fill { display: block; height: 100%; border-radius: inherit; background: var(--primary); transition: width 600ms var(--ease-out); }
.dom__fill.is-short { background: var(--warning); }
.dom__target { position: absolute; top: -3px; width: 2px; height: 12px; margin-left: -1px; border-radius: 2px; background: var(--text-2); }
</style>

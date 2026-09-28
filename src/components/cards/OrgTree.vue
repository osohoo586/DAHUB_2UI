<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AvatarStack from '@/components/ui/AvatarStack.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import MemberCard from './MemberCard.vue'

const props = defineProps({
  org: { type: Object, required: true },
  members: { type: Array, required: true },
  roleLabel: { type: Function, required: true },
})

const root = ref(null)
const level = ref(0) // 0 root · 1 units · 2 people
const selected = ref('leadership')
let io = null
const timers = []

const membersOf = (id) => props.members.filter((m) => m.unitId === id)
const selectedUnit = computed(() => (selected.value === 'leadership' ? props.org.root : props.org.units.find((u) => u.id === selected.value)))
const people = computed(() => membersOf(selected.value))
const total = computed(() => props.members.length)

function select(id) {
  selected.value = id
  if (level.value < 2) level.value = 2
}

function unfold() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    level.value = 2
    return
  }
  timers.push(setTimeout(() => (level.value = 1), 180))
  timers.push(setTimeout(() => (level.value = 2), 1100))
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return unfold()
  io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        unfold()
        io.disconnect()
      }
    },
    { threshold: 0.25 },
  )
  io.observe(root.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div ref="root" class="org" :class="`is-level-${level}`">
    <div class="org__tree">
      <div class="org__root">
        <button type="button" class="node node--root" :class="{ 'is-selected': selected === 'leadership' }" :aria-pressed="selected === 'leadership'" @click="select('leadership')">
          <AvatarStack :members="membersOf('leadership')" size="sm" />
          <span class="node__text">
            <span class="node__name">{{ org.root.name }}</span>
            <span class="node__meta num">{{ org.root.headcount }} удирдлага · нийт {{ total }} хүн</span>
          </span>
        </button>
      </div>

      <div class="org__links" aria-hidden="true">
        <span class="org__stem" />
        <span class="org__bus" />
      </div>

      <div class="org__units">
        <div v-for="(u, i) in org.units" :key="u.id" class="org__unit" :style="{ '--i': i }">
          <span class="org__drop" aria-hidden="true" />
          <button type="button" class="node" :class="{ 'is-selected': selected === u.id }" :aria-pressed="selected === u.id" @click="select(u.id)">
            <span class="node__icon"><AppIcon :name="u.icon" :size="18" /></span>
            <span class="node__name">{{ u.name }}</span>
            <span class="node__foot">
              <span class="node__count num">{{ u.headcount }} ажилтан</span>
              <AvatarStack :members="membersOf(u.id)" :max="3" size="xs" />
            </span>
          </button>
        </div>
      </div>
    </div>

    <Transition name="rise" mode="out-in">
      <section v-if="level >= 2 && selectedUnit" :key="selected" class="org__panel" :aria-label="selectedUnit.name">
        <header class="org__panel-head">
          <div>
            <h3 class="org__panel-title">{{ selectedUnit.name }}</h3>
            <p class="org__panel-desc">{{ selectedUnit.description }}</p>
          </div>
          <span class="org__panel-count num">{{ people.length }} хүн</span>
        </header>
        <div class="org__people">
          <MemberCard
            v-for="(m, i) in people"
            :key="m.id"
            v-reveal="i"
            :member="m"
            :role-label="roleLabel(m.role)"
            compact
          />
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.org { --gap: 16px; }
.org__tree { position: relative; }
.org__root { display: flex; justify-content: center; }

.node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 16px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-1);
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base), transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base);
}
.node::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 16px;
  right: 16px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  opacity: 0;
  transform: scaleX(0.4);
  transition: opacity var(--dur-base), transform 360ms var(--ease-out);
}
.node:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); border-color: var(--border-strong); }
.node:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.node.is-selected { border-color: var(--primary); background: color-mix(in srgb, var(--primary-soft) 70%, var(--surface)); }
.node.is-selected::before, .node:hover::before { opacity: 1; transform: scaleX(1); }

.node--root { width: auto; min-width: 320px; flex-direction: row; align-items: center; gap: 14px; padding: 16px 22px; }
.node__text { display: flex; flex-direction: column; gap: 2px; }
.node--root .node__name { font-family: var(--font-display); font-size: var(--fs-xl); font-weight: 560; }
.node__name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); line-height: 1.35; color: var(--text); }
.node__meta { font-size: var(--fs-xs); color: var(--text-3); }
.node__icon { width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary); }
.node.is-selected .node__icon { background: var(--primary); color: var(--on-primary); }
.node__foot { margin-top: auto; width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.node__count { font-size: var(--fs-xs); color: var(--text-3); }

/* Connectors — drawn level by level */
.org__links { position: relative; height: 28px; }
.org__stem {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  margin-left: -1px;
  background: var(--border-strong);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 260ms var(--ease-out);
}
.org__bus {
  position: absolute;
  bottom: 0;
  height: 2px;
  left: calc((100% - 4 * var(--gap)) / 10);
  right: calc((100% - 4 * var(--gap)) / 10);
  background: var(--border-strong);
  transform: scaleX(0);
  transition: transform 420ms var(--ease-out) 220ms;
}
.org__units { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--gap); }
.org__unit { display: flex; flex-direction: column; align-items: stretch; }
.org__drop {
  align-self: center;
  width: 2px;
  height: 22px;
  background: var(--border-strong);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 220ms var(--ease-out) calc(560ms + var(--i) * 40ms);
}
.org__unit .node { opacity: 0; transform: translateY(12px); transition-property: opacity, transform, border-color, background-color, box-shadow; transition-duration: 420ms, 420ms, var(--dur-base), var(--dur-base), var(--dur-base); transition-delay: calc(700ms + var(--i) * 70ms), calc(700ms + var(--i) * 70ms), 0s, 0s, 0s; }
.org:not(.is-level-0) .org__stem { transform: scaleY(1); }
.org:not(.is-level-0) .org__bus { transform: scaleX(1); }
.org:not(.is-level-0) .org__drop { transform: scaleY(1); }
.org:not(.is-level-0) .org__unit .node { opacity: 1; transform: none; }
.org:not(.is-level-0) .org__unit .node:hover { transform: translateY(-2px); transition-delay: 0s; }

.org__panel { margin-top: var(--space-8); padding-top: var(--space-8); border-top: 1px solid var(--border); }
.org__panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: var(--space-5); }
.org__panel-title { font-size: var(--fs-xl); }
.org__panel-desc { margin-top: 4px; color: var(--text-2); font-size: var(--fs-sm); max-width: 640px; }
.org__panel-count { font-size: var(--fs-sm); color: var(--text-3); white-space: nowrap; }
.org__people { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); }

@media (max-width: 1279px) {
  .org__people { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 1023px) {
  .org__links, .org__drop { display: none; }
  .org__units { grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: var(--space-4); }
  .org__people { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 767px) {
  .org__units, .org__people { grid-template-columns: 1fr; }
  .node--root { min-width: 0; width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .org__stem, .org__bus, .org__drop, .org__unit .node { transition: none !important; }
}
</style>

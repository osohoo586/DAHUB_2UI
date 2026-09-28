<script setup>
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Tag from '@/components/ui/Tag.vue'
import { categoryOf } from '@/services/tools'

const props = defineProps({
  tool: { type: Object, required: true }, // { id, name, description, category, icon, builtin, ready, to }
  sortable: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'remove', 'move'])

const category = computed(() => categoryOf(props.tool.category))
const menu = computed(() => [
  { label: 'Засах', icon: 'pencil', action: () => emit('edit', props.tool) },
  { label: 'Устгах', icon: 'trash', tone: 'danger', action: () => emit('remove', props.tool) },
])

function onHandleKey(e) {
  const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key]
  if (!d) return
  e.preventDefault()
  emit('move', d)
}
</script>

<template>
  <BaseCard as="article" class="tool" :class="{ 'is-custom': !tool.builtin }" padding="none" interactive>
    <div class="tool__top">
      <span class="tool__icon"><AppIcon :name="tool.icon" :size="24" /></span>
      <div class="tool__actions">
        <button
          v-if="sortable"
          type="button"
          class="tool__handle"
          :aria-label="`${tool.name} — байрыг сумаар өөрчлөх`"
          title="Чирж эсвэл сумаар байрыг өөрчлөх"
          @keydown="onHandleKey"
        >
          <AppIcon name="grip" :size="16" />
        </button>
        <DropdownMenu v-if="editable && !tool.builtin" :items="menu" :width="168" :label="`${tool.name} — үйлдэл`">
          <template #trigger><IconButton icon="more" :label="`${tool.name} — үйлдэл`" size="sm" /></template>
        </DropdownMenu>
      </div>
    </div>

    <h3 class="tool__name">{{ tool.name }}</h3>
    <p class="tool__desc" :title="tool.description">{{ tool.description }}</p>

    <div class="tool__foot">
      <Tag size="sm" :tone="category.tone" dot>{{ category.label }}</Tag>
      <BaseButton :to="tool.to" class="tool__open" variant="secondary" size="sm" icon-right="arrow-right" draggable="false" :aria-label="`${tool.name} — нээх`">Нээх</BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.tool { height: 100%; padding: var(--space-5); gap: 0; }
.tool__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: var(--space-4); }
.tool__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary);
  transition: background-color var(--dur-base), color var(--dur-base);
}
.tool:hover .tool__icon { background: var(--primary); color: var(--on-primary); }
/* Actions sit above the card-wide link */
.tool__actions { position: relative; z-index: 2; display: flex; align-items: center; gap: 2px; }
.tool__handle {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  color: var(--text-3);
  cursor: grab;
  opacity: 0.55;
  transition: opacity var(--dur-fast), background-color var(--dur-fast), color var(--dur-fast);
}
.tool:hover .tool__handle, .tool__handle:focus-visible { opacity: 1; }
.tool__handle:hover { background: var(--surface-2); color: var(--text); }
.tool__handle:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }

.tool__name { font-family: var(--font-sans); font-size: var(--fs-md); font-weight: var(--fw-semibold); line-height: 1.35; }
.tool__desc { margin-top: 4px; color: var(--text-3); font-size: var(--fs-sm); line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }

.tool__foot { margin-top: auto; padding-top: var(--space-5); display: flex; align-items: center; justify-content: space-between; gap: 8px; }
/* Stretched link: the whole card opens the tool; buttons above stay clickable */
.tool__open::after { content: ''; position: absolute; inset: 0; z-index: 1; border-radius: var(--radius-lg); }
</style>

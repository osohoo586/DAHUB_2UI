<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { useFloating } from '@/composables/useFloating'

const props = defineProps({
  items: { type: Array, required: true }, // [{ label, icon?, to?, action?, tone?, divider?, hint? }]
  align: { type: String, default: 'right' },
  width: { type: Number, default: 240 },
  label: { type: String, default: 'Цэс' },
})
const router = useRouter()
const open = ref(false)
const root = ref(null)
const menu = ref(null)
const floating = useFloating({ align: props.align, estimate: 260, gap: 8 })

async function toggle() {
  open.value = !open.value
  if (open.value) {
    floating.start(root.value.querySelector('[data-trigger]'))
    await nextTick()
    menu.value?.querySelector('[role="menuitem"]')?.focus()
  }
}
function close(focusTrigger = false) {
  open.value = false
  floating.stop()
  if (focusTrigger) root.value?.querySelector('[data-trigger] button, [data-trigger] [tabindex]')?.focus()
}
function run(item) {
  close()
  if (item.to) router.push(item.to)
  else item.action?.()
}
function onMenuKey(e) {
  const items = [...menu.value.querySelectorAll('[role="menuitem"]')]
  const i = items.indexOf(document.activeElement)
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(i + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(i - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Escape') {
    e.stopPropagation()
    close(true)
  } else if (e.key === 'Tab') {
    e.preventDefault()
    close(true)
  }
}
function onDoc(e) {
  if (!open.value || root.value?.contains(e.target) || menu.value?.contains(e.target)) return
  close()
}
onMounted(() => document.addEventListener('pointerdown', onDoc))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDoc))
defineExpose({ toggle, close })
</script>

<template>
  <div ref="root" class="dd">
    <div data-trigger @click="toggle" @keydown.down.prevent="!open && toggle()">
      <slot name="trigger" :open="open" />
    </div>
    <!-- Teleported: a transformed / backdrop-filtered ancestor would otherwise re-anchor position: fixed -->
    <Teleport to="body">
      <Transition name="pop">
        <div v-if="open" ref="menu" class="dd__menu" :style="{ ...floating.style.value, width: width + 'px', minWidth: 0 }" role="menu" :aria-label="label" @keydown="onMenuKey">
          <slot name="header" />
          <template v-for="(item, i) in items" :key="i">
            <div v-if="item.divider" class="dd__divider" role="separator" />
            <button
              v-else
              type="button"
              role="menuitem"
              class="dd__item"
              :class="item.tone ? `is-${item.tone}` : ''"
              @click="run(item)"
            >
              <AppIcon v-if="item.icon" :name="item.icon" :size="18" />
              <span class="dd__label">{{ item.label }}</span>
              <span v-if="item.hint" class="dd__hint">{{ item.hint }}</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.dd { position: relative; }
[data-trigger] { display: inline-flex; }
.dd__menu {
  position: fixed;
  z-index: calc(var(--z-modal) + 5);
  overflow-y: auto;
  padding: 6px;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-3);
}
.dd__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: var(--text-2);
  font-size: var(--fs-sm);
  text-align: left;
}
.dd__item:hover, .dd__item:focus-visible { background: var(--primary-soft); color: var(--text); outline: none; }
.dd__item.is-danger { color: var(--danger); }
.dd__item.is-danger:hover, .dd__item.is-danger:focus-visible { background: var(--danger-soft); color: var(--danger); }
.dd__label { flex: 1; }
.dd__hint { font-size: var(--fs-xs); color: var(--text-3); }
.dd__divider { height: 1px; background: var(--border); margin: 6px 4px; }
</style>

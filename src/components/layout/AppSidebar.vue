<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import AvatarMenu from './AvatarMenu.vue'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'
import { useNavLinks, isMac } from '@/composables/useNavLinks'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useLayoutStore } from '@/stores/layout'
import { useUiStore } from '@/stores/ui'

const { isDark, toggle } = useTheme()
const { links, isActive } = useNavLinks()
const layout = useLayoutStore()
const ui = useUiStore()
const narrow = useMediaQuery('(max-width: 1023px)')
const collapsed = computed(() => layout.sidebarCollapsed || narrow.value)

// Icon-only mode: a small label flies out next to the hovered / focused item.
const tip = ref(null)
function showTip(e, text) {
  if (!collapsed.value) return
  const r = e.currentTarget.getBoundingClientRect()
  tip.value = { text, top: r.top + r.height / 2 }
}
const hideTip = () => (tip.value = null)
</script>

<template>
  <aside id="app-sidebar" class="side" :class="{ 'is-collapsed': collapsed }" @scroll.capture="hideTip">
    <div class="side__head">
      <RouterLink to="/" class="side__brand" aria-label="Нүүр хуудас" @mouseenter="showTip($event, 'Нүүр хуудас')" @mouseleave="hideTip" @focus="showTip($event, 'Нүүр хуудас')" @blur="hideTip">
        <Transition name="fade" mode="out-in">
          <BrandLogo v-if="collapsed" key="mark" variant="mark" :height="36" />
          <BrandLogo v-else key="full" :height="28" />
        </Transition>
      </RouterLink>
    </div>

    <button type="button" class="side__item side__search" aria-label="Хайх" @click="ui.searchOpen = true" @mouseenter="showTip($event, 'Хайх')" @mouseleave="hideTip" @focus="showTip($event, 'Хайх')" @blur="hideTip">
      <AppIcon name="search" :size="20" />
      <span class="side__label">Хайх</span>
      <kbd class="side__kbd">{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
    </button>

    <nav class="side__nav" aria-label="Үндсэн цэс">
      <RouterLink
        v-for="l in links"
        :key="l.to"
        :to="l.to"
        class="side__item side__link"
        :class="{ 'is-active': isActive(l) }"
        :aria-current="isActive(l) ? 'page' : undefined"
        :aria-label="collapsed ? l.label : undefined"
        @mouseenter="showTip($event, l.label)"
        @mouseleave="hideTip"
        @focus="showTip($event, l.label)"
        @blur="hideTip"
        @click="hideTip"
      >
        <AppIcon :name="l.icon" :size="20" />
        <span class="side__label">{{ l.label }}</span>
      </RouterLink>
    </nav>

    <div class="side__foot">
      <div class="side__tools">
        <IconButton :icon="isDark ? 'sun' : 'moon'" :label="isDark ? 'Light горим' : 'Dark горим'" @click="toggle" />
        <IconButton icon="palette" label="Өнгө тохируулах" :active="ui.customizerOpen" @click="ui.customizerOpen = true" />
        <button
          v-if="!narrow"
          type="button"
          class="side__collapse"
          :aria-label="collapsed ? 'Цэсийг дэлгэх' : 'Цэсийг хураах'"
          :title="collapsed ? 'Цэсийг дэлгэх' : 'Цэсийг хураах'"
          aria-controls="app-sidebar"
          :aria-expanded="!collapsed"
          @click="layout.toggleSidebar(); hideTip()"
        >
          <AppIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" :size="18" />
        </button>
      </div>
      <div class="side__user">
        <AvatarMenu :variant="collapsed ? 'bare' : 'row'" align="left" />
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <span v-if="tip && collapsed" class="side-tip" :style="{ top: tip.top + 'px' }" role="presentation">{{ tip.text }}</span>
      </Transition>
    </Teleport>
  </aside>
</template>

<style scoped>
.side {
  --pad: 12px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--z-nav);
  width: var(--nav-left);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: var(--space-3);
  background: var(--surface);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow-1);
  transition: width var(--dur-nav) var(--ease-out);
}

.side__head { flex: none; height: var(--nav-h); display: flex; align-items: center; padding-left: 20px; overflow: hidden; }
.side__brand { display: flex; align-items: center; border-radius: 8px; }
.side__brand:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }

/* Every row keeps its icon at the same x so collapsing only hides the labels. */
.side__item {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 42px;
  margin: 0 var(--pad);
  padding-left: calc((var(--sidebar-w-collapsed) - 2 * var(--pad) - 20px) / 2);
  padding-right: 10px;
  border-radius: 10px;
  color: var(--text-2);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  text-align: left;
  text-decoration: none !important;
  white-space: nowrap;
  overflow: hidden;
  transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.side__item .icon { color: var(--text-3); transition: color var(--dur-fast) var(--ease-out); }
.side__item:hover { background: var(--surface-hover); color: var(--text); }
.side__item:hover .icon { color: var(--text-2); }
.side__item:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--focus-ring); }
.side__label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; transition: opacity var(--dur-nav) var(--ease-out); }
.side__kbd { transition: opacity var(--dur-nav) var(--ease-out); }
.is-collapsed .side__label,
.is-collapsed .side__kbd { opacity: 0; }

.side__search { margin-bottom: var(--space-3); border: 1px solid var(--border); background: var(--surface-2); color: var(--text-3); font-size: var(--fs-sm); font-weight: var(--fw-regular); }
.side__search:hover { border-color: var(--border-strong); background: var(--surface-2); }
.is-collapsed .side__search { border-color: transparent; background: transparent; }

.side__nav { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; }
.side__link.is-active { background: var(--primary-soft); color: var(--text); }
.side__link.is-active .icon { color: var(--primary); }
/* Accent marker on the sidebar edge */
.side__link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  bottom: 11px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: scaleY(0);
  transition: transform 320ms var(--ease-out);
}
.side__link:hover::before { transform: scaleY(0.4); }
.side__link.is-active::before { transform: scaleY(1); }

.side__foot { flex: none; display: flex; flex-direction: column; gap: var(--space-2); padding-top: var(--space-3); margin: 0 var(--pad); border-top: 1px solid var(--border); }
.side__tools { display: flex; align-items: center; gap: 2px; padding-left: calc((var(--sidebar-w-collapsed) - 2 * var(--pad) - 40px) / 2); }
.is-collapsed .side__tools { flex-direction: column; align-items: flex-start; }
.side__collapse {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--text-3);
  border: 1px solid var(--border);
  transition: background-color var(--dur-fast), color var(--dur-fast);
}
.side__collapse:hover { background: var(--primary-soft); color: var(--primary); }
.side__collapse:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.is-collapsed .side__collapse { margin-left: 4px; }

.side__user :deep(.dd),
.side__user :deep([data-trigger]) { width: 100%; }
.is-collapsed .side__user { padding-left: calc((var(--sidebar-w-collapsed) - 2 * var(--pad) - 40px) / 2); }

/* Layout switch (AppShell) — slides in from the left edge */
.side.navswap-enter-active,
.side.navswap-leave-active { transition: transform var(--dur-nav) var(--ease-out), opacity var(--dur-nav) var(--ease-out); }
.side.navswap-enter-from,
.side.navswap-leave-to { transform: translateX(-100%); opacity: 0; }

@media (max-height: 560px) {
  .side__search { margin-bottom: 0; }
  .side__item { height: 38px; }
}
</style>

<style>
/* Teleported tooltip for the icon-only sidebar */
.side-tip {
  position: fixed;
  left: calc(var(--nav-left) + 8px);
  z-index: calc(var(--z-nav) + 2);
  transform: translateY(-50%);
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--text);
  color: var(--bg);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  white-space: nowrap;
  pointer-events: none;
  box-shadow: var(--shadow-2);
}
</style>

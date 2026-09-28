<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import AvatarMenu from './AvatarMenu.vue'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { useTheme } from '@/composables/useTheme'
import { useNavLinks, isMac } from '@/composables/useNavLinks'
import { useUiStore } from '@/stores/ui'

const { isDark, toggle } = useTheme()
const { links, isActive } = useNavLinks()
const ui = useUiStore()

// Phones: search / theme / colours fold into one menu so the five links keep their room.
const moreItems = computed(() => [
  { label: 'Хайх', icon: 'search', action: () => (ui.searchOpen = true) },
  { label: isDark.value ? 'Light горим' : 'Dark горим', icon: isDark.value ? 'sun' : 'moon', action: toggle },
  { label: 'Өнгө тохируулах', icon: 'palette', action: () => (ui.customizerOpen = true) },
])
</script>

<template>
  <div class="foot">
    <div class="foot__inner">
      <RouterLink to="/" class="foot__brand" aria-label="Нүүр хуудас">
        <BrandLogo class="foot__logo" :height="28" />
        <BrandLogo class="foot__mark" variant="mark" :height="34" />
      </RouterLink>

      <nav class="foot__nav" aria-label="Үндсэн цэс">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="foot__link" :class="{ 'is-active': isActive(l) }" :aria-current="isActive(l) ? 'page' : undefined" :title="l.label">
          <AppIcon :name="l.icon" :size="22" />
          <span class="foot__label">{{ l.short }}</span>
        </RouterLink>
      </nav>

      <div class="foot__tools">
        <button type="button" class="foot__search" aria-label="Хайх" @click="ui.searchOpen = true">
          <AppIcon name="search" :size="18" />
          <span class="foot__search-text">Хайх</span>
          <kbd>{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
        </button>
        <IconButton class="foot__wide foot__search-icon" icon="search" label="Хайх" @click="ui.searchOpen = true" />
        <IconButton class="foot__wide" :icon="isDark ? 'sun' : 'moon'" :label="isDark ? 'Light горим' : 'Dark горим'" @click="toggle" />
        <IconButton class="foot__wide" icon="palette" label="Өнгө тохируулах" :active="ui.customizerOpen" @click="ui.customizerOpen = true" />
        <DropdownMenu class="foot__more" :items="moreItems" align="right" :width="220" label="Бусад">
          <template #trigger="{ open }">
            <IconButton icon="more" label="Бусад" :active="open" />
          </template>
        </DropdownMenu>
        <AvatarMenu class="foot__user" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-nav);
  height: var(--nav-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--nav-bg);
  -webkit-backdrop-filter: saturate(1.3) blur(12px);
  backdrop-filter: saturate(1.3) blur(12px);
  border-top: 1px solid var(--border);
  box-shadow: 0 -6px 20px -16px rgba(19, 36, 58, 0.35);
}
.foot__inner {
  height: var(--footbar-h);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-4);
  padding-inline: var(--page-x);
}

.foot__brand { justify-self: start; display: flex; align-items: center; border-radius: 8px; }
.foot__brand:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.foot__mark { display: none; }

.foot__nav { height: 100%; display: flex; align-items: stretch; gap: 4px; }
.foot__link {
  position: relative;
  min-width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 10px;
  color: var(--text-2);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  text-decoration: none !important;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-out);
}
.foot__link .icon { color: var(--text-3); transition: color var(--dur-fast) var(--ease-out), transform var(--dur-base) var(--ease-out); }
.foot__link:hover { color: var(--text); }
.foot__link:hover .icon { color: var(--text-2); transform: translateY(-1px); }
.foot__link.is-active { color: var(--text); }
.foot__link.is-active .icon { color: var(--primary); }
.foot__link:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--focus-ring); border-radius: 10px; }
.foot__label { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
/* Accent marker on the bar's top edge */
.foot__link::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 24px;
  right: 24px;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: scaleX(0);
  transition: transform 320ms var(--ease-out);
}
.foot__link:hover::before { transform: scaleX(0.3); }
.foot__link.is-active::before { transform: scaleX(1); }

.foot__tools { justify-self: end; display: flex; align-items: center; gap: 4px; }
.foot__search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 8px 0 12px;
  margin-right: 6px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-3);
  font-size: var(--fs-sm);
  min-width: 150px;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.foot__search:hover { border-color: var(--border-strong); color: var(--text-2); }
.foot__search:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.foot__search-text { flex: 1; text-align: left; }
.foot__search-icon { display: none; }
.foot__more { display: none; }
.foot__user { margin-left: 8px; }

/* Layout switch (AppShell) — rises from the bottom edge */
.foot.navswap-enter-active,
.foot.navswap-leave-active { transition: transform var(--dur-nav) var(--ease-out), opacity var(--dur-nav) var(--ease-out); }
.foot.navswap-enter-from,
.foot.navswap-leave-to { transform: translateY(100%); opacity: 0; }

@media (max-width: 1439px) {
  .foot__search { display: none; }
  .foot__search-icon { display: inline-grid; }
}
@media (max-width: 1199px) {
  .foot__logo { display: none; }
  .foot__mark { display: block; }
  .foot__link { min-width: 76px; }
}
@media (max-width: 767px) {
  .foot__inner { grid-template-columns: minmax(0, 1fr) auto; gap: 4px; padding-inline: 4px 8px; }
  .foot__brand, .foot__wide { display: none; }
  .foot__more { display: block; }
  .foot__nav { gap: 0; }
  .foot__link { min-width: 0; flex: 1; padding: 0 2px; font-size: 11px; }
  .foot__link::before { left: 12px; right: 12px; }
  .foot__user { margin-left: 2px; }
}
</style>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import AvatarMenu from './AvatarMenu.vue'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { useScrolled } from '@/composables/useScrolled'
import { useTheme } from '@/composables/useTheme'
import { useNavLinks, isMac } from '@/composables/useNavLinks'
import { useUiStore } from '@/stores/ui'

const scrolled = useScrolled(12)
const { isDark, toggle } = useTheme()
const { links, isActive } = useNavLinks()
const ui = useUiStore()

const compactItems = computed(() => links.value.map((l) => ({ label: l.label, icon: l.icon, to: l.to })))
</script>

<template>
  <header class="nav" :class="{ 'is-condensed': scrolled }">
    <div class="container nav__inner">
      <RouterLink to="/" class="nav__brand" aria-label="Нүүр хуудас">
        <BrandLogo :height="scrolled ? 28 : 32" />
      </RouterLink>

      <nav class="nav__links" aria-label="Үндсэн цэс">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="nav__link" :class="{ 'is-active': isActive(l) }" :aria-current="isActive(l) ? 'page' : undefined">
          <AppIcon :name="l.icon" :size="18" class="nav__link-icon" />
          {{ l.label }}
        </RouterLink>
      </nav>

      <div class="nav__tools">
        <DropdownMenu class="nav__compact" :items="compactItems" align="right" :width="240" label="Модулиуд">
          <template #trigger="{ open }">
            <IconButton icon="menu" label="Модулиуд" :active="open" />
          </template>
        </DropdownMenu>

        <button type="button" class="nav__search" aria-label="Хайх" @click="ui.searchOpen = true">
          <AppIcon name="search" :size="18" />
          <span class="nav__search-text">Хайх</span>
          <kbd class="nav__kbd">{{ isMac ? '⌘' : 'Ctrl' }} K</kbd>
        </button>
        <IconButton class="nav__search-icon" icon="search" label="Хайх" @click="ui.searchOpen = true" />
        <IconButton :icon="isDark ? 'sun' : 'moon'" :label="isDark ? 'Light горим' : 'Dark горим'" @click="toggle" />
        <IconButton icon="palette" label="Өнгө тохируулах" :active="ui.customizerOpen" @click="ui.customizerOpen = true" />
        <AvatarMenu />
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-nav);
  height: var(--nav-h);
  background: var(--bg);
  border-bottom: 1px solid transparent;
  transition:
    height var(--dur-base) var(--ease-out),
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
}
.nav.is-condensed {
  height: var(--nav-h-condensed);
  background: var(--nav-bg);
  -webkit-backdrop-filter: saturate(1.3) blur(12px);
  backdrop-filter: saturate(1.3) blur(12px);
  border-bottom-color: var(--border);
  box-shadow: 0 6px 20px -16px rgba(19, 36, 58, 0.35);
}
.nav__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
.nav__brand { display: flex; align-items: center; flex: none; border-radius: 6px; }
.nav__brand :deep(.logo) { transition: height var(--dur-base) var(--ease-out); }

.nav__links {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 4px;
}
.nav__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  color: var(--text-2);
  font-weight: var(--fw-medium);
  font-size: var(--fs-base);
  text-decoration: none !important;
  white-space: nowrap;
  transition: color var(--dur-fast) var(--ease-out);
}
.nav__link::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -1px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: scaleX(0);
  transition: transform 320ms var(--ease-out);
}
.nav__link-icon { color: var(--text-3); transition: color var(--dur-fast) var(--ease-out); }
.nav__link:hover { color: var(--text); }
.nav__link.is-active .nav__link-icon { color: var(--primary); }
.nav__link:hover::after { transform: scaleX(0.3); }
.nav__link.is-active { color: var(--text); }
.nav__link.is-active::after { transform: scaleX(1); }
.nav__link:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--focus-ring); border-radius: 8px; }

.nav__tools { display: flex; align-items: center; gap: 4px; flex: none; }
.nav__compact { display: none; }
.nav__search {
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
  min-width: 168px;
  transition: border-color var(--dur-fast), color var(--dur-fast);
}
.nav__search:hover { border-color: var(--border-strong); color: var(--text-2); }
.nav__search:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.nav__search-text { flex: 1; text-align: left; }
.nav__search-icon { display: none; }
.nav__tools > :last-child { margin-left: 8px; }

/* Layout switch (AppShell) — slides in from the top edge */
.nav.navswap-enter-active,
.nav.navswap-leave-active { transition: transform var(--dur-nav) var(--ease-out), opacity var(--dur-nav) var(--ease-out); }
.nav.navswap-enter-from,
.nav.navswap-leave-to { transform: translateY(-100%); opacity: 0; }

@media (max-width: 1279px) {
  .nav__inner { gap: var(--space-4); }
  .nav__link-icon { display: none; }
  .nav__link { padding: 0 10px; }
  .nav__link::after { left: 10px; right: 10px; }
  .nav__search { display: none; }
  .nav__search-icon { display: inline-grid; }
}
@media (max-width: 1023px) {
  .nav__links { display: none; }
  .nav__compact { display: block; }
  .nav__brand { margin-right: auto; }
}
</style>

<script setup>
import { computed } from 'vue'
import AppNavbar from './AppNavbar.vue'
import AppSidebar from './AppSidebar.vue'
import AppFootbar from './AppFootbar.vue'
import AppDropnav from './AppDropnav.vue'
import SearchOverlay from './SearchOverlay.vue'
import ThemeCustomizer from '@/components/theme/ThemeCustomizer.vue'
import { useLayoutStore } from '@/stores/layout'

const layout = useLayoutStore()
const NAVS = { top: AppNavbar, side: AppSidebar, bottom: AppFootbar, dropdown: AppDropnav }
const nav = computed(() => NAVS[layout.nav] ?? AppNavbar)
</script>

<template>
  <a href="#main" class="skip">Үндсэн агуулга руу шилжих</a>
  <!-- Old and new nav animate together (300ms) while the page padding follows the tokens -->
  <Transition name="navswap">
    <component :is="nav" :key="layout.nav" />
  </Transition>
  <main id="main" class="shell__main" tabindex="-1">
    <slot />
  </main>
  <SearchOverlay />
  <ThemeCustomizer />
</template>

<style scoped>
.shell__main {
  display: block;
  min-height: 100vh;
  min-height: 100dvh;
  padding-left: var(--nav-left);
  outline: none;
  transition: padding-left var(--dur-nav) var(--ease-out);
}
.skip {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: calc(var(--z-nav) + 5);
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--primary);
  color: var(--on-primary);
  transform: translateY(-150%);
  transition: transform var(--dur-base);
}
.skip:focus { transform: none; }
</style>

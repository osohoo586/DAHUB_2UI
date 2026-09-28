<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BrandLogo from './BrandLogo.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useScrolled } from '@/composables/useScrolled'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useNavLinks, isMac } from '@/composables/useNavLinks'
import { useUserMenu } from '@/composables/useUserMenu'
import { useUiStore } from '@/stores/ui'

const route = useRoute()
const scrolled = useScrolled(12)
const { isDark, toggle } = useTheme()
const { can } = useAuth()
const { links, isActive, current } = useNavLinks()
const { user, roleLabel, logout } = useUserMenu()
const ui = useUiStore()

// Where am I: the module name, or the page title for pages outside the main menu (profile, members…)
const whereLabel = computed(() => current.value?.label ?? route.meta.title ?? '')

const open = ref(false)
const root = ref(null)
const trigger = ref(null)
const panel = ref(null)

const items = () => [...(panel.value?.querySelectorAll('[role="menuitem"]') ?? [])]

async function show(focus = 'first') {
  open.value = true
  await nextTick()
  const list = items()
  ;(focus === 'last' ? list[list.length - 1] : list[0])?.focus()
}
function close(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) trigger.value?.focus()
}
function toggleOpen() {
  open.value ? close() : show()
}
/** Actions that open another layer (search, customizer) close the menu first so focus returns to the trigger. */
function then(fn) {
  close()
  fn()
}
async function signOut() {
  close(false)
  await logout()
}

function onPanelKey(e) {
  const list = items()
  const i = list.indexOf(document.activeElement)
  const move = (to) => {
    e.preventDefault()
    list[(to + list.length) % list.length]?.focus()
  }
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return move(i + 1)
    case 'ArrowUp':
    case 'ArrowLeft':
      return move(i - 1)
    case 'Home':
      return move(0)
    case 'End':
      return move(list.length - 1)
    case 'Tab':
      e.preventDefault()
      return close()
  }
}
function onKey(e) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation()
    close()
  }
}
function onFocusOut(e) {
  if (open.value && e.relatedTarget && !root.value?.contains(e.relatedTarget)) close(false)
}
function onDoc(e) {
  // The overlay handles its own clicks; this catches the rest of the header (e.g. the logo).
  if (open.value && !root.value?.contains(e.target) && !e.target.closest?.('.dn-overlay')) close(false)
}

watch(() => route.fullPath, () => close(false))
watch(open, (on) => (on ? document.addEventListener('keydown', onKey) : document.removeEventListener('keydown', onKey)))
onMounted(() => document.addEventListener('pointerdown', onDoc))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDoc)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <header class="dn" :class="{ 'is-condensed': scrolled, 'is-raised': scrolled || open }">
    <div ref="root" class="container dn__inner" @focusout="onFocusOut">
      <RouterLink to="/" class="dn__brand" aria-label="Нүүр хуудас">
        <BrandLogo class="dn__logo" :height="scrolled ? 28 : 32" />
        <BrandLogo class="dn__mark" variant="mark" :height="32" />
      </RouterLink>

      <div class="dn__right">
        <p v-if="whereLabel" class="dn__where">
          <span class="sr-only">Одоогийн хуудас:</span>
          <AppIcon v-if="current" :name="current.icon" :size="16" class="dn__where-icon" />
          <span class="dn__where-text">{{ whereLabel }}</span>
        </p>
        <button
          id="dn-trigger"
          ref="trigger"
          type="button"
          class="dn__trigger"
          :class="{ 'is-open': open }"
          aria-haspopup="menu"
          :aria-expanded="open"
          aria-controls="dn-panel"
          @click="toggleOpen"
          @keydown.down.prevent="show('first')"
          @keydown.up.prevent="show('last')"
        >
          <span class="dn__burger" aria-hidden="true"><span /><span /><span /></span>
          <span class="dn__trigger-text">Цэс</span>
        </button>
      </div>

      <Transition name="drop">
        <div v-if="open" id="dn-panel" ref="panel" class="dn__panel" role="menu" aria-labelledby="dn-trigger" @keydown="onPanelKey">
          <RouterLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            role="menuitem"
            tabindex="-1"
            class="dn__row"
            :class="{ 'is-active': isActive(l) }"
            :aria-current="isActive(l) ? 'page' : undefined"
            @click="close()"
          >
            <span class="dn__row-icon"><AppIcon :name="l.icon" :size="20" /></span>
            <span class="dn__row-text">
              <span class="dn__row-label">{{ l.label }}</span>
              <span class="dn__row-desc">{{ l.desc }}</span>
            </span>
            <AppIcon :name="isActive(l) ? 'check' : 'arrow-right'" :size="16" class="dn__row-end" />
          </RouterLink>

          <div class="dn__divider" role="separator" />

          <div class="dn__account" role="group" aria-label="Хэрэглэгч">
            <RouterLink to="/profile" role="menuitem" tabindex="-1" class="dn__user" @click="close()">
              <Avatar :member="user" size="md" />
              <span class="dn__user-text">
                <span class="dn__user-name">{{ user?.lastName?.[0] }}. {{ user?.firstName }}</span>
                <span class="dn__user-role">{{ roleLabel }}</span>
              </span>
              <AppIcon name="chevron-right" :size="16" class="dn__row-end" />
            </RouterLink>

            <RouterLink v-if="can('members')" to="/members" role="menuitem" tabindex="-1" class="dn__item" @click="close()">
              <AppIcon name="key" :size="18" />Гишүүд ба эрх
            </RouterLink>

            <div class="dn__tools" role="none">
              <button type="button" role="menuitem" tabindex="-1" class="dn__tool" @click="toggle">
                <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />{{ isDark ? 'Light горим' : 'Dark горим' }}
              </button>
              <button type="button" role="menuitem" tabindex="-1" class="dn__tool" @click="then(() => (ui.customizerOpen = true))">
                <AppIcon name="palette" :size="18" />Өнгө тохируулах
              </button>
              <button type="button" role="menuitem" tabindex="-1" class="dn__tool dn__tool--icon" :aria-label="`Хайх (${isMac ? '⌘' : 'Ctrl'} K)`" :title="`Хайх · ${isMac ? '⌘' : 'Ctrl'} K`" @click="then(() => (ui.searchOpen = true))">
                <AppIcon name="search" :size="18" />
              </button>
            </div>

            <button type="button" role="menuitem" tabindex="-1" class="dn__item is-danger" @click="signOut">
              <AppIcon name="log-out" :size="18" />Гарах
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Dims the page under the open menu; teleported so the header's backdrop-filter can't re-anchor it -->
    <Teleport to="body">
      <Transition name="dn-fade">
        <div v-if="open" class="dn-overlay" aria-hidden="true" @click="close()" />
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.dn {
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
.dn.is-condensed { height: var(--nav-h-condensed); }
.dn.is-raised {
  background: var(--nav-bg);
  -webkit-backdrop-filter: saturate(1.3) blur(12px);
  backdrop-filter: saturate(1.3) blur(12px);
  border-bottom-color: var(--border);
  box-shadow: 0 6px 20px -16px rgba(19, 36, 58, 0.35);
}
.dn__inner { position: relative; height: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-6); }
.dn__brand { display: flex; align-items: center; flex: none; border-radius: 6px; }
.dn__brand:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.dn__brand :deep(.logo) { transition: height var(--dur-base) var(--ease-out); }
.dn__mark { display: none; }

.dn__right { display: flex; align-items: center; gap: var(--space-4); min-width: 0; }
.dn__where {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding-right: var(--space-4);
  border-right: 1px solid var(--border);
  color: var(--text);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}
.dn__where-icon { color: var(--primary); }
.dn__where-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* The menu button — filled so it reads as the way into the site */
.dn__trigger {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 18px 0 16px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  color: var(--on-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  box-shadow: var(--shadow-1);
  transition: background-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.dn__trigger:hover, .dn__trigger.is-open { background: var(--primary-hover); box-shadow: var(--shadow-2); }
.dn__trigger:active { transform: translateY(1px); }
.dn__trigger:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.dn__burger { position: relative; width: 16px; height: 12px; }
.dn__burger span {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1.75px;
  border-radius: 2px;
  background: currentColor;
  transition: transform var(--dur-base) var(--ease-out), opacity var(--dur-fast);
}
.dn__burger span:nth-child(1) { top: 0; }
.dn__burger span:nth-child(2) { top: 5.1px; }
.dn__burger span:nth-child(3) { bottom: 0; }
.is-open .dn__burger span:nth-child(1) { transform: translateY(5.1px) rotate(45deg); }
.is-open .dn__burger span:nth-child(2) { opacity: 0; }
.is-open .dn__burger span:nth-child(3) { transform: translateY(-5.1px) rotate(-45deg); }

/* ---- Panel ---- */
.dn__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: var(--page-x);
  width: 380px;
  max-height: calc(100dvh - var(--nav-h) - 24px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-3);
  transform-origin: top right;
}

.dn__row {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 8px 12px 8px 10px;
  border-radius: var(--radius-md);
  color: var(--text);
  text-decoration: none !important;
  transition: background-color var(--dur-fast) var(--ease-out);
}
.dn__row-icon {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-2);
  transition: background-color var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
}
.dn__row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.dn__row-label { font-size: var(--fs-base); font-weight: var(--fw-medium); line-height: 1.3; }
.dn__row-desc { font-size: var(--fs-xs); color: var(--text-3); line-height: 1.35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dn__row-end { flex: none; color: var(--text-3); opacity: 0; transform: translateX(-4px); transition: opacity var(--dur-fast), transform var(--dur-base) var(--ease-out); }

.dn__row:hover, .dn__row:focus-visible { background: var(--surface-hover); outline: none; }
.dn__row:focus-visible { box-shadow: inset 0 0 0 2px var(--focus-ring); }
.dn__row:hover .dn__row-end, .dn__row:focus-visible .dn__row-end { opacity: 1; transform: none; }
.dn__row:hover .dn__row-icon { color: var(--primary); }

/* Active page: tinted row, filled icon, thin yellow line on the left */
.dn__row.is-active { background: var(--primary-soft); }
.dn__row.is-active .dn__row-label { font-weight: var(--fw-semibold); }
.dn__row.is-active .dn__row-icon { background: var(--primary); border-color: transparent; color: var(--on-primary); }
.dn__row.is-active .dn__row-end { opacity: 1; transform: none; color: var(--primary); }
.dn__row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
  transform: scaleY(0);
  transition: transform 320ms var(--ease-out);
}
.dn__row.is-active::before { transform: scaleY(1); }

.dn__divider { flex: none; height: 1px; margin: 6px 4px; background: var(--border); }

/* ---- Account block ---- */
.dn__account { display: flex; flex-direction: column; gap: 2px; }
.dn__user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 10px;
  border-radius: var(--radius-md);
  color: var(--text);
  text-decoration: none !important;
  transition: background-color var(--dur-fast);
}
.dn__user-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.dn__user-name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dn__user-role { font-size: var(--fs-xs); color: var(--text-3); }
.dn__user:hover, .dn__user:focus-visible { background: var(--surface-hover); outline: none; }
.dn__user:focus-visible { box-shadow: inset 0 0 0 2px var(--focus-ring); }
.dn__user:hover .dn__row-end, .dn__user:focus-visible .dn__row-end { opacity: 1; transform: none; }

.dn__item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  text-align: left;
  text-decoration: none !important;
  transition: background-color var(--dur-fast), color var(--dur-fast);
}
.dn__item .icon { color: var(--text-3); }
.dn__item:hover, .dn__item:focus-visible { background: var(--surface-hover); color: var(--text); outline: none; }
.dn__item:focus-visible { box-shadow: inset 0 0 0 2px var(--focus-ring); }
.dn__item.is-danger, .dn__item.is-danger .icon { color: var(--danger); }
.dn__item.is-danger:hover, .dn__item.is-danger:focus-visible { background: var(--danger-soft); }

.dn__tools { display: grid; grid-template-columns: 1fr 1fr 40px; gap: 6px; padding: 4px 4px 6px; }
.dn__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  white-space: nowrap;
  transition: border-color var(--dur-fast), color var(--dur-fast), background-color var(--dur-fast);
}
.dn__tool--icon { padding: 0; }
.dn__tool:hover { border-color: var(--border-strong); color: var(--primary); background: var(--primary-soft); }
.dn__tool:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }

/* 200ms: fade + a short slide down from the button */
.drop-enter-active, .drop-leave-active { transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out); }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }

/* Layout switch (AppShell) — slides in from the top edge */
.dn.navswap-enter-active,
.dn.navswap-leave-active { transition: transform var(--dur-nav) var(--ease-out), opacity var(--dur-nav) var(--ease-out); }
.dn.navswap-enter-from,
.dn.navswap-leave-to { transform: translateY(-100%); opacity: 0; }

@media (max-width: 767px) {
  .dn__logo { display: none; }
  .dn__mark { display: block; }
  .dn__right { gap: var(--space-3); }
  .dn__where { padding-right: var(--space-3); }
  .dn__panel { left: var(--page-x); width: auto; }
}
@media (max-width: 400px) {
  .dn__tools { grid-template-columns: 1fr 1fr; }
  .dn__tool--icon { grid-column: 1 / -1; }
}
@media (prefers-reduced-motion: reduce) {
  .drop-enter-active, .drop-leave-active { transition: opacity 1ms; }
}
</style>

<style>
/* Teleported overlay — below the header (z-nav), above the page */
.dn-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-nav) - 1);
  background: color-mix(in srgb, var(--overlay) 70%, transparent);
  -webkit-backdrop-filter: blur(1.5px);
  backdrop-filter: blur(1.5px);
}
.dn-fade-enter-active, .dn-fade-leave-active { transition: opacity 200ms var(--ease-out); }
.dn-fade-enter-from, .dn-fade-leave-to { opacity: 0; }
</style>

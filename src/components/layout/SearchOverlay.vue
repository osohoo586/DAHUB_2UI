<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import Avatar from '@/components/ui/Avatar.vue'
import GSpinner from '@/components/ui/GSpinner.vue'
import SearchEmpty from '@/components/illustrations/SearchEmpty.vue'
import { useUiStore } from '@/stores/ui'
import { useAuth } from '@/composables/useAuth'
import { useHotkey } from '@/composables/useHotkey'
import { useFocusTrap } from '@/composables/useFocusTrap'
import { searchAll } from '@/services/search'
import { categoryLabel } from '@/services/news'

const ui = useUiStore()
const router = useRouter()
const { can } = useAuth()
const q = ref('')
const loading = ref(false)
const results = ref({ pages: [], news: [], members: [], risks: [] })
const active = ref(0)
const panel = ref(null)
const input = ref(null)
const open = computed(() => ui.searchOpen)

useHotkey('mod+k', () => (ui.searchOpen = !ui.searchOpen))
useFocusTrap(panel, open, { initial: 'input' })

let timer = null
let seq = 0
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => run(v), 140)
})
watch(open, async (on) => {
  if (on) {
    q.value = ''
    run('')
    await nextTick()
    input.value?.focus()
  }
})

async function run(v) {
  const my = ++seq
  loading.value = true
  const res = await searchAll(v)
  if (my !== seq) return
  results.value = res
  active.value = 0
  loading.value = false
}

const groups = computed(() => {
  const r = results.value
  const out = []
  const pages = r.pages.filter((p) => !p.module || can(p.module))
  if (pages.length) out.push({ key: 'pages', label: q.value ? 'Хуудас' : 'Хурдан шилжих', items: pages.map((p) => ({ ...p, icon: p.icon })) })
  if (can('news') && r.news.length) out.push({ key: 'news', label: 'Нийтлэл', items: r.news.map((n) => ({ ...n, icon: 'news', meta: categoryLabel(n.meta) })) })
  if (can('members') && r.members.length) out.push({ key: 'members', label: 'Гишүүд', items: r.members })
  if (can('risk') && r.risks.length) out.push({ key: 'risks', label: 'Эрсдэл', items: r.risks.map((x) => ({ ...x, icon: 'risk' })) })
  return out
})
const flat = computed(() => groups.value.flatMap((g) => g.items))
const indexOf = (item) => flat.value.indexOf(item)

function go(item) {
  ui.searchOpen = false
  router.push(item.to)
}
function onKey(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = Math.min(flat.value.length - 1, active.value + 1)
    scrollActive()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = Math.max(0, active.value - 1)
    scrollActive()
  } else if (e.key === 'Enter') {
    const item = flat.value[active.value]
    if (item) go(item)
  } else if (e.key === 'Escape') {
    ui.searchOpen = false
  }
}
function scrollActive() {
  nextTick(() => panel.value?.querySelector('.sr__item.is-active')?.scrollIntoView({ block: 'nearest' }))
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="so" @pointerdown.self="ui.searchOpen = false">
        <div ref="panel" class="modal-panel so__panel" role="dialog" aria-modal="true" aria-label="Хайлт">
          <div class="so__bar">
            <AppIcon name="search" :size="20" class="so__icon" />
            <input
              ref="input"
              v-model="q"
              class="so__input"
              type="text"
              placeholder="Нийтлэл, гишүүн, эрсдэл, хуудас хайх…"
              aria-label="Хайх"
              aria-controls="so-results"
              @keydown="onKey"
            />
            <GSpinner v-if="loading" :size="18" />
            <kbd>Esc</kbd>
          </div>
          <div id="so-results" class="so__results" role="listbox">
            <template v-if="groups.length">
              <section v-for="g in groups" :key="g.key" class="sr__group">
                <h3 class="sr__label">{{ g.label }}</h3>
                <button
                  v-for="item in g.items"
                  :key="item.to + item.title"
                  type="button"
                  role="option"
                  class="sr__item"
                  :class="{ 'is-active': indexOf(item) === active }"
                  :aria-selected="indexOf(item) === active"
                  @pointerenter="active = indexOf(item)"
                  @click="go(item)"
                >
                  <Avatar v-if="item.member" :member="item.member" size="xs" />
                  <span v-else class="sr__icon"><AppIcon :name="item.icon" :size="16" /></span>
                  <span class="sr__title">{{ item.title }}</span>
                  <span v-if="item.meta" class="sr__meta">{{ item.meta }}</span>
                  <AppIcon name="enter" :size="14" class="sr__enter" />
                </button>
              </section>
            </template>
            <div v-else-if="!loading" class="so__empty">
              <SearchEmpty class="so__art" />
              <p class="so__empty-title">«{{ q }}» илэрц олдсонгүй</p>
              <p class="so__empty-desc">Өөр түлхүүр үг, эрсдэлийн код (жишээ нь IT-001) эсвэл ажилтны нэрээр хайна уу.</p>
            </div>
          </div>
          <footer class="so__foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> сонгох</span>
            <span><kbd>Enter</kbd> нээх</span>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.so {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: var(--overlay);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh var(--space-4) var(--space-4);
}
.so__panel {
  width: min(640px, 100%);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-3);
  overflow: hidden;
}
.so__bar { display: flex; align-items: center; gap: 12px; padding: 0 16px; border-bottom: 1px solid var(--border); }
.so__icon { color: var(--text-3); }
.so__input { flex: 1; height: 58px; border: 0; background: transparent; font-size: var(--fs-md); color: var(--text); }
.so__input::placeholder { color: var(--text-3); }
.so__input:focus { outline: none; }
.so__results { overflow-y: auto; padding: 8px; flex: 1; }
.sr__group + .sr__group { margin-top: 8px; }
.sr__label { font-family: var(--font-sans); font-size: 11px; font-weight: var(--fw-semibold); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--text-3); padding: 8px 10px 6px; }
.sr__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 10px;
  border-radius: 8px;
  text-align: left;
  color: var(--text);
}
.sr__item.is-active { background: var(--primary-soft); }
.sr__icon { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 6px; background: var(--surface-2); color: var(--text-3); flex: none; }
.sr__item.is-active .sr__icon { color: var(--primary); background: var(--surface); }
.sr__title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--fs-sm); }
.sr__meta { font-size: var(--fs-xs); color: var(--text-3); white-space: nowrap; max-width: 40%; overflow: hidden; text-overflow: ellipsis; }
.sr__enter { color: var(--text-3); opacity: 0; }
.sr__item.is-active .sr__enter { opacity: 1; }
.so__empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px 16px 40px; gap: 6px; }
.so__art { width: 112px; margin-bottom: 8px; }
.so__empty-title { font-weight: var(--fw-semibold); }
.so__empty-desc { font-size: var(--fs-sm); color: var(--text-3); max-width: 380px; }
.so__foot { display: flex; gap: 18px; padding: 10px 16px; border-top: 1px solid var(--border); background: var(--surface-2); font-size: var(--fs-xs); color: var(--text-3); }
.so__foot kbd { margin-right: 4px; }
</style>

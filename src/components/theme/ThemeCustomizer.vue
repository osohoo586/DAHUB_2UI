<script setup>
import { ref, computed } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ColorPicker from './ColorPicker.vue'
import ContrastBadge from './ContrastBadge.vue'
import PresetCard from './PresetCard.vue'
import ThemePreview from './ThemePreview.vue'
import NavLayoutPicker from './NavLayoutPicker.vue'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { BASE_TOKENS, contrastChecks } from '@/utils/color'

const theme = useThemeStore()
const ui = useUiStore()
const toast = useToast()

const expanded = ref('primary')
const bothModes = ref(true)
const confirmClose = ref(false)

const mode = computed({
  get: () => theme.resolved,
  set: (m) => theme.setMode(m),
})
const modeLabel = computed(() => (theme.resolved === 'dark' ? 'Dark' : 'Light'))
const base = computed(() => theme.base(theme.resolved))
const checks = computed(() => contrastChecks(base.value))
const failing = computed(() => checks.value.filter((c) => c.ratio < 4.5))
const dirty = computed(() => theme.isDirty('light') || theme.isDirty('dark'))

function requestClose() {
  if (dirty.value) confirmClose.value = true
  else ui.customizerOpen = false
}
function save() {
  theme.save()
  confirmClose.value = false
  toast.success('Өнгөний тохиргоо хадгалагдлаа', `${modeLabel.value} горимд хэрэглэгдэнэ.`)
}
function discardAndClose() {
  theme.revert()
  confirmClose.value = false
  ui.customizerOpen = false
}
function saveAndClose() {
  save()
  ui.customizerOpen = false
}
function reset() {
  theme.resetMode()
  toast.info('Анхны төлөвт буцаалаа', `${modeLabel.value} горим «Голомт стандарт» болов.`)
}
function toggle(key) {
  expanded.value = expanded.value === key ? '' : key
}
</script>

<template>
  <BaseDrawer
    :open="ui.customizerOpen"
    title="Өнгө тохируулах"
    :subtitle="`${modeLabel} горимын тохиргоо · горим бүр тусдаа хадгалагдана`"
    :width="408"
    @request-close="requestClose"
  >
    <div class="tc">
      <SegmentedControl v-model="mode" :options="[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]" label="Засах горим" block />

      <section class="tc__section">
        <h3 class="tc__h">Навигаци</h3>
        <NavLayoutPicker />
      </section>

      <section class="tc__section">
        <div class="tc__head">
          <h3 class="tc__h">Бэлэн palette</h3>
          <Checkbox v-model="bothModes" label="Хоёр горимд" />
        </div>
        <div class="tc__presets">
          <PresetCard
            v-for="p in theme.presets"
            :key="p.id"
            :preset="p"
            :mode="theme.resolved"
            :active="theme.activePresetId === p.id"
            @apply="theme.applyPreset(p, bothModes)"
          />
        </div>
      </section>

      <section class="tc__section">
        <h3 class="tc__h">Token-ууд</h3>
        <ul class="tc__tokens">
          <li v-for="t in BASE_TOKENS" :key="t.key" class="tok" :class="{ 'is-open': expanded === t.key }">
            <button type="button" class="tok__row" :aria-expanded="expanded === t.key" @click="toggle(t.key)">
              <span class="tok__sw" :style="{ background: base[t.key] }" />
              <span class="tok__text">
                <span class="tok__label">{{ t.label }}</span>
                <span class="tok__hint">{{ t.hint }}</span>
              </span>
              <span class="tok__hex">{{ base[t.key].toUpperCase() }}</span>
              <AppIcon name="chevron-down" :size="16" class="tok__chev" />
            </button>
            <div v-if="expanded === t.key" class="tok__body">
              <ColorPicker :model-value="base[t.key]" @update:model-value="theme.setToken(t.key, $event)" />
            </div>
          </li>
        </ul>
      </section>

      <section class="tc__section">
        <h3 class="tc__h">Contrast (WCAG)</h3>
        <div class="tc__checks">
          <ContrastBadge v-for="c in checks" :key="c.key" v-bind="c" />
        </div>
        <p v-if="failing.length" class="tc__warn">
          <AppIcon name="alert" :size="16" />
          {{ failing.map((f) => f.label).join(', ') }} — 4.5:1-ээс бага тул уншихад хүндрэлтэй. Текстийг бараан эсвэл дэвсгэрийг цайвар болгоно уу.
        </p>
      </section>

      <section class="tc__section">
        <h3 class="tc__h">Урьдчилсан харагдац</h3>
        <ThemePreview />
      </section>
    </div>

    <template #footer>
      <div v-if="confirmClose" class="tc__confirm" role="alert">
        <p><AppIcon name="info" :size="16" />Хадгалаагүй өөрчлөлт байна.</p>
        <div class="tc__confirm-actions">
          <BaseButton variant="ghost" size="sm" @click="discardAndClose">Буцааж хаах</BaseButton>
          <BaseButton size="sm" icon="save" @click="saveAndClose">Хадгалж хаах</BaseButton>
        </div>
      </div>
      <div v-else class="tc__foot">
        <BaseButton variant="ghost" size="sm" icon="reset" :disabled="!theme.isCustom()" @click="reset">Анхны төлөвт буцаах</BaseButton>
        <BaseButton size="sm" icon="save" :disabled="!dirty" @click="save">Хадгалах</BaseButton>
      </div>
    </template>
  </BaseDrawer>
</template>

<style scoped>
.tc { display: flex; flex-direction: column; gap: var(--space-6); }
.tc__section { display: flex; flex-direction: column; gap: var(--space-3); }
.tc__head { display: flex; align-items: center; justify-content: space-between; }
.tc__h {
  font-family: var(--font-sans);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--text-3);
}
.tc__presets { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tc__tokens { list-style: none; display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.tok + .tok { border-top: 1px solid var(--border); }
.tok__row { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; text-align: left; }
.tok__row:hover { background: var(--surface-hover); }
.tok__row:focus-visible { outline: none; box-shadow: inset 0 0 0 2px var(--focus-ring); }
.tok__sw { width: 28px; height: 28px; border-radius: 8px; flex: none; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12); }
.tok__text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.tok__label { font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.tok__hint { font-size: 11px; color: var(--text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tok__hex { font-family: var(--font-mono); font-size: 11px; color: var(--text-2); }
.tok__chev { color: var(--text-3); transition: transform var(--dur-base) var(--ease-out); }
.tok.is-open .tok__chev { transform: rotate(180deg); }
.tok.is-open { background: var(--surface-2); }
.tok__body { padding: 4px 12px 14px; }
.tc__checks { display: flex; flex-direction: column; gap: 6px; }
.tc__warn { display: flex; gap: 8px; font-size: var(--fs-xs); color: var(--danger); line-height: 1.5; }
.tc__warn .icon { flex: none; margin-top: 1px; }
.tc__foot { display: flex; justify-content: space-between; gap: 8px; }
.tc__confirm { display: flex; flex-direction: column; gap: 10px; }
.tc__confirm p { display: flex; align-items: center; gap: 8px; font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.tc__confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>

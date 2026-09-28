<script setup>
import { computed } from 'vue'
import SwitchToggle from '@/components/ui/SwitchToggle.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { usePermissionsStore } from '@/stores/permissions'

const props = defineProps({
  editable: { type: Boolean, default: false },
  memberCounts: { type: Object, default: () => ({}) },
  currentRole: { type: String, default: '' },
})
const emit = defineEmits(['change'])
const perms = usePermissionsStore()
const ACTIONS = ['view', 'edit', 'delete']
const has = (module, action) => module.actions.includes(action)

async function toggle(role, module, action, value) {
  await perms.set(role, module.key, action, value)
  emit('change', { role, module: module.key, action, value })
}
const roles = computed(() => perms.roles)
</script>

<template>
  <div class="pm">
    <table class="pm__table">
      <caption class="sr-only">Role бүрийн модуль тус бүрийн эрх</caption>
      <thead>
        <tr>
          <th scope="col" class="pm__corner">Модуль</th>
          <th v-for="r in roles" :key="r.key" scope="col" class="pm__role" :class="{ 'is-current': r.key === currentRole }">
            <span class="pm__role-name">{{ r.label }}</span>
            <span class="pm__role-desc">{{ r.description }}</span>
            <span class="pm__role-count num">{{ memberCounts[r.key] ?? 0 }} гишүүн<template v-if="r.key === currentRole"> · та</template></span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in perms.modules" :key="m.key">
          <th scope="row" class="pm__module">
            <span class="pm__module-icon"><AppIcon :name="m.icon" :size="16" /></span>{{ m.label }}
          </th>
          <td v-for="r in roles" :key="r.key" class="pm__cell" :class="{ 'is-current': r.key === currentRole }">
            <div class="pm__actions">
              <div v-for="a in ACTIONS" :key="a" class="pm__action" :class="{ 'is-na': !has(m, a) }">
                <template v-if="has(m, a)">
                  <SwitchToggle
                    size="sm"
                    :model-value="perms.can(r.key, m.key, a)"
                    :disabled="!editable || perms.isLocked(r.key, m.key)"
                    :sr-label="`${r.label} — ${m.label} — ${perms.actionLabels[a]}`"
                    @update:model-value="toggle(r.key, m, a, $event)"
                  />
                  <span class="pm__action-label">{{ perms.actionLabels[a] }}</span>
                </template>
                <template v-else>
                  <span class="pm__dash" aria-hidden="true">—</span>
                  <span class="pm__action-label">{{ perms.actionLabels[a] }}</span>
                </template>
              </div>
              <span v-if="perms.isLocked(r.key, m.key)" class="pm__lock" title="Админ өөрийгөө түгжихгүйн тулд энэ эрх үргэлж идэвхтэй"><AppIcon name="lock" :size="13" /></span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.pm { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); }
.pm__table { min-width: 860px; border-collapse: separate; border-spacing: 0; }
.pm__table th, .pm__table td { border-bottom: 1px solid var(--border); }
.pm__table tbody tr:last-child > * { border-bottom: 0; }
.pm__corner { text-align: left; padding: 16px; font-size: var(--fs-xs); color: var(--text-3); font-weight: var(--fw-semibold); background: var(--surface-2); width: 200px; }
.pm__role { text-align: left; padding: 14px 16px; background: var(--surface-2); vertical-align: top; border-left: 1px solid var(--border); }
.pm__role.is-current { background: var(--primary-soft); box-shadow: inset 0 2px 0 var(--accent); }
.pm__role-name { display: block; font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text); }
.pm__role-desc { display: block; font-size: 11px; font-weight: var(--fw-regular); color: var(--text-3); margin-top: 2px; line-height: 1.35; }
.pm__role-count { display: block; font-size: 11px; font-weight: var(--fw-medium); color: var(--text-2); margin-top: 6px; }
.pm__module { text-align: left; padding: 14px 16px; font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text); white-space: nowrap; }
.pm__module-icon { display: inline-grid; place-items: center; width: 28px; height: 28px; margin-right: 10px; border-radius: 8px; background: var(--primary-soft); color: var(--primary); vertical-align: middle; }
.pm__cell { padding: 12px 16px; border-left: 1px solid var(--border); vertical-align: middle; }
.pm__cell.is-current { background: color-mix(in srgb, var(--primary-soft) 45%, transparent); }
.pm__actions { position: relative; display: flex; gap: 14px; }
.pm__action { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 44px; }
.pm__action-label { font-size: 10px; color: var(--text-3); letter-spacing: 0.02em; }
.pm__action.is-na .pm__action-label { opacity: 0.5; }
.pm__dash { height: 18px; line-height: 18px; color: var(--border-strong); }
.pm__lock { position: absolute; right: -6px; top: -6px; color: var(--text-3); }
</style>

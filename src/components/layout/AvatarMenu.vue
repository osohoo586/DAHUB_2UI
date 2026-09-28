<script setup>
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Tag from '@/components/ui/Tag.vue'
import { useUserMenu } from '@/composables/useUserMenu'

defineProps({
  variant: { type: String, default: 'pill' }, // pill (top bar) | row (sidebar, with name) | bare (avatar only)
  align: { type: String, default: 'right' },
})

const { user, roleLabel, items } = useUserMenu()
</script>

<template>
  <DropdownMenu :items="items" :width="272" :align="align" label="Хэрэглэгчийн цэс">
    <template #trigger="{ open }">
      <button type="button" class="am" :class="[`am--${variant}`, { 'is-open': open }]" aria-haspopup="menu" :aria-expanded="open" aria-label="Хэрэглэгчийн цэс">
        <Avatar :member="user" size="sm" />
        <span v-if="variant === 'row'" class="am__text">
          <span class="am__row-name">{{ user?.lastName?.[0] }}. {{ user?.firstName }}</span>
          <span class="am__row-role">{{ roleLabel }}</span>
        </span>
        <AppIcon v-if="variant !== 'bare'" :name="variant === 'row' ? 'chevron-up' : 'chevron-down'" :size="14" class="am__chev" />
      </button>
    </template>
    <template #header>
      <div class="am__head">
        <Avatar :member="user" size="md" />
        <div class="am__who">
          <p class="am__name">{{ user?.lastName?.[0] }}. {{ user?.firstName }}</p>
          <p class="am__pos">{{ user?.position }}</p>
          <Tag tone="primary" size="sm">{{ roleLabel }}</Tag>
        </div>
      </div>
    </template>
  </DropdownMenu>
</template>

<style scoped>
.am {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 3px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
}
.am:hover, .am.is-open { border-color: var(--border-strong); }
.am:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.am__chev { color: var(--text-3); transition: transform var(--dur-base) var(--ease-out); }
.am--row {
  width: 100%;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border-radius: var(--radius-md);
  text-align: left;
  min-width: 0;
  border-color: transparent;
  background: transparent;
}
.am--row:hover, .am--row.is-open { background: var(--surface-hover); border-color: transparent; }
.am__text { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
.am__row-name, .am__row-role { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.am__row-name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text); }
.am__row-role { font-size: var(--fs-xs); color: var(--text-3); }
.am--bare { padding: 3px; }
.am.is-open .am__chev { transform: rotate(180deg); }
.am__head { display: flex; gap: 12px; padding: 10px 10px 14px; margin-bottom: 6px; border-bottom: 1px solid var(--border); }
.am__who { display: flex; flex-direction: column; gap: 3px; min-width: 0; align-items: flex-start; }
.am__name { font-weight: var(--fw-semibold); }
.am__pos { font-size: var(--fs-xs); color: var(--text-3); line-height: 1.35; margin-bottom: 4px; }
</style>

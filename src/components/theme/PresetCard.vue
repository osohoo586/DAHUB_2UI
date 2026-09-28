<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
defineProps({
  preset: { type: Object, required: true },
  mode: { type: String, required: true },
  active: { type: Boolean, default: false },
})
defineEmits(['apply'])
</script>

<template>
  <button type="button" class="pc" :class="{ 'is-active': active }" :aria-pressed="active" @click="$emit('apply')">
    <span class="pc__art" :style="{ background: preset[mode].bg }">
      <span class="pc__hero" :style="{ background: preset[mode].heroFill }" />
      <span class="pc__card" :style="{ background: preset[mode].surface, borderColor: preset[mode].border }">
        <span class="pc__line" :style="{ background: preset[mode].text }" />
        <span class="pc__line short" :style="{ background: preset[mode].text, opacity: 0.4 }" />
        <span class="pc__btn" :style="{ background: preset[mode].primary }" />
        <span class="pc__accent" :style="{ background: preset[mode].accent }" />
      </span>
    </span>
    <span class="pc__name">{{ preset.name }}</span>
    <span class="pc__desc">{{ preset.description }}</span>
    <AppIcon v-if="active" name="check" :size="14" :stroke="2.2" class="pc__check" />
  </button>
</template>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  transition: border-color var(--dur-fast), box-shadow var(--dur-fast), transform var(--dur-base) var(--ease-out);
}
.pc:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.pc:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }
.pc.is-active { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.pc__art { position: relative; height: 64px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06); }
.pc__hero { position: absolute; left: 0; right: 0; top: 0; height: 20px; }
.pc__card { position: absolute; left: 10px; right: 10px; top: 14px; bottom: 8px; border-radius: 6px; border: 1px solid; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
.pc__line { height: 3px; width: 70%; border-radius: 2px; }
.pc__line.short { width: 45%; }
.pc__btn { margin-top: auto; width: 32px; height: 8px; border-radius: 3px; }
.pc__accent { position: absolute; top: -1px; left: 12px; width: 26px; height: 2px; border-radius: 2px; }
.pc__name { font-size: var(--fs-sm); font-weight: var(--fw-semibold); color: var(--text); }
.pc__desc { font-size: 11px; color: var(--text-3); line-height: 1.35; }
.pc__check { position: absolute; top: 12px; right: 12px; color: #fff; background: var(--primary); border-radius: 50%; padding: 2px; width: 18px; height: 18px; }
</style>

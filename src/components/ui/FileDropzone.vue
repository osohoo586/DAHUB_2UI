<script setup>
import { ref } from 'vue'
import UploadEmpty from '@/components/illustrations/UploadEmpty.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  accept: { type: String, default: '.xlsx,.xls,.csv' },
  maxSizeMb: { type: Number, default: 25 },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['file', 'error'])
const over = ref(false)
const input = ref(null)
let depth = 0

function validate(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!props.accept.split(',').includes(ext)) return `Зөвхөн ${props.accept.replaceAll(',', ', ')} өргөтгөлтэй файл уншина.`
  if (file.size > props.maxSizeMb * 1024 * 1024) return `Файлын хэмжээ ${props.maxSizeMb} МБ-аас их байна.`
  return null
}
function take(files) {
  const file = files?.[0]
  if (!file) return
  const err = validate(file)
  if (err) emit('error', err)
  else emit('file', file)
}
function onDrop(e) {
  depth = 0
  over.value = false
  take(e.dataTransfer?.files)
}
function onEnter() {
  depth++
  over.value = true
}
function onLeave() {
  depth = Math.max(0, depth - 1)
  if (!depth) over.value = false
}
</script>

<template>
  <div
    class="dz"
    :class="{ 'is-over': over, 'is-disabled': disabled }"
    role="button"
    tabindex="0"
    aria-label="Excel файл сонгох эсвэл энд чирч оруулах"
    @click="input?.click()"
    @keydown.enter.prevent="input?.click()"
    @keydown.space.prevent="input?.click()"
    @dragenter.prevent="onEnter"
    @dragover.prevent
    @dragleave.prevent="onLeave"
    @drop.prevent="onDrop"
  >
    <input ref="input" type="file" class="sr-only" :accept="accept" tabindex="-1" @change="take($event.target.files); $event.target.value = ''" />
    <UploadEmpty class="dz__art" />
    <p class="dz__title">{{ over ? 'Файлыг энд тавина уу' : 'Excel файлаа энд чирч оруулна уу' }}</p>
    <p class="dz__hint">эсвэл <span class="dz__link">компьютерээс сонгох</span> · .xlsx, .xls, .csv · {{ maxSizeMb }} МБ хүртэл</p>
    <div v-if="$slots.default" class="dz__extra" @click.stop><slot /></div>
  </div>
</template>

<style scoped>
.dz {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: var(--space-10) var(--space-6);
  border-radius: var(--radius-md);
  border: 1.5px dashed var(--border-strong);
  background: var(--surface-2);
  cursor: pointer;
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out);
}
.dz:hover, .dz:focus-visible { border-color: var(--primary); outline: none; }
.dz:focus-visible { box-shadow: 0 0 0 3px var(--focus-ring); }
.dz.is-over { border-color: var(--primary); background: var(--primary-soft); }
.dz__art { width: 120px; margin-bottom: var(--space-3); transition: transform var(--dur-slow) var(--ease-out); }
.dz.is-over .dz__art { transform: translateY(-4px); }
.dz__title { font-weight: var(--fw-semibold); }
.dz__hint { font-size: var(--fs-sm); color: var(--text-3); }
.dz__link { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
.dz__extra { margin-top: var(--space-4); }
</style>

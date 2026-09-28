<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useMembersStore } from '@/stores/members'
import { usePermissionsStore } from '@/stores/permissions'

const props = defineProps({
  open: { type: Boolean, default: false },
  member: { type: Object, default: null }, // null → create
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'save'])
const members = useMembersStore()
const perms = usePermissionsStore()

const form = ref(blank())
const errors = ref({})
function blank() {
  return { lastName: '', firstName: '', position: '', unitId: 'business', role: 'auditor', email: '', phone: '', joinedAt: new Date().toISOString().slice(0, 10), photo: null }
}
watch(
  () => props.open,
  (on) => {
    if (!on) return
    errors.value = {}
    form.value = props.member
      ? { ...props.member, email: `${props.member.latin}@golomtbank.com`, photo: props.member.photo ?? null }
      : blank()
  },
)

const unitOptions = computed(() => members.units.map((u) => ({ value: u.id, label: u.name })))
const roleOptions = computed(() => perms.roles.map((r) => ({ value: r.key, label: r.label, description: r.description })))
const preview = computed(() => ({ ...form.value, id: props.member?.id ?? 'new' }))

function onPhoto(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errors.value = { ...errors.value, photo: 'Зөвхөн зураг файл сонгоно уу.' }
    return
  }
  if (file.size > 1.5 * 1024 * 1024) {
    errors.value = { ...errors.value, photo: 'Зургийн хэмжээ 1.5 МБ-аас бага байна.' }
    return
  }
  const reader = new FileReader()
  reader.onload = () => (form.value.photo = reader.result)
  reader.readAsDataURL(file)
  errors.value = { ...errors.value, photo: '' }
}

function validate() {
  const f = form.value
  const e = {}
  if (!f.lastName.trim()) e.lastName = 'Овгоо оруулна уу.'
  if (!f.firstName.trim()) e.firstName = 'Нэрээ оруулна уу.'
  if (!f.position.trim()) e.position = 'Албан тушаалаа оруулна уу.'
  if (!/^[a-z0-9._-]+@golomtbank\.com$/i.test(f.email.trim())) e.email = '…@golomtbank.com хэлбэрийн дотоод и-мэйл оруулна уу.'
  const phone = f.phone.trim()
  if (phone && phone !== '+976' && !/^\+?[\d\s-]{8,}$/.test(phone)) e.phone = 'Утасны дугаар буруу байна (жишээ: +976 9911 2233).'
  errors.value = e
  return !Object.keys(e).length
}
function submit() {
  if (!validate()) return
  const f = form.value
  const { email, ...rest } = f
  emit('save', { ...rest, lastName: f.lastName.trim(), firstName: f.firstName.trim(), position: f.position.trim(), latin: email.trim().split('@')[0].toLowerCase(), phone: f.phone.trim() === '+976' ? '' : f.phone.trim() })
}
</script>

<template>
  <BaseModal :open="open" :title="member ? 'Гишүүний мэдээлэл засах' : 'Гишүүн нэмэх'" :description="member ? `${member.lastName} ${member.firstName}` : 'Шинэ гишүүн нэмэгдмэгц эрх нь сонгосон role-оор тохирно.'" size="lg" @update:open="emit('update:open', $event)">
    <form class="mf" novalidate @submit.prevent="submit">
      <div class="mf__photo">
        <Avatar :member="preview" size="xl" />
        <div class="mf__photo-actions">
          <label class="mf__upload">
            <input type="file" accept="image/*" class="sr-only" @change="onPhoto" />
            <span>Зураг сонгох</span>
          </label>
          <button v-if="form.photo" type="button" class="mf__remove" @click="form.photo = null">Устгах</button>
          <p class="mf__hint" :class="{ 'is-error': errors.photo }">{{ errors.photo || 'PNG/JPG, 1.5 МБ хүртэл. Хоосон бол нэрийн эхний үсэг харагдана.' }}</p>
        </div>
      </div>
      <div class="mf__grid">
        <TextField v-model="form.lastName" label="Овог" required :error="errors.lastName" />
        <TextField v-model="form.firstName" label="Нэр" required :error="errors.firstName" />
        <TextField v-model="form.position" label="Албан тушаал" required :error="errors.position" class="mf__wide" />
        <SelectMenu v-model="form.unitId" :options="unitOptions" label="Нэгж" required />
        <SelectMenu v-model="form.role" :options="roleOptions" label="Эрх (role)" required />
        <TextField v-model="form.email" type="email" label="И-мэйл" required icon="mail" :error="errors.email" placeholder="нэр.о@golomtbank.com" />
        <TextField v-model="form.phone" label="Утас" icon="phone" :error="errors.phone" placeholder="+976 9911 2233" />
        <TextField v-model="form.joinedAt" type="date" label="Ажилд орсон огноо" />
      </div>
    </form>
    <template #footer>
      <BaseButton variant="secondary" @click="emit('update:open', false)">Болих</BaseButton>
      <BaseButton icon="check" :loading="saving" @click="submit">{{ member ? 'Хадгалах' : 'Нэмэх' }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.mf { display: flex; flex-direction: column; gap: 20px; }
.mf__photo { display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 12px; background: var(--surface-2); border: 1px solid var(--border); }
.mf__photo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.mf__upload { display: inline-flex; align-items: center; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border-strong); background: var(--surface); font-size: var(--fs-sm); font-weight: var(--fw-medium); cursor: pointer; }
.mf__upload:hover { border-color: var(--primary); color: var(--primary); }
.mf__upload:focus-within { box-shadow: 0 0 0 3px var(--focus-ring); }
.mf__remove { font-size: var(--fs-sm); color: var(--danger); }
.mf__hint { width: 100%; font-size: var(--fs-xs); color: var(--text-3); }
.mf__hint.is-error { color: var(--danger); }
.mf__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mf__wide { grid-column: 1 / -1; }
@media (max-width: 767px) {
  .mf__grid { grid-template-columns: 1fr; }
}
</style>

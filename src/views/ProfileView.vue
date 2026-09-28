<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Tag from '@/components/ui/Tag.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useMembersStore } from '@/stores/members'
import { usePermissionsStore } from '@/stores/permissions'
import { useToolsStore } from '@/stores/tools'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'
import { useAsync } from '@/composables/useAsync'
import { getNews } from '@/services/news'
import { getRisks } from '@/services/risk'
import { resetMockDb } from '@/services/mockDb'
import { USE_MOCK } from '@/services/client'
import { formatDate, formatDateTime, formatRelative } from '@/utils/format'

const { user, auth, role, roleLabel } = useAuth()
const members = useMembersStore()
const perms = usePermissionsStore()
const tools = useToolsStore()
const theme = useThemeStore()
const ui = useUiStore()
const toast = useToast()
members.load()

const { data: myNews } = useAsync(async () => (await getNews()).filter((a) => a.authorId === user.value.id))
const { data: myRisks } = useAsync(async () => {
  const [o, it] = await Promise.all([getRisks('operational'), getRisks('it')])
  return [...o, ...it].filter((r) => r.ownerId === user.value.id)
})

const modeOptions = [
  { value: 'system', label: 'Систем' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
const mode = computed({ get: () => theme.mode, set: (m) => theme.setMode(m) })

const myPerms = computed(() =>
  perms.modules.map((m) => ({
    ...m,
    allowed: m.actions.filter((a) => perms.can(role.value, m.key, a)),
  })),
)

const activity = computed(() => {
  const items = []
  items.push({ icon: 'log-in', text: 'DAHUB-д нэвтэрсэн', at: auth.signedInAt })
  for (const a of myNews.value || []) items.push({ icon: 'news', text: `«${a.title}» нийтлэл нийтэлсэн`, at: a.publishedAt, to: `/news/${a.slug}` })
  for (const r of myRisks.value || []) items.push({ icon: 'risk', text: `${r.id} эрсдэлийг шинэчилсэн`, at: r.updatedAt, to: `/risk?tab=${r.id.startsWith('IT') ? 'it' : 'operational'}&q=${r.id}` })
  return items.filter((i) => i.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 7)
})

const years = computed(() => {
  const j = new Date(user.value.joinedAt)
  const diff = (Date.now() - j) / (365.25 * 86400000)
  return Math.max(0, Math.floor(diff))
})

const confirmReset = ref(false)
async function resetDemo() {
  resetMockDb()
  await members.load(true)
  await perms.load()
  if (tools.loaded) await tools.load(true)
  const me = members.byId(user.value.id)
  if (me) auth.refreshMember(me)
  confirmReset.value = false
  toast.success('Demo өгөгдөл сэргээгдлээ', 'Гишүүд, эрсдэл, нийтлэл, хэрэгсэл, эрхийн тохиргоо анхны төлөвтөө орлоо.')
}
function resetColors() {
  theme.resetAll()
  toast.info('Өнгөний тохиргоо цэвэрлэгдлээ', 'Light ба Dark хоёр горим «Голомт стандарт» болов.')
}
</script>

<template>
  <div class="page container">
    <PageHeader eyebrow="Миний профайл" :title="`${user.lastName} ${user.firstName}`" :description="user.position" />

    <div class="grid profile">
      <div class="span-4 lg-span-12 profile__side">
        <BaseCard class="me" v-reveal>
          <div class="me__head">
            <Avatar :member="user" size="xl" ring />
            <div>
              <h2 class="me__name">{{ user.lastName[0] }}. {{ user.firstName }}</h2>
              <p class="me__pos">{{ user.position }}</p>
              <div class="me__tags">
                <Tag tone="primary" size="sm">{{ roleLabel }}</Tag>
                <Tag v-for="c in user.certifications" :key="c" tone="accent" size="sm">{{ c }}</Tag>
              </div>
            </div>
          </div>
          <p v-if="user.bio" class="me__bio">{{ user.bio }}</p>
          <dl class="me__list">
            <div><dt><AppIcon name="building" :size="15" />Нэгж</dt><dd>{{ members.unitName(user.unitId) }}</dd></div>
            <div><dt><AppIcon name="mail" :size="15" />И-мэйл</dt><dd><a :href="`mailto:${user.latin}@golomtbank.com`">{{ user.latin }}@golomtbank.com</a></dd></div>
            <div><dt><AppIcon name="phone" :size="15" />Утас</dt><dd class="num">{{ user.phone }}</dd></div>
            <div><dt><AppIcon name="calendar" :size="15" />Ажилд орсон</dt><dd class="num">{{ formatDate(user.joinedAt) }} · {{ years }} жил</dd></div>
          </dl>
          <div v-if="user.expertise?.length" class="me__skills">
            <p class="eyebrow">Мэргэшил</p>
            <div class="me__tags"><Tag v-for="e in user.expertise" :key="e" size="sm">{{ e }}</Tag></div>
          </div>
        </BaseCard>

        <BaseCard title="Нэвтрэлт" v-reveal="1">
          <ul class="sessions">
            <li>
              <span class="sessions__dot is-live" />
              <div>
                <p class="sessions__title">Одоогийн сесс</p>
                <p class="sessions__meta num">{{ formatDateTime(auth.signedInAt) }} · {{ auth.remember ? 'Намайг сана идэвхтэй' : 'Хөтчийг хаахад дуусна' }}</p>
              </div>
            </li>
            <li>
              <span class="sessions__dot" />
              <div>
                <p class="sessions__title">Өмнөх нэвтрэлт</p>
                <p class="sessions__meta num">{{ auth.previousLoginAt ? formatDateTime(auth.previousLoginAt) : '—' }}</p>
              </div>
            </li>
          </ul>
        </BaseCard>
      </div>

      <div class="span-8 lg-span-12 profile__main">
        <BaseCard title="Миний эрх" :subtitle="`«${roleLabel}» role · Админ тохируулна`" v-reveal>
          <template #actions><BaseButton v-if="perms.can(role, 'members')" variant="ghost" size="sm" to="/members?tab=access" icon-right="arrow-right">Эрхийн матриц</BaseButton></template>
          <ul class="perm-list">
            <li v-for="m in myPerms" :key="m.key" class="perm" :class="{ 'is-none': !m.allowed.length }">
              <span class="perm__icon"><AppIcon :name="m.icon" :size="16" /></span>
              <span class="perm__name">{{ m.label }}</span>
              <span class="perm__acts">
                <Tag v-for="a in m.actions" :key="a" size="sm" :tone="m.allowed.includes(a) ? 'success' : 'neutral'" :icon="m.allowed.includes(a) ? 'check' : 'minus'">{{ perms.actionLabels[a] }}</Tag>
              </span>
            </li>
          </ul>
        </BaseCard>

        <BaseCard title="Тохиргоо" subtitle="Энэ төхөөрөмж дээр хадгалагдана" v-reveal="1">
          <div class="settings">
            <div class="setting">
              <div>
                <p class="setting__title">Харагдах горим</p>
                <p class="setting__desc">«Систем» нь үйлдлийн системийн light/dark тохиргоог дагана.</p>
              </div>
              <SegmentedControl v-model="mode" :options="modeOptions" label="Харагдах горим" />
            </div>
            <div class="setting">
              <div>
                <p class="setting__title">Өнгөний тохиргоо</p>
                <p class="setting__desc">Token, palette, contrast — light ба dark горимд тусдаа.</p>
              </div>
              <div class="row">
                <BaseButton variant="ghost" size="sm" icon="reset" :disabled="!theme.isCustom('light') && !theme.isCustom('dark')" @click="resetColors">Цэвэрлэх</BaseButton>
                <BaseButton variant="secondary" size="sm" icon="palette" @click="ui.customizerOpen = true">Өнгө тохируулах</BaseButton>
              </div>
            </div>
            <div v-if="USE_MOCK" class="setting">
              <div>
                <p class="setting__title">Demo өгөгдөл</p>
                <p class="setting__desc">Нэмсэн гишүүн, эрсдэл, нийтлэл, эрхийн өөрчлөлтийг анхны mock төлөвт буцаана.</p>
              </div>
              <BaseButton variant="danger" size="sm" icon="refresh" @click="confirmReset = true">Сэргээх</BaseButton>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Сүүлийн үйлдлүүд" v-reveal="2">
          <ol class="timeline">
            <li v-for="(a, i) in activity" :key="i" class="tl">
              <span class="tl__icon"><AppIcon :name="a.icon" :size="15" /></span>
              <div class="tl__body">
                <RouterLink v-if="a.to" :to="a.to" class="tl__text">{{ a.text }}</RouterLink>
                <p v-else class="tl__text">{{ a.text }}</p>
                <p class="tl__at">{{ formatRelative(a.at) }}</p>
              </div>
            </li>
          </ol>
        </BaseCard>
      </div>
    </div>

    <ConfirmDialog
      v-model:open="confirmReset"
      title="Demo өгөгдлийг сэргээх үү?"
      message="Энэ хөтөч дээр хийсэн бүх demo өөрчлөлт устаж, анхны өгөгдөл ачаалагдана. Өнгөний тохиргоо хэвээр үлдэнэ."
      confirm-label="Сэргээх"
      @confirm="resetDemo"
    />
  </div>
</template>

<style scoped>
.profile { align-items: start; }
.profile__side, .profile__main { display: flex; flex-direction: column; gap: var(--gutter); }
.me__head { display: flex; gap: 18px; align-items: center; }
.me__name { font-size: var(--fs-xl); }
.me__pos { font-size: var(--fs-sm); color: var(--text-2); margin-top: 2px; }
.me__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.me__bio { margin-top: 16px; font-size: var(--fs-sm); color: var(--text-2); line-height: 1.6; }
.me__list { margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
.me__list div { display: flex; justify-content: space-between; gap: 12px; font-size: var(--fs-sm); }
.me__list dt { display: inline-flex; align-items: center; gap: 8px; color: var(--text-3); white-space: nowrap; }
.me__list dd { margin: 0; text-align: right; min-width: 0; overflow-wrap: anywhere; }
.me__skills { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }

.sessions { list-style: none; display: flex; flex-direction: column; gap: 14px; }
.sessions li { display: flex; gap: 12px; align-items: flex-start; }
.sessions__dot { width: 10px; height: 10px; margin-top: 5px; border-radius: 50%; background: var(--border-strong); flex: none; }
.sessions__dot.is-live { background: var(--success); box-shadow: 0 0 0 4px var(--success-soft); }
.sessions__title { font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.sessions__meta { font-size: var(--fs-xs); color: var(--text-3); margin-top: 2px; }

.perm-list { list-style: none; display: flex; flex-direction: column; }
.perm { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.perm:last-child { border-bottom: 0; }
.perm__icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: var(--primary-soft); color: var(--primary); flex: none; }
.perm.is-none .perm__icon { background: var(--surface-2); color: var(--text-3); }
.perm__name { flex: 1; font-size: var(--fs-sm); font-weight: var(--fw-medium); }
.perm__acts { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

.settings { display: flex; flex-direction: column; }
.setting { display: flex; justify-content: space-between; align-items: center; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.setting:first-child { padding-top: 0; }
.setting:last-child { border-bottom: 0; padding-bottom: 0; }
.setting__title { font-size: var(--fs-sm); font-weight: var(--fw-semibold); }
.setting__desc { font-size: var(--fs-xs); color: var(--text-3); margin-top: 2px; }

.timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.tl { position: relative; display: flex; gap: 14px; padding-bottom: 16px; }
.tl:not(:last-child)::before { content: ''; position: absolute; left: 14px; top: 30px; bottom: 0; width: 1px; background: var(--border); }
.tl__icon { width: 29px; height: 29px; border-radius: 50%; display: grid; place-items: center; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-3); flex: none; }
.tl__body { padding-top: 4px; min-width: 0; }
.tl__text { font-size: var(--fs-sm); color: var(--text); }
a.tl__text:hover { color: var(--primary); }
.tl__at { font-size: var(--fs-xs); color: var(--text-3); margin-top: 2px; }
</style>

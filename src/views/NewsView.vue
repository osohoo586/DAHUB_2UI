<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Tabs from '@/components/ui/Tabs.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import TextField from '@/components/ui/TextField.vue'
import SelectMenu from '@/components/ui/SelectMenu.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import NewsCard from '@/components/cards/NewsCard.vue'
import { getNews, createArticle, NEWS_CATEGORIES } from '@/services/news'
import { useMembersStore } from '@/stores/members'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const members = useMembersStore()
const { can, user } = useAuth()
const toast = useToast()
members.load()

const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const cat = ref(NEWS_CATEGORIES.some((c) => c.key === route.query.cat) ? route.query.cat : 'all')
const all = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  all.value = await getNews({ category: 'all', q: q.value })
  loading.value = false
}

let t = null
watch(q, () => {
  clearTimeout(t)
  t = setTimeout(load, 180)
})
watch([q, cat], () => {
  router.replace({ query: { ...(cat.value !== 'all' ? { cat: cat.value } : {}), ...(q.value ? { q: q.value } : {}) } })
})
load()

const tabs = computed(() =>
  NEWS_CATEGORIES.map((c) => ({ key: c.key, label: c.label, count: c.key === 'all' ? all.value.length : all.value.filter((a) => a.category === c.key).length })),
)
const list = computed(() => (cat.value === 'all' ? all.value : all.value.filter((a) => a.category === cat.value)))

/* ---- create ---- */
const creating = ref(false)
const saving = ref(false)
const form = ref(blank())
const errors = ref({})
function blank() {
  return { title: '', category: 'it', excerpt: '', body: '', tags: '' }
}
function openCreate() {
  form.value = blank()
  errors.value = {}
  creating.value = true
}
function parseBody(text) {
  const blocks = []
  for (const chunk of text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)) {
    const lines = chunk.split('\n').map((l) => l.trim())
    if (chunk.startsWith('## ')) blocks.push({ t: 'h2', text: chunk.slice(3).trim() })
    else if (chunk.startsWith('> ')) blocks.push({ t: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') })
    else if (lines.every((l) => /^[-•]\s/.test(l))) blocks.push({ t: 'ul', items: lines.map((l) => l.replace(/^[-•]\s/, '')) })
    else if (lines.every((l) => /^\d+[.)]\s/.test(l))) blocks.push({ t: 'ol', items: lines.map((l) => l.replace(/^\d+[.)]\s/, '')) })
    else blocks.push({ t: 'p', text: lines.join(' ') })
  }
  return blocks
}
async function submit() {
  const f = form.value
  const e = {}
  if (f.title.trim().length < 8) e.title = 'Гарчиг дор хаяж 8 тэмдэгт байна.'
  if (f.excerpt.trim().length < 20) e.excerpt = 'Товч агуулга дор хаяж 20 тэмдэгт байна.'
  if (f.body.trim().length < 80) e.body = 'Үндсэн агуулга дор хаяж 80 тэмдэгт байна.'
  errors.value = e
  if (Object.keys(e).length) return
  saving.value = true
  const article = await createArticle({
    title: f.title.trim(),
    category: f.category,
    excerpt: f.excerpt.trim(),
    body: parseBody(f.body),
    tags: f.tags.split(',').map((s) => s.trim()).filter(Boolean),
    authorId: user.value.id,
  })
  saving.value = false
  creating.value = false
  toast.success('Нийтлэл нийтлэгдлээ', article.title)
  router.push(`/news/${article.slug}`)
}
const categoryOptions = NEWS_CATEGORIES.filter((c) => c.key !== 'all').map((c) => ({ value: c.key, label: c.label }))
</script>

<template>
  <div class="page container">
    <PageHeader
      eyebrow="Мэдлэгийн сан"
      title="DAG News"
      description="Мэдээллийн технологи, кибер аюулгүй байдал, мэргэжлийн мэдлэгийн нийтлэлүүд — газрын аудиторуудын бичсэн."
    >
      <template #actions>
        <BaseButton v-if="can('news', 'edit')" icon="plus" @click="openCreate">Нийтлэл нэмэх</BaseButton>
      </template>
    </PageHeader>

    <div class="news__search" v-reveal="1">
      <SearchInput v-model="q" size="lg" placeholder="Гарчиг, агуулга эсвэл түлхүүр үгээр хайх…" label="Нийтлэл хайх" />
    </div>

    <div class="news__tabs" v-reveal="2">
      <Tabs v-model="cat" :items="tabs" label="Ангилал" />
    </div>

    <div v-if="loading && !all.length" class="grid news__grid">
      <div v-for="n in 6" :key="n" class="span-4 md-span-6">
        <BaseCard padding="none">
          <Skeleton height="190px" radius="16px 16px 0 0" />
          <div class="news__skel"><Skeleton width="30%" height="20px" /><Skeleton :lines="2" height="18px" /><Skeleton :lines="3" /></div>
        </BaseCard>
      </div>
    </div>

    <TransitionGroup v-else-if="list.length" tag="div" name="list" class="grid news__grid">
      <div v-for="(a, i) in list" :key="a.id" class="span-4 md-span-6" v-reveal="i % 3">
        <NewsCard :article="a" :author="members.byId(a.authorId)" />
      </div>
    </TransitionGroup>

    <BaseCard v-else class="news__empty">
      <EmptyState variant="search" :title="`«${q}» гэсэн нийтлэл олдсонгүй`" description="Өөр түлхүүр үгээр хайх эсвэл ангиллын шүүлтүүрийг «Бүгд» болгоно уу.">
        <BaseButton variant="secondary" icon="x" @click="q = ''; cat = 'all'">Шүүлтүүр арилгах</BaseButton>
      </EmptyState>
    </BaseCard>

    <BaseModal v-model:open="creating" title="Нийтлэл нэмэх" description="Хоосон мөрөөр догол мөрийг тусгаарлана. «## » гарчиг, «- » жагсаалт, «> » ишлэл болно." size="lg">
      <form class="nf" @submit.prevent="submit">
        <TextField v-model="form.title" label="Гарчиг" required :error="errors.title" placeholder="Жишээ: Хандалтын эрхийн хяналтын шинэ арга" />
        <div class="nf__row">
          <SelectMenu v-model="form.category" :options="categoryOptions" label="Ангилал" required />
          <TextField v-model="form.tags" label="Түлхүүр үг" placeholder="Таслалаар тусгаарлана" hint="Жишээ: IAM, Хандалт" />
        </div>
        <TextField v-model="form.excerpt" label="Товч агуулга" multiline :rows="2" required :error="errors.excerpt" />
        <TextField v-model="form.body" label="Үндсэн агуулга" multiline :rows="9" required :error="errors.body" />
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="creating = false">Болих</BaseButton>
        <BaseButton icon="check" :loading="saving" @click="submit">Нийтлэх</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.news__search { max-width: 720px; margin-bottom: var(--space-6); }
.news__tabs { margin-bottom: var(--space-8); }
.news__grid { position: relative; }
.news__grid > * { display: flex; }
.news__grid > * > * { flex: 1; }
.news__skel { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.news__empty { margin-top: var(--space-4); }
.nf { display: flex; flex-direction: column; gap: 16px; }
.nf__row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 1023px) {
  .news__grid > .span-4 { grid-column: span 6; }
}
@media (max-width: 767px) {
  .nf__row { grid-template-columns: 1fr; }
}
</style>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import Tag from '@/components/ui/Tag.vue'
import Avatar from '@/components/ui/Avatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import NewsCover from '@/components/illustrations/NewsCover.vue'
import NewsCard from '@/components/cards/NewsCard.vue'
import ArticleBody from '@/components/cards/ArticleBody.vue'
import { getArticle, getRelated, deleteArticle, categoryLabel, categoryTone } from '@/services/news'
import { useMembersStore } from '@/stores/members'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { formatDateLong } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const members = useMembersStore()
const { can } = useAuth()
const toast = useToast()
members.load()

const article = ref(null)
const related = ref([])
const loading = ref(true)
const progress = ref(0)
const confirmDelete = ref(false)
const deleting = ref(false)
const bodyEl = ref(null)

const author = computed(() => (article.value ? members.byId(article.value.authorId) : null))

async function load(slug) {
  loading.value = true
  const [a, r] = await Promise.all([getArticle(slug), getRelated(slug)])
  article.value = a
  related.value = r
  loading.value = false
  if (a) document.title = `${a.title} · DAG News`
}
watch(() => route.params.slug, (s) => s && load(s), { immediate: true })

function onScroll() {
  const el = bodyEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const total = rect.height - window.innerHeight * 0.6
  progress.value = Math.min(100, Math.max(0, ((-rect.top + window.innerHeight * 0.25) / Math.max(total, 1)) * 100))
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Холбоос хуулагдлаа', 'Хамт ажиллагсаддаа илгээх боломжтой.')
  } catch {
    toast.error('Хуулж чадсангүй', 'Хаягийн мөрнөөс гараар хуулна уу.')
  }
}
async function remove() {
  deleting.value = true
  await deleteArticle(article.value.slug)
  deleting.value = false
  confirmDelete.value = false
  toast.info('Нийтлэл устгагдлаа', article.value.title)
  router.push('/news')
}
</script>

<template>
  <div class="page article-page">
    <div class="read-progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress / 100})` }" /></div>

    <div v-if="loading" class="container article__narrow">
      <Skeleton width="120px" height="16px" />
      <div class="article__skel"><Skeleton height="44px" :lines="2" /><Skeleton :lines="2" /></div>
      <Skeleton height="360px" radius="16px" />
    </div>

    <div v-else-if="!article" class="container">
      <BaseCard class="article__missing">
        <EmptyState variant="search" title="Нийтлэл олдсонгүй" description="Энэ нийтлэл устгагдсан эсвэл хаяг буруу байна.">
          <BaseButton to="/news" icon="arrow-left">DAG News руу буцах</BaseButton>
        </EmptyState>
      </BaseCard>
    </div>

    <template v-else>
      <article class="article">
        <header class="container article__narrow article__head">
          <div class="article__top" v-reveal>
            <RouterLink to="/news" class="article__back"><AppIcon name="arrow-left" :size="16" />DAG News</RouterLink>
            <div class="article__actions">
              <BaseButton variant="ghost" size="sm" icon="link" @click="copyLink">Холбоос хуулах</BaseButton>
              <BaseButton v-if="can('news', 'delete')" variant="danger" size="sm" icon="trash" @click="confirmDelete = true">Устгах</BaseButton>
            </div>
          </div>
          <div class="article__tags" v-reveal="1">
            <Tag :tone="categoryTone(article.category)">{{ categoryLabel(article.category) }}</Tag>
            <Tag v-for="t in article.tags" :key="t" size="sm">{{ t }}</Tag>
          </div>
          <h1 class="article__title" v-reveal="2">{{ article.title }}</h1>
          <p class="article__lead" v-reveal="3">{{ article.excerpt }}</p>
          <div class="article__meta" v-reveal="4">
            <div v-if="author" class="article__author">
              <Avatar :member="author" size="md" />
              <div>
                <p class="article__author-name">{{ author.lastName }} {{ author.firstName }}</p>
                <p class="article__author-pos">{{ author.position }}</p>
              </div>
            </div>
            <div class="article__facts num">
              <span><AppIcon name="calendar" :size="15" />{{ formatDateLong(article.publishedAt) }}</span>
              <span><AppIcon name="clock" :size="15" />{{ article.readMinutes }} минут унших</span>
            </div>
          </div>
        </header>

        <div class="container article__wide" v-reveal="4">
          <div class="article__cover"><NewsCover :category="article.category" :seed="article.cover?.seed ?? 1" :title="article.title" /></div>
        </div>

        <div ref="bodyEl" class="container article__narrow article__body">
          <ArticleBody :blocks="article.body" />
          <footer class="article__end">
            <span class="article__end-mark" aria-hidden="true" />
            <p>Энэ нийтлэл DAHUB-ийн дотоод мэдлэгийн санд хадгалагдана. Санал, нэмэлтийг зохиогчид шууд илгээнэ үү.</p>
          </footer>
        </div>
      </article>

      <section v-if="related.length" class="container section">
        <SectionHeader eyebrow="Үргэлжлүүлэн унших" title="Холбогдох нийтлэлүүд">
          <template #actions><BaseButton variant="ghost" to="/news" icon-right="arrow-right">Бүх нийтлэл</BaseButton></template>
        </SectionHeader>
        <div class="grid">
          <div v-for="(r, i) in related" :key="r.id" class="span-4 md-span-6 article__rel" v-reveal="i">
            <NewsCard :article="r" :author="members.byId(r.authorId)" />
          </div>
        </div>
      </section>

      <ConfirmDialog
        v-model:open="confirmDelete"
        title="Нийтлэлийг устгах уу?"
        :message="`«${article.title}» нийтлэлийг бүх хэрэглэгчээс нуух бөгөөд буцаах боломжгүй.`"
        :loading="deleting"
        @confirm="remove"
      />
    </template>
  </div>
</template>

<style scoped>
.read-progress { position: fixed; left: var(--nav-left); right: 0; top: var(--nav-top-sticky); height: 2px; z-index: calc(var(--z-nav) - 1); pointer-events: none; }
.read-progress span {
  display: block;
  height: 100%;
  transform-origin: left;
  background: linear-gradient(90deg, var(--primary) 0 calc(100% - 24px), var(--accent) calc(100% - 24px));
  transition: transform 120ms linear;
}
.article__narrow { max-width: calc(720px + var(--page-x) * 2); }
.article__wide { max-width: calc(1040px + var(--page-x) * 2); }
.article__skel { display: flex; flex-direction: column; gap: 16px; margin: 24px 0 32px; }
.article__missing { max-width: 720px; margin: 40px auto 0; }
.article__head { display: flex; flex-direction: column; gap: 16px; padding-top: var(--space-4); }
.article__top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.article__back { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--text-3); align-self: flex-start; }
.article__back:hover { color: var(--primary); text-decoration: none; }
.article__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.article__title { font-size: 2.75rem; line-height: 1.14; letter-spacing: -0.015em; }
.article__lead { font-size: var(--fs-lg); line-height: 1.55; color: var(--text-2); }
.article__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; padding: 18px 0; margin-top: 4px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.article__author { display: flex; align-items: center; gap: 12px; }
.article__author-name { font-weight: var(--fw-semibold); font-size: var(--fs-sm); }
.article__author-pos { font-size: var(--fs-xs); color: var(--text-3); }
.article__facts { display: flex; flex-wrap: wrap; gap: 16px; font-size: var(--fs-sm); color: var(--text-3); }
.article__facts span { display: inline-flex; align-items: center; gap: 6px; }
.article__actions { display: flex; gap: 8px; }
.article__facts { margin-left: auto; }
.article__cover { margin: var(--space-10) 0; aspect-ratio: 12 / 5; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border); }
.article__body { padding-bottom: var(--space-4); }
.article__end { margin-top: var(--space-12); padding-top: var(--space-6); border-top: 1px solid var(--border); display: flex; gap: 14px; align-items: flex-start; font-size: var(--fs-sm); color: var(--text-3); }
.article__end-mark { flex: none; width: 10px; height: 10px; margin-top: 5px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
.article__rel { display: flex; }
.article__rel > * { flex: 1; }
@media (max-width: 767px) {
  .article__title { font-size: var(--fs-2xl); }
  .article__facts { margin-left: 0; }
}
</style>

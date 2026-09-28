<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import PhotoSlider from '@/components/cards/PhotoSlider.vue'
import EthicsSlider from '@/components/cards/EthicsSlider.vue'
import LatestNewsCard from '@/components/cards/LatestNewsCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Skeleton from '@/components/ui/Skeleton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAuth } from '@/composables/useAuth'
import { useAsync } from '@/composables/useAsync'
import { getHeroSlides, getEthicsCode } from '@/services/home'
import { getNews } from '@/services/news'

const LATEST = 5

const { can } = useAuth()
const showNews = computed(() => can('news'))

const { data: slides } = useAsync(getHeroSlides)
const { data: ethics } = useAsync(getEthicsCode)
// getNews() already returns articles newest first
const { data: news } = useAsync(async () => (can('news') ? (await getNews()).slice(0, LATEST) : []))
</script>

<template>
  <div class="home container">
    <h1 class="sr-only">DAHUB — Нүүр</h1>
    <div class="home__grid" :class="{ 'has-news': showNews }">
      <div class="home__photo" v-reveal>
        <PhotoSlider v-if="slides" :slides="slides" />
        <Skeleton v-else height="100%" radius="16px" />
      </div>

      <div class="home__ethics" v-reveal="1">
        <EthicsSlider v-if="ethics" :principles="ethics" />
        <BaseCard v-else class="home__ethics-skel"><Skeleton :lines="4" height="18px" /></BaseCard>
      </div>

      <section v-if="showNews" class="home__news" aria-labelledby="latest-news-title">
        <header class="home__news-head">
          <h2 id="latest-news-title" class="home__news-title">Сүүлийн мэдээ</h2>
          <RouterLink to="/news" class="home__news-all">Бүгдийг харах<AppIcon name="arrow-right" :size="16" /></RouterLink>
        </header>

        <div class="home__news-row">
          <template v-if="news">
            <div v-for="(a, i) in news" :key="a.id" class="home__news-item" :style="{ '--i': i }">
              <LatestNewsCard :article="a" />
            </div>
          </template>
          <template v-else>
            <BaseCard v-for="n in LATEST" :key="n" padding="sm" class="home__news-skel">
              <Skeleton :lines="3" height="14px" />
            </BaseCard>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* One screen, no scroll: the page is exactly the viewport minus the space the
   chosen navigation occupies (top bar / bottom bar); the slider row flexes and
   gives up height first so the news row always fits. */
.home {
  --home-gap: clamp(12px, 2.2vh, 26px);
  --home-pad: clamp(16px, 2.6vh, 28px);
  --ln-cover: clamp(44px, 8vh, 96px);
  --ln-pad: clamp(8px, 1.3vh, 12px) 14px;
  --ln-title: var(--fs-base);
  height: 100vh;
  height: 100dvh;
  padding-top: calc(var(--nav-top) + var(--home-gap));
  padding-bottom: calc(var(--nav-bottom) + var(--home-gap));
  display: flex;
  flex-direction: column;
  transition: padding var(--dur-nav) var(--ease-out);
}
.home__grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr);
  gap: var(--home-gap) var(--gutter);
}
.home__grid.has-news { grid-template-rows: minmax(0, 1fr) auto; }
.home__photo { grid-column: span 8; min-height: 0; }
.home__ethics { grid-column: span 4; min-height: 0; }
.home__ethics-skel { height: 100%; }

/* ---- Latest news ---- */
.home__news { grid-column: 1 / -1; min-width: 0; display: flex; flex-direction: column; gap: clamp(6px, 1.2vh, 12px); }
.home__news-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.home__news-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: var(--tracking-eyebrow);
  text-transform: uppercase;
  color: var(--text-3);
}
.home__news-title::before { content: ''; width: 16px; height: 2px; border-radius: 2px; background: var(--accent); }
.home__news-all { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-sm); font-weight: var(--fw-medium); color: var(--primary); white-space: nowrap; }
.home__news-all .icon { transition: transform var(--dur-base) var(--ease-out); }
.home__news-all:hover { text-decoration: none; }
.home__news-all:hover .icon { transform: translateX(3px); }

/* Five equal columns; below ~5 × 200px the row scrolls sideways (never the page) */
.home__news-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(200px, 1fr);
  gap: var(--gutter);
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
  /* room for the card hover lift and focus ring inside the scroller */
  padding: 4px;
  margin: -4px;
}
.home__news-item,
.home__news-skel { min-width: 0; scroll-snap-align: start; }
.home__news-item {
  animation: news-in 460ms var(--ease-out) both;
  animation-delay: calc(240ms + var(--i) * var(--stagger));
}
@keyframes news-in {
  from { opacity: 0; transform: translate3d(0, var(--reveal-distance), 0); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 1279px) {
  .home__photo { grid-column: span 7; }
  .home__ethics { grid-column: span 5; }
}
/* Short screens: the ethics mark/number goes first, then the covers shrink */
@media (max-height: 720px) {
  .home :deep(.es__top) { display: none; }
  .home :deep(.es__stage) { padding: 10px 0; }
  .home { --ln-title: var(--fs-sm); }
}
@media (max-width: 1023px) {
  .home__grid.has-news { grid-template-rows: minmax(0, 1fr) auto auto; }
  .home__grid:not(.has-news) { grid-template-rows: minmax(0, 1fr) auto; }
  .home__photo, .home__ethics { grid-column: 1 / -1; }
  .home :deep(.es__stage) { padding: 10px 0; }
  .home :deep(.es__top) { display: none; }
  .home__news-row { grid-auto-columns: minmax(180px, 1fr); gap: var(--home-gap); }
}
@media (max-width: 767px) {
  .home { --ln-cover: 48px; --ln-title: var(--fs-sm); }
  .home__news-row { grid-auto-columns: minmax(168px, 62%); }
}
@media (prefers-reduced-motion: reduce) {
  .home__news-item { animation: none; }
}
/* Too short to fit even compact cards (landscape phones): allow scrolling rather than clipping */
@media (max-height: 480px) {
  .home { height: auto; min-height: 100dvh; }
  .home__grid.has-news, .home__grid { grid-template-rows: 320px auto; }
}
</style>

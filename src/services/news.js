import { USE_MOCK, http, mock } from './client'
import { clone } from '@/utils/clone'
import { table, commit } from './mockDb'

export const NEWS_CATEGORIES = [
  { key: 'all', label: 'Бүгд' },
  { key: 'it', label: 'IT Knowledge' },
  { key: 'cyber', label: 'Cybersecurity News' },
  { key: 'general', label: 'General Knowledge' },
]

export const categoryLabel = (key) => NEWS_CATEGORIES.find((c) => c.key === key)?.label ?? key
export const categoryTone = (key) => ({ it: 'primary', cyber: 'teal', general: 'violet' })[key] ?? 'neutral'

/** ~200 words per minute of Mongolian body text. */
export function readingMinutes(article) {
  const words = (article.body || [])
    .flatMap((b) => (b.items ? b.items : [b.text || '']))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(2, Math.round(words / 180))
}

function withMeta(a) {
  return { ...a, readMinutes: readingMinutes(a) }
}

function sorted(list) {
  return [...list].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

/** GET /api/news?category=&q= */
export async function getNews({ category = 'all', q = '' } = {}) {
  if (!USE_MOCK) return http.get(`/news?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}`)
  const needle = q.trim().toLowerCase()
  const list = sorted(table('news'))
    .filter((a) => category === 'all' || a.category === category)
    .filter((a) => !needle || [a.title, a.excerpt, ...(a.tags || [])].join(' ').toLowerCase().includes(needle))
    .map(withMeta)
  return mock(list)
}

/** GET /api/news/:slug */
export async function getArticle(slug) {
  if (!USE_MOCK) return http.get(`/news/${slug}`)
  const a = table('news').find((x) => x.slug === slug)
  return mock(a ? withMeta(a) : null)
}

/** GET /api/news/:slug/related */
export async function getRelated(slug, limit = 3) {
  if (!USE_MOCK) return http.get(`/news/${slug}/related?limit=${limit}`)
  const all = sorted(table('news'))
  const current = all.find((a) => a.slug === slug)
  if (!current) return mock([])
  const score = (a) =>
    (a.category === current.category ? 10 : 0) + (a.tags || []).filter((t) => current.tags?.includes(t)).length * 3
  const related = all
    .filter((a) => a.slug !== slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
    .map(withMeta)
  return mock(related)
}

function slugify(title) {
  const map = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', ө: 'u', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ү: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' }
  return title
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

/** POST /api/news */
export async function createArticle(data) {
  data = clone(data)
  if (!USE_MOCK) return http.post('/news', data)
  const list = table('news')
  let slug = slugify(data.title) || `article-${Date.now()}`
  if (list.some((a) => a.slug === slug)) slug = `${slug}-${Date.now().toString(36)}`
  const article = {
    id: `n${Date.now().toString(36)}`,
    slug,
    publishedAt: new Date().toISOString(),
    tags: [],
    cover: { seed: Math.floor(Math.random() * 12) + 1 },
    ...data,
  }
  list.push(article)
  commit()
  return mock(withMeta(article))
}

/** DELETE /api/news/:slug */
export async function deleteArticle(slug) {
  if (!USE_MOCK) return http.delete(`/news/${slug}`)
  const list = table('news')
  const i = list.findIndex((a) => a.slug === slug)
  if (i >= 0) list.splice(i, 1)
  commit()
  return mock(null)
}

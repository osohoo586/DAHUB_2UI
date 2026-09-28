import { USE_MOCK, http, mock } from './client'
import { table } from './mockDb'
import org from '@/mock/org.json'

const PAGES = [
  { title: 'Нүүр', to: '/', icon: 'home', keywords: 'home нүүр' },
  { title: 'DAG News', to: '/news', icon: 'news', keywords: 'мэдээ нийтлэл news', module: 'news' },
  { title: 'Dashboard', to: '/dashboard', icon: 'dashboard', keywords: 'kpi график үзүүлэлт', module: 'dashboard' },
  { title: 'Хэрэгсэл', to: '/tools', icon: 'tools', keywords: 'хэрэгсэл tools mus бенфорд benford давхардал gap материаллаг', module: 'tools' },
  { title: 'Санамсаргүй түүвэр', to: '/tools/sampling', icon: 'shuffle', keywords: 'хэрэгсэл түүвэр sample excel', module: 'tools' },
  { title: 'Эрсдэлийн үнэлгээ', to: '/risk', icon: 'risk', keywords: 'эрсдэл heat map risk', module: 'risk' },
  { title: 'Гишүүд ба эрх', to: '/members', icon: 'users', keywords: 'гишүүд ажилтан эрх rbac', module: 'members' },
  { title: 'Профайл', to: '/profile', icon: 'user', keywords: 'профайл тохиргоо' },
]

/** GET /api/search?q= → grouped results */
export async function searchAll(q) {
  if (!USE_MOCK) return http.get(`/search?q=${encodeURIComponent(q)}`)
  const needle = q.trim().toLowerCase()
  if (!needle) return mock({ pages: PAGES, news: [], members: [], risks: [] }, 0)
  const has = (...parts) => parts.join(' ').toLowerCase().includes(needle)
  const units = Object.fromEntries([[org.root.id, org.root.name], ...org.units.map((u) => [u.id, u.name])])
  const risks = table('risks')
  return mock(
    {
      pages: PAGES.filter((p) => has(p.title, p.keywords)),
      news: table('news')
        .filter((a) => has(a.title, a.excerpt, ...(a.tags || [])))
        .slice(0, 5)
        .map((a) => ({ title: a.title, to: `/news/${a.slug}`, meta: a.category })),
      members: table('members')
        .filter((m) => has(m.lastName, m.firstName, m.position, units[m.unitId]))
        .slice(0, 5)
        .map((m) => ({ title: `${m.lastName} ${m.firstName}`, to: `/members?q=${encodeURIComponent(m.firstName)}`, meta: m.position, member: m })),
      risks: [
        ...risks.operational.map((r) => ({ ...r, type: 'operational' })),
        ...risks.it.map((r) => ({ ...r, type: 'it' })),
      ]
        .filter((r) => has(r.id, r.title, r.category, r.unit))
        .slice(0, 5)
        .map((r) => ({ title: r.title, to: `/risk?tab=${r.type}&q=${encodeURIComponent(r.id)}`, meta: r.id })),
    },
    120,
  )
}

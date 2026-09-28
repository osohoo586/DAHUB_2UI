import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permissions'

// Views are code-split per route.
const views = import.meta.glob('../views/*.vue')
const view = (name) => views[`../views/${name}.vue`]

const routes = [
  { path: '/login', name: 'login', component: view('LoginView'), meta: { layout: 'blank', guest: true, title: 'Нэвтрэх' } },
  { path: '/', name: 'home', component: view('HomeView'), meta: { title: 'Нүүр' } },
  { path: '/news', name: 'news', component: view('NewsView'), meta: { module: 'news', title: 'DAG News', key: () => 'news' } },
  { path: '/news/:slug', name: 'news-detail', component: view('NewsDetailView'), meta: { module: 'news', title: 'DAG News' } },
  { path: '/dashboard', name: 'dashboard', component: view('DashboardView'), meta: { module: 'dashboard', title: 'Dashboard' } },
  { path: '/tools', name: 'tools', component: view('ToolsHubView'), meta: { module: 'tools', title: 'Хэрэгсэл' } },
  { path: '/tools/sampling', name: 'sampling', component: view('ToolsView'), meta: { module: 'tools', title: 'Санамсаргүй түүвэр' } },
  { path: '/tools/:id', name: 'tool', component: view('ToolPlaceholderView'), meta: { module: 'tools', title: 'Хэрэгсэл' } },
  { path: '/risk', name: 'risk', component: view('RiskView'), meta: { module: 'risk', title: 'Эрсдэлийн үнэлгээ', key: () => 'risk' } },
  { path: '/members', name: 'members', component: view('MembersView'), meta: { module: 'members', title: 'Гишүүд ба эрх', key: () => 'members' } },
  { path: '/profile', name: 'profile', component: view('ProfileView'), meta: { title: 'Миний профайл' } },
  { path: '/403', name: 'forbidden', component: view('ForbiddenView'), meta: { title: 'Хандах эрхгүй' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: view('NotFoundView'), meta: { title: 'Хуудас олдсонгүй' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes.filter((r) => r.redirect || r.component),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 88 }
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.guest) return auth.isAuthenticated ? { path: '/' } : true
  if (!auth.isAuthenticated) return { path: '/login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
  const perms = usePermissionsStore()
  if (!perms.loaded) await perms.load()
  if (to.meta.module && !perms.can(auth.role, to.meta.module, 'view')) return { name: 'forbidden', query: { from: to.fullPath } }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · DAHUB` : 'DAHUB · Дотоод аудитын газар'
})

export default router

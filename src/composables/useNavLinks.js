import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from './useAuth'

/** Main navigation — shared by every nav layout so labels, icons and order stay identical. */
export const NAV_LINKS = [
  { to: '/', label: 'Нүүр', short: 'Нүүр', icon: 'home', exact: true, desc: 'Ёс зүйн зарчим, сүүлийн мэдээ' },
  { to: '/news', label: 'DAG News', short: 'News', icon: 'news', module: 'news', desc: 'IT, кибер аюулгүй байдал, мэргэжлийн нийтлэл' },
  { to: '/dashboard', label: 'Dashboard', short: 'Dashboard', icon: 'dashboard', module: 'dashboard', desc: 'Санхүүгийн үзүүлэлт, төлөвлөгөөний гүйцэтгэл' },
  { to: '/tools', label: 'Хэрэгсэл', short: 'Хэрэгсэл', icon: 'tools', module: 'tools', desc: 'Түүвэрлэлт, шинжилгээ, тооцоолуур' },
  { to: '/risk', label: 'Эрсдэлийн үнэлгээ', short: 'Эрсдэл', icon: 'risk', module: 'risk', desc: 'Эрсдэлийн матриц ба бүртгэл' },
]

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function useNavLinks() {
  const route = useRoute()
  const { can } = useAuth()
  const links = computed(() => NAV_LINKS.filter((l) => !l.module || can(l.module)))
  const isActive = (l) => (l.exact ? route.path === l.to : route.path === l.to || route.path.startsWith(`${l.to}/`))
  const current = computed(() => links.value.find(isActive) ?? null)
  return { links, isActive, current }
}

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

/** Items behind the user's avatar — shared by the avatar dropdown and the dropdown nav panel. */
export function useUserMenu() {
  const { auth, user, roleLabel, can } = useAuth()
  const router = useRouter()
  const toast = useToast()

  async function logout() {
    const name = user.value?.firstName
    await auth.logout()
    router.push('/login')
    toast.info('Системээс гарлаа', name ? `Дараа уулзъя, ${name}.` : '')
  }

  const items = computed(() => [
    { label: 'Миний профайл', icon: 'user', to: '/profile' },
    ...(can('members') ? [{ label: 'Гишүүд ба эрх', icon: 'key', to: '/members' }] : []),
    { divider: true },
    { label: 'Гарах', icon: 'log-out', tone: 'danger', action: logout },
  ])

  return { user, roleLabel, items, logout }
}

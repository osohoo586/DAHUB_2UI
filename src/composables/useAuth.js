import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionsStore } from '@/stores/permissions'

export function useAuth() {
  const auth = useAuthStore()
  const perms = usePermissionsStore()
  const role = computed(() => auth.role)
  const can = (module, action = 'view') => perms.can(auth.role, module, action)
  return {
    auth,
    user: computed(() => auth.member),
    role,
    roleLabel: computed(() => perms.roleLabel(auth.role)),
    isAuthenticated: computed(() => auth.isAuthenticated),
    can,
  }
}

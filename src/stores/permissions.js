import { defineStore } from 'pinia'
import { getPermissions, savePermissions, defaultMatrix } from '@/services/permissions'
import base from '@/mock/permissions.json'

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    modules: base.modules,
    roles: base.roles,
    actionLabels: base.actionLabels,
    matrix: defaultMatrix(),
    loaded: false,
  }),

  getters: {
    can: (s) => (role, module, action = 'view') => Boolean(role && s.matrix[role]?.[module]?.[action]),
    roleLabel: (s) => (key) => s.roles.find((r) => r.key === key)?.label ?? key,
    /** Admins can never lose permission management (prevents self lock-out). */
    isLocked: () => (role, module) => role === 'admin' && module === 'members',
  },

  actions: {
    async load() {
      const res = await getPermissions()
      this.modules = res.modules
      this.roles = res.roles
      this.actionLabels = res.actionLabels
      this.matrix = res.matrix
      this.loaded = true
    },

    async set(role, module, action, value) {
      if (this.isLocked(role, module)) return
      const cell = { ...this.matrix[role][module] }
      cell[action] = value
      // Editing or deleting implies viewing; removing view removes everything.
      if (action === 'view' && !value) for (const k of Object.keys(cell)) cell[k] = false
      if (action !== 'view' && value) cell.view = true
      this.matrix = { ...this.matrix, [role]: { ...this.matrix[role], [module]: cell } }
      await savePermissions(this.matrix)
    },

    async reset() {
      this.matrix = defaultMatrix()
      await savePermissions(this.matrix)
    },
  },
})

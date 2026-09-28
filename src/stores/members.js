import { defineStore } from 'pinia'
import * as svc from '@/services/members'

export const useMembersStore = defineStore('members', {
  state: () => ({
    list: [],
    org: null,
    loaded: false,
    loading: false,
  }),

  getters: {
    byId: (s) => (id) => s.list.find((m) => m.id === id),
    units: (s) => (s.org ? [s.org.root, ...s.org.units] : []),
    unitName() {
      return (id) => this.units.find((u) => u.id === id)?.name ?? '—'
    },
    unitShort() {
      return (id) => {
        const u = this.units.find((x) => x.id === id)
        return u?.shortName ?? u?.name ?? '—'
      }
    },
    membersOf: (s) => (unitId) => s.list.filter((m) => m.unitId === unitId),
  },

  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.loading = true
      try {
        const [list, org] = await Promise.all([svc.getMembers(), svc.getOrgStructure()])
        this.list = list
        this.org = org
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async refreshOrg() {
      this.org = await svc.getOrgStructure()
    },

    async create(data) {
      const m = await svc.createMember(data)
      this.list.push(m)
      await this.refreshOrg()
      return m
    },

    async update(id, data) {
      const m = await svc.updateMember(id, data)
      const i = this.list.findIndex((x) => x.id === id)
      if (i >= 0) this.list[i] = m
      await this.refreshOrg()
      return m
    },

    async remove(id) {
      await svc.deleteMember(id)
      this.list = this.list.filter((m) => m.id !== id)
      await this.refreshOrg()
    },
  },
})

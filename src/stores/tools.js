import { defineStore } from 'pinia'
import * as svc from '@/services/tools'

export const useToolsStore = defineStore('tools', {
  state: () => ({
    list: [],
    loaded: false,
  }),

  getters: {
    byId: (s) => (id) => s.list.find((t) => t.id === id),
  },

  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.list = await svc.getTools()
      this.loaded = true
    },

    async create(data) {
      const tool = await svc.createTool(data)
      this.list.push(tool)
      return tool
    },

    async update(id, data) {
      const tool = await svc.updateTool(id, data)
      const i = this.list.findIndex((t) => t.id === id)
      if (i >= 0) this.list[i] = tool
      return tool
    },

    async remove(id) {
      await svc.deleteTool(id)
      this.list = this.list.filter((t) => t.id !== id)
    },

    /** Move a card to a new index (live, while dragging). Call saveOrder() when done. */
    move(id, toIndex) {
      const from = this.list.findIndex((t) => t.id === id)
      if (from < 0 || toIndex < 0 || toIndex >= this.list.length || from === toIndex) return false
      const next = [...this.list]
      const [tool] = next.splice(from, 1)
      next.splice(toIndex, 0, tool)
      this.list = next
      return true
    },

    saveOrder() {
      return svc.saveToolOrder(this.list.map((t) => t.id))
    },
  },
})

import { defineStore } from 'pinia'

let toastId = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    customizerOpen: false,
    searchOpen: false,
  }),
  actions: {
    toast({ tone = 'info', title, message = '', timeout = 3800 }) {
      const id = ++toastId
      this.toasts.push({ id, tone, title, message })
      if (timeout) setTimeout(() => this.dismiss(id), timeout)
      return id
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
  },
})

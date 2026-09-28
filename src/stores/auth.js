import { defineStore } from 'pinia'
import * as authService from '@/services/auth'
import { setAuthToken } from '@/services/client'

const KEY = 'dahub.auth'

function readSession() {
  for (const store of [localStorage, sessionStorage]) {
    try {
      const raw = store.getItem(KEY)
      if (raw) return { ...JSON.parse(raw), remember: store === localStorage }
    } catch {
      /* ignore */
    }
  }
  return null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    account: null,
    member: null,
    previousLoginAt: null,
    signedInAt: null,
    remember: false,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.token && s.member),
    role: (s) => s.member?.role ?? null,
  },

  actions: {
    init() {
      const s = readSession()
      if (!s) return
      Object.assign(this, s)
      setAuthToken(this.token)
    },

    persist() {
      const data = JSON.stringify({
        token: this.token,
        account: this.account,
        member: this.member,
        previousLoginAt: this.previousLoginAt,
        signedInAt: this.signedInAt,
      })
      try {
        localStorage.removeItem(KEY)
        sessionStorage.removeItem(KEY)
        ;(this.remember ? localStorage : sessionStorage).setItem(KEY, data)
      } catch {
        /* storage blocked */
      }
    },

    async login(username, password, remember = false) {
      const res = await authService.login(username, password)
      this.token = res.token
      this.account = res.account
      this.member = res.member
      this.previousLoginAt = res.account.lastLoginAt
      this.signedInAt = new Date().toISOString()
      this.remember = remember
      setAuthToken(this.token)
      this.persist()
    },

    /** Keep the signed-in member in sync after profile/role edits. */
    refreshMember(member) {
      if (member && this.member && member.id === this.member.id) {
        this.member = { ...this.member, ...member }
        this.persist()
      }
    },

    async logout() {
      await authService.logout()
      this.$reset()
      setAuthToken(null)
      try {
        localStorage.removeItem(KEY)
        sessionStorage.removeItem(KEY)
      } catch {
        /* ignore */
      }
    },
  },
})

import { USE_MOCK, http, mock, mockError } from './client'
import users from '@/mock/users.json'
import { table } from './mockDb'

/** POST /api/auth/login → { token, account, member } */
export async function login(username, password) {
  if (!USE_MOCK) return http.post('/auth/login', { username, password })
  const account = users.find((u) => u.username === username.trim().toLowerCase())
  if (!account || account.password !== password) {
    return mockError('Нэвтрэх нэр эсвэл нууц үг буруу байна.', 401, 520)
  }
  const member = table('members').find((m) => m.id === account.memberId)
  return mock(
    {
      token: `mock.${account.username}.${Date.now().toString(36)}`,
      account: { username: account.username, lastLoginAt: account.lastLoginAt },
      member,
    },
    560,
  )
}

/** GET /api/auth/demo-accounts — only exists in mock mode */
export async function getDemoAccounts() {
  if (!USE_MOCK) return []
  const list = table('members')
  return mock(
    users.map((u) => {
      const m = list.find((x) => x.id === u.memberId)
      return { username: u.username, password: u.password, role: m?.role, name: m ? `${m.lastName[0]}. ${m.firstName}` : u.username, position: m?.position }
    }),
    0,
  )
}

/** POST /api/auth/logout */
export async function logout() {
  if (!USE_MOCK) return http.post('/auth/logout')
  return mock(null, 120)
}

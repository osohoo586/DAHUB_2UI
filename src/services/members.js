import { USE_MOCK, http, mock } from './client'
import org from '@/mock/org.json'
import { clone } from '@/utils/clone'
import { table, commit, nextId } from './mockDb'

/** GET /api/members */
export async function getMembers() {
  if (!USE_MOCK) return http.get('/members')
  return mock(table('members'))
}

/** GET /api/org — units with head-counts */
export async function getOrgStructure() {
  if (!USE_MOCK) return http.get('/org')
  const members = table('members')
  return mock({
    ...org,
    root: { ...org.root, headcount: members.filter((m) => m.unitId === 'leadership').length },
    units: org.units.map((u) => ({ ...u, headcount: members.filter((m) => m.unitId === u.id).length })),
  })
}

/** POST /api/members */
export async function createMember(data) {
  data = clone(data)
  if (!USE_MOCK) return http.post('/members', data)
  const list = table('members')
  const member = { certifications: [], expertise: [], bio: '', ...data, id: nextId('m', list, 'id', 2) }
  list.push(member)
  commit()
  return mock(member)
}

/** PUT /api/members/:id */
export async function updateMember(id, data) {
  data = clone(data)
  if (!USE_MOCK) return http.put(`/members/${id}`, data)
  const list = table('members')
  const i = list.findIndex((m) => m.id === id)
  if (i >= 0) list[i] = { ...list[i], ...data, id }
  commit()
  return mock(list[i])
}

/** DELETE /api/members/:id */
export async function deleteMember(id) {
  if (!USE_MOCK) return http.delete(`/members/${id}`)
  const list = table('members')
  const i = list.findIndex((m) => m.id === id)
  if (i >= 0) list.splice(i, 1)
  commit()
  return mock(null)
}

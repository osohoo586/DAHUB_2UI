import { USE_MOCK, http, mock } from './client'
import assessments from '@/mock/assessments.json'
import { clone } from '@/utils/clone'
import { table, commit, nextId } from './mockDb'

export const RISK_TYPES = [
  { key: 'operational', label: 'Үйл ажиллагааны эрсдэлийн үнэлгээ', short: 'Үйл ажиллагааны эрсдэл', prefix: 'OR-' },
  { key: 'it', label: 'МТ-ийн үйл ажиллагааны үнэлгээ', short: 'МТ-ийн үйл ажиллагаа', prefix: 'IT-' },
]

export const LIKELIHOOD = ['Маш бага', 'Бага', 'Дунд', 'Өндөр', 'Маш өндөр']
export const IMPACT = ['Үл мэдэгдэх', 'Бага', 'Дунд', 'Их', 'Ноцтой']

export const RISK_LEVELS = [
  { key: 'low', label: 'Бага', min: 1, max: 4 },
  { key: 'medium', label: 'Дунд', min: 5, max: 9 },
  { key: 'high', label: 'Өндөр', min: 10, max: 16 },
  { key: 'critical', label: 'Маш өндөр', min: 17, max: 25 },
]

export const RISK_STATUS = [
  { key: 'open', label: 'Нээлттэй', tone: 'danger' },
  { key: 'monitoring', label: 'Хяналтад', tone: 'warning' },
  { key: 'mitigated', label: 'Бууруулсан', tone: 'info' },
  { key: 'closed', label: 'Хаагдсан', tone: 'success' },
]

export const riskScore = (r) => r.likelihood * r.impact
export const levelFor = (score) => RISK_LEVELS.find((l) => score >= l.min && score <= l.max) ?? RISK_LEVELS[0]
export const statusFor = (key) => RISK_STATUS.find((s) => s.key === key) ?? RISK_STATUS[0]

/** GET /api/risks?type= */
export async function getRisks(type) {
  if (!USE_MOCK) return http.get(`/risks?type=${type}`)
  return mock(table('risks')[type] ?? [])
}

/** GET /api/risk-assessments/:type */
export async function getAssessment(type) {
  if (!USE_MOCK) return http.get(`/risk-assessments/${type}`)
  return mock(assessments[type])
}

/** POST /api/risks */
export async function createRisk(type, data) {
  data = clone(data)
  if (!USE_MOCK) return http.post('/risks', { type, ...data })
  const list = table('risks')[type]
  const prefix = RISK_TYPES.find((t) => t.key === type).prefix
  const risk = { ...data, id: nextId(prefix, list), updatedAt: new Date().toISOString().slice(0, 10) }
  list.unshift(risk)
  commit()
  return mock(risk)
}

/** PUT /api/risks/:id */
export async function updateRisk(type, id, data) {
  data = clone(data)
  if (!USE_MOCK) return http.put(`/risks/${id}`, { type, ...data })
  const list = table('risks')[type]
  const i = list.findIndex((r) => r.id === id)
  if (i >= 0) list[i] = { ...list[i], ...data, id, updatedAt: new Date().toISOString().slice(0, 10) }
  commit()
  return mock(list[i])
}

/** DELETE /api/risks/:id */
export async function deleteRisk(type, id) {
  if (!USE_MOCK) return http.delete(`/risks/${id}?type=${type}`)
  const list = table('risks')[type]
  const i = list.findIndex((r) => r.id === id)
  if (i >= 0) list.splice(i, 1)
  commit()
  return mock(null)
}

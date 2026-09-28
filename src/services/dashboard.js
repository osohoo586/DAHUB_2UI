import { USE_MOCK, http, mock } from './client'
import dashboard from '@/mock/dashboard.json'

/** GET /api/dashboard?period=month|quarter|year */
export async function getDashboardStats({ period = 'quarter' } = {}) {
  if (!USE_MOCK) return http.get(`/dashboard?period=${period}`)
  const p = dashboard.periods[period] ?? dashboard.periods.quarter
  return mock({ period, asOf: dashboard.asOf, note: dashboard.note, ...p, overdue: dashboard.overdue }, 380)
}

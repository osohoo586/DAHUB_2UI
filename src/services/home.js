import { USE_MOCK, http, mock } from './client'
import hero from '@/mock/hero.json'
import ethics from '@/mock/ethics.json'
import tasks from '@/mock/tasks.json'

/** GET /api/home/hero */
export async function getHeroSlides() {
  if (!USE_MOCK) return http.get('/home/hero')
  return mock(hero, 0)
}

/** GET /api/home/ethics */
export async function getEthicsCode() {
  if (!USE_MOCK) return http.get('/home/ethics')
  return mock(ethics)
}

/** GET /api/me/tasks?date=today */
export async function getTodayTasks(memberId) {
  if (!USE_MOCK) return http.get('/me/tasks?date=today')
  return mock(tasks[memberId] ?? tasks.default)
}

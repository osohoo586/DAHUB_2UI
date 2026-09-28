import { USE_MOCK, http, mock } from './client'
import { table, commit, nextId } from './mockDb'
import catalog from '@/mock/tools.json'

export const TOOL_CATEGORIES = catalog.categories
export const TOOL_ICONS = catalog.icons
export const categoryOf = (key) => TOOL_CATEGORIES.find((c) => c.key === key) ?? { key, label: key, tone: 'neutral' }

/** Built-in tools ship with the app; only those with a `route` are implemented. */
const normalize = (t, builtin) => ({
  id: t.id,
  name: t.name,
  description: t.description,
  category: t.category,
  icon: t.icon,
  builtin,
  ready: Boolean(t.route),
  to: t.route || `/tools/${t.id}`,
})

/** Sort by the saved id order; tools missing from it keep their natural order at the end. */
export function applyOrder(list, order = []) {
  const rank = new Map(order.map((id, i) => [id, i]))
  return list
    .map((t, i) => ({ t, i }))
    .sort((a, b) => (rank.get(a.t.id) ?? order.length + a.i) - (rank.get(b.t.id) ?? order.length + b.i))
    .map(({ t }) => t)
}

function allTools() {
  const db = table('tools')
  const list = [...catalog.builtin.map((t) => normalize(t, true)), ...db.custom.map((t) => normalize(t, false))]
  return applyOrder(list, db.order)
}

const pick = ({ name, description, category, icon }) => ({
  name: String(name).trim(),
  description: String(description).trim(),
  category: TOOL_CATEGORIES.some((c) => c.key === category) ? category : TOOL_CATEGORIES[0].key,
  icon: TOOL_ICONS.includes(icon) ? icon : 'tools',
})

/** GET /api/tools → ordered tool cards */
export async function getTools() {
  if (!USE_MOCK) return http.get('/tools')
  return mock(allTools(), 120)
}

/** POST /api/tools */
export async function createTool(data) {
  if (!USE_MOCK) return http.post('/tools', data)
  const db = table('tools')
  const tool = { id: nextId('my-', db.custom), ...pick(data) }
  db.custom.push(tool)
  commit()
  return mock(normalize(tool, false))
}

/** PUT /api/tools/:id — user-added tools only */
export async function updateTool(id, data) {
  if (!USE_MOCK) return http.put(`/tools/${id}`, data)
  const db = table('tools')
  const i = db.custom.findIndex((t) => t.id === id)
  if (i < 0) throw new Error('Хэрэгсэл олдсонгүй')
  db.custom[i] = { ...db.custom[i], ...pick(data) }
  commit()
  return mock(normalize(db.custom[i], false))
}

/** DELETE /api/tools/:id — user-added tools only */
export async function deleteTool(id) {
  if (!USE_MOCK) return http.delete(`/tools/${id}`)
  const db = table('tools')
  db.custom = db.custom.filter((t) => t.id !== id)
  db.order = db.order.filter((x) => x !== id)
  commit()
  return mock(null)
}

/** PUT /api/tools/order { ids } */
export async function saveToolOrder(ids) {
  if (!USE_MOCK) return http.put('/tools/order', { ids })
  table('tools').order = [...ids]
  commit()
  return mock(null, 0)
}

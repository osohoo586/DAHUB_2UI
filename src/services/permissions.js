import { USE_MOCK, http, mock } from './client'
import permissions from '@/mock/permissions.json'
import { table, replace } from './mockDb'
import { clone } from '@/utils/clone'

/** GET /api/permissions → { modules, roles, actionLabels, matrix } */
export async function getPermissions() {
  if (!USE_MOCK) return http.get('/permissions')
  return mock({ ...permissions, matrix: table('matrix') }, 120)
}

/** PUT /api/permissions */
export async function savePermissions(matrix) {
  if (!USE_MOCK) return http.put('/permissions', { matrix })
  replace('matrix', clone(matrix))
  return mock(matrix, 80)
}

export function defaultMatrix() {
  return clone(permissions.matrix)
}

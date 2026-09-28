/**
 * Transport switch for the service layer.
 *
 *   VITE_API_MODE=mock  (default) — services read/write the local mock database (src/mock + localStorage)
 *   VITE_API_MODE=http            — services call the real API at VITE_API_BASE
 *
 * Views and stores only ever talk to services, so replacing the backend means
 * implementing the `http` branch of each service function — nothing else changes.
 */
import { clone } from '@/utils/clone'

export const API_MODE = import.meta.env.VITE_API_MODE || 'mock'
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'
export const USE_MOCK = API_MODE !== 'http'

let authToken = null
export function setAuthToken(token) {
  authToken = token
}

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message)
    this.status = status
    this.details = details
  }
}

export async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let details = null
    try {
      details = await res.json()
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(details?.message || `API алдаа (${res.status})`, res.status, details)
  }
  return res.status === 204 ? null : res.json()
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}

/** Resolve mock data after a short, realistic latency (deep-cloned so callers can't mutate the source). */
export function mock(data, ms) {
  const delay = ms ?? 180 + Math.round(Math.random() * 220)
  return new Promise((resolve) => setTimeout(() => resolve(data === undefined ? null : clone(data)), delay))
}

export function mockError(message, status = 400, ms = 260) {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(message, status)), ms))
}

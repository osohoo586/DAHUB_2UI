/**
 * A tiny localStorage-backed "backend" so demo edits (members, risks, news, permissions, tools)
 * survive a reload. Seeded from src/mock/*.json; reset via resetMockDb().
 */
import members from '@/mock/members.json'
import risks from '@/mock/risks.json'
import news from '@/mock/news.json'
import permissions from '@/mock/permissions.json'

import { clone } from '@/utils/clone'

const KEY = 'dahub.mockdb.v1'

function seed() {
  return {
    members: clone(members),
    risks: clone(risks),
    news: clone(news),
    matrix: clone(permissions.matrix),
    tools: { custom: [], order: [] }, // user-added tool cards + card order (ids)
  }
}

let db = null

function load() {
  if (db) return db
  try {
    const raw = localStorage.getItem(KEY)
    db = raw ? { ...seed(), ...JSON.parse(raw) } : seed()
  } catch {
    db = seed()
  }
  return db
}

export function table(name) {
  return load()[name]
}

export function commit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* storage full or blocked — keep working in memory */
  }
}

export function replace(name, value) {
  load()[name] = value
  commit()
}

export function resetMockDb() {
  db = seed()
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

export function nextId(prefix, list, key = 'id', pad = 3) {
  const max = list.reduce((m, item) => {
    const n = parseInt(String(item[key]).replace(/\D/g, ''), 10)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}

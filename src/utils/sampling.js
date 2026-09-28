/**
 * Audit sampling — sample size, margin of error and seeded random selection.
 *
 * Notation
 *   N  population size          n  sample size          z  normal quantile
 *   S  standard deviation (N−1)  E  margin of error      p  expected proportion
 *   W_h = N_h / N (stratum weight)
 *
 * Mean (value column selected)
 *   n₀ = (z·S / E)²
 *   SRSWR:  n = n₀                          E = z·S/√n
 *   SRSWOR: n = n₀ / (1 + n₀/N)             E = z·S·√((1 − n/N)/n)
 *
 * Proportion (no value column)
 *   n₀ = z²·p(1−p) / E²
 *   SRSWR:  n = n₀                          E = z·√(p(1−p)/n)
 *   SRSWOR: n = n₀ / (1 + (n₀−1)/N)         E = z·√(p(1−p)/n · (N−n)/(N−1))
 *
 * Stratified (WOR inside every stratum), allocation share a_h = n_h / n
 *   V(ȳ_st) = Σ W_h²·(1 − n_h/N_h)·S_h² / n_h,   E = z·√V
 *   n = Σ(W_h²·S_h² / a_h) / ((E/z)² + Σ W_h·S_h² / N)
 *   proportional a_h = W_h · Neyman a_h = W_h·S_h / Σ W_h·S_h · equal a_h = 1/H
 */
import { mulberry32, randInt } from './prng.js'

export const CONFIDENCE_LEVELS = [
  { value: 90, z: 1.6449 },
  { value: 95, z: 1.96 },
  { value: 99, z: 2.5758 },
]

export const zFor = (level) => CONFIDENCE_LEVELS.find((c) => c.value === level)?.z ?? 1.96

export const DESIGNS = [
  {
    id: 'srswr',
    label: 'SRSWR',
    title: 'Буцаалттай энгийн санамсаргүй түүвэр',
    description: 'Сонгогдсон мөр дахин сонгогдож болно. Хамгийн энгийн онолын загвар.',
    stratified: false,
    replacement: true,
  },
  {
    id: 'srswor',
    label: 'SRSWOR',
    title: 'Буцаалтгүй энгийн санамсаргүй түүвэр',
    description: 'Мөр бүр нэг л удаа сонгогдоно. Аудитын практикт хамгийн түгээмэл.',
    stratified: false,
    replacement: false,
  },
  {
    id: 'proportional',
    label: 'Proportional',
    title: 'Пропорциональ давхаргат түүвэр',
    description: 'Давхарга бүрээс эзлэх хувьтай нь тэнцүү хэмжээгээр сонгоно.',
    stratified: true,
    replacement: false,
  },
  {
    id: 'nonproportional',
    label: 'Non-proportional',
    title: 'Пропорциональ бус давхаргат түүвэр',
    description: 'Давхаргад тэнцүү, Neyman (хэлбэлзэлд суурилсан) эсвэл гараар хуваарилна.',
    stratified: true,
    replacement: false,
  },
]

export const ALLOCATIONS = [
  { id: 'equal', label: 'Тэнцүү' },
  { id: 'neyman', label: 'Neyman' },
  { id: 'manual', label: 'Гараар' },
]

export const designById = (id) => DESIGNS.find((d) => d.id === id)

/* ---------------------------------------------------------------- stats */

export function toNumber(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v !== 'string') return null
  const cleaned = v.replace(/[\s,₮]/g, '')
  if (cleaned === '' || !/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(cleaned)) return null
  return Number(cleaned)
}

export function describe(values) {
  const xs = values.map(toNumber).filter((v) => v != null)
  const n = xs.length
  if (n === 0) return { count: 0, mean: 0, sd: 0, variance: 0, min: 0, max: 0, sum: 0 }
  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (const x of xs) {
    sum += x
    if (x < min) min = x
    if (x > max) max = x
  }
  const mean = sum / n
  let ss = 0
  for (const x of xs) ss += (x - mean) ** 2
  const variance = n > 1 ? ss / (n - 1) : 0
  return { count: n, mean, sd: Math.sqrt(variance), variance, min, max, sum }
}

/** Infer column types from the first rows of a sheet. */
export function detectColumns(rows, sampleSize = 400) {
  if (!rows.length) return []
  const names = Object.keys(rows[0])
  const slice = rows.slice(0, sampleSize)
  return names.map((name) => {
    let numeric = 0
    let filled = 0
    const distinct = new Set()
    for (const r of slice) {
      const v = r[name]
      if (v === '' || v == null) continue
      filled++
      if (toNumber(v) != null) numeric++
      if (distinct.size < 200) distinct.add(String(v))
    }
    const isNumber = filled > 0 && numeric / filled > 0.9
    return {
      name,
      type: isNumber ? 'number' : 'text',
      distinct: distinct.size,
      // A column is a sensible stratum when it has a handful of categories.
      stratifiable: distinct.size >= 2 && distinct.size <= 24,
    }
  })
}

/* --------------------------------------------------------- simple random */

export function sampleSizeSimple({ N, z, E, S, p, replacement, mode }) {
  if (!(E > 0) || !(N > 0)) return 0
  if (mode === 'proportion') {
    const pq = p * (1 - p)
    const n0 = (z * z * pq) / (E * E)
    const n = replacement ? n0 : n0 / (1 + (n0 - 1) / N)
    return clampSize(Math.ceil(n - 1e-9), N, replacement)
  }
  const n0 = ((z * S) / E) ** 2
  const n = replacement ? n0 : n0 / (1 + n0 / N)
  return clampSize(Math.ceil(n - 1e-9), N, replacement)
}

export function marginSimple({ N, n, z, S, p, replacement, mode }) {
  if (!(n > 0)) return 0
  if (mode === 'proportion') {
    const pq = p * (1 - p)
    const fpc = replacement || N <= 1 ? 1 : (N - n) / (N - 1)
    return z * Math.sqrt((pq / n) * Math.max(fpc, 0))
  }
  const fpc = replacement ? 1 : Math.max(1 - n / N, 0)
  return z * S * Math.sqrt(fpc / n)
}

function clampSize(n, N, replacement) {
  const lo = Math.max(1, n)
  return replacement ? lo : Math.min(lo, N)
}

/* ------------------------------------------------------------ stratified */

/**
 * @param strata [{ key, N, S }]
 * @returns shares a_h summing to 1
 */
export function allocationShares(strata, allocation) {
  const total = strata.reduce((s, h) => s + h.N, 0)
  if (allocation === 'equal') return strata.map(() => 1 / strata.length)
  if (allocation === 'neyman') {
    const denom = strata.reduce((s, h) => s + (h.N / total) * h.S, 0)
    if (denom === 0) return strata.map((h) => h.N / total)
    return strata.map((h) => ((h.N / total) * h.S) / denom)
  }
  return strata.map((h) => h.N / total) // proportional
}

export function sampleSizeStratified({ strata, shares, z, E }) {
  const N = strata.reduce((s, h) => s + h.N, 0)
  if (!(E > 0) || !N) return 0
  let num = 0
  let corr = 0
  strata.forEach((h, i) => {
    const W = h.N / N
    const a = Math.max(shares[i], 1e-9)
    num += (W * W * h.S * h.S) / a
    corr += (W * h.S * h.S) / N
  })
  const n = num / ((E / z) ** 2 + corr)
  return Math.min(Math.max(Math.ceil(n - 1e-9), strata.length), N)
}

/** Largest-remainder rounding with 1 ≤ n_h ≤ N_h; leftovers go to strata with capacity. */
export function allocate(n, strata, shares) {
  const H = strata.length
  const raw = shares.map((a) => a * n)
  const alloc = raw.map((x, i) => Math.min(strata[i].N, Math.max(1, Math.floor(x))))
  let remaining = n - alloc.reduce((s, x) => s + x, 0)
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || strata[b.i].N - strata[a.i].N)
  let guard = 0
  while (remaining > 0 && guard++ < 10 * H + n) {
    let placed = false
    for (const { i } of order) {
      if (remaining <= 0) break
      if (alloc[i] < strata[i].N) {
        alloc[i]++
        remaining--
        placed = true
      }
    }
    if (!placed) break
  }
  // Over-allocation (from the 1-per-stratum floor): trim the largest strata.
  while (remaining < 0) {
    const i = alloc.indexOf(Math.max(...alloc))
    if (alloc[i] <= 1) break
    alloc[i]--
    remaining++
  }
  return alloc
}

export function marginStratified({ strata, alloc, z }) {
  const N = strata.reduce((s, h) => s + h.N, 0)
  let V = 0
  strata.forEach((h, i) => {
    const nh = alloc[i]
    if (!nh) return
    const W = h.N / N
    const fpc = Math.max(1 - nh / h.N, 0)
    V += (W * W * fpc * h.S * h.S) / nh
  })
  return z * Math.sqrt(V)
}

/** Group row indices by a stratum column; keeps first-seen order. */
export function buildStrata(rows, column, valueColumn, p = 0.5) {
  const groups = new Map()
  rows.forEach((row, index) => {
    const key = row[column] === '' || row[column] == null ? '(хоосон)' : String(row[column])
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(index)
  })
  return [...groups.entries()].map(([key, indices]) => {
    let S
    if (valueColumn) S = describe(indices.map((i) => rows[i][valueColumn])).sd
    else S = Math.sqrt(p * (1 - p))
    return { key, N: indices.length, S, indices }
  })
}

/* -------------------------------------------------------------- selection */

/** n draws with replacement from [0, N). Returns [{ order, index }]. */
export function selectWithReplacement(N, n, rand) {
  const out = []
  for (let k = 0; k < n; k++) out.push({ order: k + 1, index: randInt(rand, N) })
  return out
}

/** Partial Fisher–Yates: n distinct items from `pool` (array of indices). */
export function selectWithoutReplacement(pool, n, rand) {
  const a = pool.slice()
  const take = Math.min(n, a.length)
  for (let k = 0; k < take; k++) {
    const j = k + randInt(rand, a.length - k)
    ;[a[k], a[j]] = [a[j], a[k]]
  }
  return a.slice(0, take)
}

/**
 * Run a full sampling plan.
 * @returns { design, N, n, margin, z, S, seed, strata?, selection: [{order, index, stratum?, count?}] }
 */
export function runSampling({
  rows,
  design,
  confidence = 95,
  mode = 'margin', // 'margin' → compute n from E, 'size' → compute E from n
  margin,
  size,
  valueColumn = null,
  stratumColumn = null,
  allocation = 'proportional',
  manualAlloc = null,
  p = 0.5,
  seed = 1,
}) {
  const d = designById(design)
  const N = rows.length
  const z = zFor(confidence)
  const measure = valueColumn ? 'mean' : 'proportion'
  const rand = mulberry32(seed)

  if (!d.stratified) {
    const S = valueColumn ? describe(rows.map((r) => r[valueColumn])).sd : Math.sqrt(p * (1 - p))
    const n =
      mode === 'margin'
        ? sampleSizeSimple({ N, z, E: margin, S, p, replacement: d.replacement, mode: measure })
        : clampSize(Math.round(size), N, d.replacement)
    const E = marginSimple({ N, n, z, S, p, replacement: d.replacement, mode: measure })
    let selection
    if (d.replacement) {
      selection = selectWithReplacement(N, n, rand)
      const counts = new Map()
      selection.forEach((s) => counts.set(s.index, (counts.get(s.index) || 0) + 1))
      selection.forEach((s) => (s.count = counts.get(s.index)))
    } else {
      const pool = Array.from({ length: N }, (_, i) => i)
      selection = selectWithoutReplacement(pool, n, rand).map((index, k) => ({ order: k + 1, index }))
    }
    return { design, measure, N, n, margin: E, z, S, p, seed, confidence, selection }
  }

  const strata = buildStrata(rows, stratumColumn, valueColumn, p)
  const allocKey = design === 'proportional' ? 'proportional' : allocation
  const shares =
    allocKey === 'manual' && manualAlloc
      ? normaliseShares(strata.map((h) => manualAlloc[h.key] ?? 0))
      : allocationShares(strata, allocKey)

  let n
  let alloc
  if (allocKey === 'manual' && manualAlloc) {
    alloc = strata.map((h) => Math.min(h.N, Math.max(0, Math.round(manualAlloc[h.key] ?? 0))))
    n = alloc.reduce((s, x) => s + x, 0)
  } else {
    n =
      mode === 'margin'
        ? sampleSizeStratified({ strata, shares, z, E: margin })
        : Math.min(Math.max(Math.round(size), strata.length), N)
    alloc = allocate(n, strata, shares)
  }
  const E = marginStratified({ strata, alloc, z })
  const S = valueColumn ? describe(rows.map((r) => r[valueColumn])).sd : Math.sqrt(p * (1 - p))

  let order = 0
  const selection = []
  strata.forEach((h, i) => {
    selectWithoutReplacement(h.indices, alloc[i], rand).forEach((index) => {
      selection.push({ order: ++order, index, stratum: h.key })
    })
  })

  return {
    design,
    measure,
    N,
    n,
    margin: E,
    z,
    S,
    p,
    seed,
    confidence,
    allocation: allocKey,
    strata: strata.map((h, i) => ({
      key: h.key,
      N: h.N,
      W: h.N / N,
      S: h.S,
      n: alloc[i],
      f: h.N ? alloc[i] / h.N : 0,
    })),
    selection,
  }
}

function normaliseShares(values) {
  const total = values.reduce((s, x) => s + x, 0)
  if (!total) return values.map(() => 1 / values.length)
  return values.map((x) => x / total)
}

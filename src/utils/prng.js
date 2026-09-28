/**
 * Seeded pseudo-random generator (mulberry32).
 * Audit sampling must be reproducible: the same seed always yields the same sample.
 */
export function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Uniform integer in [0, n). */
export function randInt(rand, n) {
  return Math.floor(rand() * n)
}

/** A fresh 6-digit seed for the UI. */
export function newSeed() {
  return 100000 + Math.floor(Math.random() * 900000)
}

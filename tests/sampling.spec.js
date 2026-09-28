import { describe as suite, it, expect } from 'vitest'
import {
  sampleSizeSimple,
  marginSimple,
  sampleSizeStratified,
  allocate,
  allocationShares,
  marginStratified,
  describe,
  runSampling,
  selectWithoutReplacement,
} from '../src/utils/sampling.js'
import { mulberry32 } from '../src/utils/prng.js'

suite('simple random sample size', () => {
  it('mean, SRSWOR with FPC: S=1000, E=100, 95%, N=1250 → 294', () => {
    // n0 = (1.96·1000/100)² = 384.16; n = 384.16 / (1 + 384.16/1250) = 293.85
    const n = sampleSizeSimple({ N: 1250, z: 1.96, E: 100, S: 1000, replacement: false, mode: 'mean' })
    expect(n).toBe(294)
    const E = marginSimple({ N: 1250, n, z: 1.96, S: 1000, replacement: false, mode: 'mean' })
    expect(E).toBeLessThanOrEqual(100)
    expect(E).toBeCloseTo(99.97, 1)
  })

  it('mean, SRSWR ignores FPC → ceil(384.16) = 385', () => {
    expect(sampleSizeSimple({ N: 1250, z: 1.96, E: 100, S: 1000, replacement: true, mode: 'mean' })).toBe(385)
  })

  it('proportion p=0.5, E=5%, 95%, N=1250 → 295 (Cochran)', () => {
    // n0 = 384.16; n = 384.16 / (1 + 383.16/1250) = 294.03
    expect(sampleSizeSimple({ N: 1250, z: 1.96, E: 0.05, p: 0.5, replacement: false, mode: 'proportion' })).toBe(295)
  })

  it('never exceeds N without replacement', () => {
    expect(sampleSizeSimple({ N: 40, z: 2.5758, E: 1, S: 1000, replacement: false, mode: 'mean' })).toBeLessThanOrEqual(40)
  })

  it('margin shrinks to 0 when the whole population is sampled', () => {
    expect(marginSimple({ N: 50, n: 50, z: 1.96, S: 10, replacement: false, mode: 'mean' })).toBe(0)
  })
})

suite('descriptive stats', () => {
  it('uses the N−1 standard deviation and parses formatted numbers', () => {
    const d = describe([2, 4, 4, 4, 5, 5, 7, '9'])
    expect(d.mean).toBe(5)
    expect(d.sd).toBeCloseTo(2.13809, 4)
    expect(describe(['1,000', '₮2,000']).sum).toBe(3000)
  })
})

suite('stratified allocation', () => {
  const strata = [
    { key: 'A', N: 600, S: 50 },
    { key: 'B', N: 300, S: 200 },
    { key: 'C', N: 100, S: 20 },
  ]

  it('proportional shares equal weights', () => {
    expect(allocationShares(strata, 'proportional')).toEqual([0.6, 0.3, 0.1])
  })

  it('Neyman favours high-variance strata', () => {
    const s = allocationShares(strata, 'neyman')
    // W·S: 30, 60, 2 → shares 30/92, 60/92, 2/92
    expect(s[1]).toBeCloseTo(60 / 92, 6)
    expect(s.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9)
  })

  it('largest remainder sums exactly to n and respects 1 ≤ n_h ≤ N_h', () => {
    const alloc = allocate(101, strata, [0.6, 0.3, 0.1])
    expect(alloc.reduce((a, b) => a + b, 0)).toBe(101)
    expect(alloc).toEqual([61, 30, 10])
    const tiny = allocate(5, [{ N: 2 }, { N: 1000 }, { N: 1 }], [0.1, 0.8, 0.1])
    expect(tiny.reduce((a, b) => a + b, 0)).toBe(5)
    expect(tiny[0]).toBeLessThanOrEqual(2)
    expect(tiny[2]).toBe(1)
  })

  it('stratified size meets the requested margin', () => {
    const shares = allocationShares(strata, 'proportional')
    const n = sampleSizeStratified({ strata, shares, z: 1.96, E: 5 })
    const alloc = allocate(n, strata, shares)
    const E = marginStratified({ strata, alloc, z: 1.96 })
    expect(E).toBeLessThanOrEqual(5.05)
  })
})

suite('selection is reproducible', () => {
  it('same seed → same sample; different seed → different sample', () => {
    const pool = Array.from({ length: 500 }, (_, i) => i)
    const a = selectWithoutReplacement(pool, 30, mulberry32(4242))
    const b = selectWithoutReplacement(pool, 30, mulberry32(4242))
    const c = selectWithoutReplacement(pool, 30, mulberry32(4243))
    expect(a).toEqual(b)
    expect(a).not.toEqual(c)
    expect(new Set(a).size).toBe(30)
  })

  it('runSampling: SRSWR counts duplicates, stratified keeps strata', () => {
    const rows = Array.from({ length: 200 }, (_, i) => ({ id: i, amount: (i % 17) * 100, branch: ['A', 'B', 'C', 'D'][i % 4] }))
    const wr = runSampling({ rows, design: 'srswr', mode: 'size', size: 150, seed: 7 })
    expect(wr.selection).toHaveLength(150)
    expect(wr.selection.some((s) => s.count > 1)).toBe(true)

    const st = runSampling({ rows, design: 'proportional', mode: 'size', size: 40, stratumColumn: 'branch', valueColumn: 'amount', seed: 7 })
    expect(st.n).toBe(40)
    expect(st.strata.map((s) => s.n)).toEqual([10, 10, 10, 10])
    expect(st.selection.every((s) => rows[s.index].branch === s.stratum)).toBe(true)

    const manual = runSampling({
      rows, design: 'nonproportional', allocation: 'manual', manualAlloc: { A: 5, B: 3, C: 0, D: 2 },
      stratumColumn: 'branch', seed: 7,
    })
    expect(manual.n).toBe(10)
  })
})

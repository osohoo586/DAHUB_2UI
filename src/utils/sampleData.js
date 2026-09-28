/**
 * Seeded demo population for the sampling tool: 1,250 loan records.
 * Deterministic, so screenshots and walkthroughs always match.
 */
import { mulberry32 } from './prng.js'

const BRANCHES = [
  { name: 'Төв салбар', weight: 0.22 },
  { name: 'Сүхбаатар', weight: 0.16 },
  { name: 'Баянзүрх', weight: 0.15 },
  { name: 'Хан-Уул', weight: 0.13 },
  { name: 'Дархан', weight: 0.09 },
  { name: 'Эрдэнэт', weight: 0.09 },
  { name: 'Чингэлтэй', weight: 0.08 },
  { name: 'Сонгинохайрхан', weight: 0.08 },
]

const PRODUCTS = [
  { name: 'Цалингийн зээл', mean: 18e6, sd: 7e6 },
  { name: 'Ипотекийн зээл', mean: 142e6, sd: 48e6 },
  { name: 'Бизнесийн зээл', mean: 265e6, sd: 160e6 },
  { name: 'Автомашины зээл', mean: 46e6, sd: 15e6 },
  { name: 'Хэрэглээний зээл', mean: 9e6, sd: 4e6 },
]

const STATUS = ['Хэвийн', 'Хэвийн', 'Хэвийн', 'Хэвийн', 'Анхаарал хандуулах', 'Хугацаа хэтэрсэн']

function pick(rand, list) {
  const r = rand()
  let acc = 0
  for (const item of list) {
    acc += item.weight
    if (r <= acc) return item
  }
  return list[list.length - 1]
}

function normal(rand) {
  // Box–Muller
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function generateLoanPopulation(size = 1250, seed = 20260927) {
  const rand = mulberry32(seed)
  const rows = []
  for (let i = 0; i < size; i++) {
    const branch = pick(rand, BRANCHES).name
    const product = PRODUCTS[Math.floor(rand() * PRODUCTS.length)]
    const amount = Math.max(1.5e6, Math.round((product.mean + normal(rand) * product.sd) / 1000) * 1000)
    const month = 1 + Math.floor(rand() * 9)
    const day = 1 + Math.floor(rand() * 28)
    rows.push({
      'Зээлийн дугаар': `LN-26${String(10000 + i * 7).padStart(6, '0')}`,
      'Салбар': branch,
      'Бүтээгдэхүүн': product.name,
      'Олгосон огноо': `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      'Зээлийн дүн': amount,
      'Хүү (%)': Math.round((14 + rand() * 8) * 10) / 10,
      'Хугацаа (сар)': [12, 24, 36, 60, 120, 240][Math.floor(rand() * 6)],
      'Төлөв': STATUS[Math.floor(rand() * STATUS.length)],
    })
  }
  return rows
}

/** Number, currency and date formatting for Mongolian UI. */

const nf = new Map()
function formatter(opts) {
  const key = JSON.stringify(opts)
  if (!nf.has(key)) nf.set(key, new Intl.NumberFormat('en-US', opts))
  return nf.get(key)
}

/** 1,234,567 — thousands with comma (bank convention), fixed decimals. */
export function formatNumber(value, decimals = 0) {
  if (value == null || Number.isNaN(value)) return '—'
  return formatter({ minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

export function formatPercent(value, decimals = 1) {
  if (value == null || Number.isNaN(value)) return '—'
  return `${formatNumber(value, decimals)}%`
}

/** Compact MNT: 14.82 их наяд ₮ / 412.6 тэрбум ₮ / 18.4 сая ₮. */
export function formatMnt(value, decimals = 1) {
  const abs = Math.abs(value)
  if (abs >= 1e12) return `${formatNumber(value / 1e12, 2)} их наяд ₮`
  if (abs >= 1e9) return `${formatNumber(value / 1e9, decimals)} тэрбум ₮`
  if (abs >= 1e6) return `${formatNumber(value / 1e6, decimals)} сая ₮`
  return `${formatNumber(value, 0)} ₮`
}

/** Compact large values for tiles: 4.70 сая, 1.25 тэрбум; small values keep full precision. */
export function formatCompact(value, decimals = 2) {
  const abs = Math.abs(value)
  if (abs >= 1e12) return `${formatNumber(value / 1e12, decimals)} их наяд`
  if (abs >= 1e9) return `${formatNumber(value / 1e9, decimals)} тэрбум`
  if (abs >= 1e6) return `${formatNumber(value / 1e6, decimals)} сая`
  return formatNumber(value, abs < 10 ? 2 : 0)
}

export function formatSigned(value, decimals = 1, suffix = '%') {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±'
  return `${sign}${formatNumber(Math.abs(value), decimals)}${suffix}`
}

const MONTHS = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']
const WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба']

export const monthLabel = (index) => MONTHS[index]

function toDate(input) {
  return input instanceof Date ? input : new Date(input)
}

/** 2026.09.27 */
export function formatDate(input) {
  const d = toDate(input)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

/** 2026 оны 9-р сарын 27 */
export function formatDateLong(input) {
  const d = toDate(input)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`
}

export function formatWeekday(input) {
  return WEEKDAYS[toDate(input).getDay()]
}

export function formatTime(input) {
  const d = toDate(input)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}`
}

export function formatDateTime(input) {
  return `${formatDate(input)} · ${formatTime(input)}`
}

/** "3 хоногийн өмнө", "өнөөдөр" … */
export function formatRelative(input, now = new Date()) {
  const d = toDate(input)
  const diffMin = Math.round((now - d) / 60000)
  if (diffMin < 1) return 'саяхан'
  if (diffMin < 60) return `${diffMin} минутын өмнө`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH} цагийн өмнө`
  const diffD = Math.round(diffH / 24)
  if (diffD === 1) return 'өчигдөр'
  if (diffD < 30) return `${diffD} хоногийн өмнө`
  return formatDate(d)
}

/** Days until a date (negative = overdue). */
export function daysUntil(input, now = new Date()) {
  const d = toDate(input)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((end - start) / 86400000)
}

export function initials(lastName = '', firstName = '') {
  return `${(lastName[0] || '').toUpperCase()}${(firstName[0] || '').toUpperCase()}`
}

/** "Б. Энхжаргал" */
export function shortName(member) {
  if (!member) return ''
  return `${member.lastName?.[0] || ''}. ${member.firstName}`
}

export function fullName(member) {
  if (!member) return ''
  return `${member.lastName} ${member.firstName}`
}

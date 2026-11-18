// Small helpers for the "YYYY-MM-DD" dates the database stores.

// Today's date as "YYYY-MM-DD" in the user's own time zone.
export function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Turn "2026-11-20" into a Date at local midnight. (new Date("2026-11-20")
// would use UTC midnight, which shows as the day before on the East Coast.)
export function parseDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "2026-11-20" -> "Nov 20"
export function shortDate(value) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
}

// How many days from today until a date. Negative means it already passed.
export function daysUntil(value) {
  const date = parseDate(value)
  if (!date) return null
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((date - todayMidnight) / 86_400_000)
}

// Friendly wording: "today", "tomorrow", "in 3 days", "2 days ago"
export function relativeDay(value) {
  const days = daysUntil(value)
  if (days === null) return ''
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  if (days > 1 && days <= 6) return `in ${days} days`
  if (days < -1 && days >= -6) return `${-days} days ago`
  return shortDate(value)
}

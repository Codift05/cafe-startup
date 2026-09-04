// ============================================================
// Date Formatting Utilities
// ============================================================

/**
 * Format ISO date to localized string.
 * formatDate("2026-09-03T10:30:00Z") → "3 Sep 2026, 17:30"
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Format ISO date to time only.
 * formatTime("2026-09-03T10:30:00Z") → "17:30"
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Get relative elapsed time.
 * getElapsedMinutes("2026-09-03T10:30:00Z") → 5
 */
export function getElapsedMinutes(iso: string): number {
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / 60_000)
}

/**
 * Format elapsed time for display.
 * formatElapsed(5) → "5m"
 * formatElapsed(65) → "1h 5m"
 */
export function formatElapsed(minutes: number): string {
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Check if a date string is older than given milliseconds.
 */
export function isExpired(iso: string, ttlMs: number): boolean {
  return Date.now() - new Date(iso).getTime() > ttlMs
}

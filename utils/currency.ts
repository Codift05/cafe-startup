// ============================================================
// Currency Formatting Utilities
// ============================================================

/**
 * Format number to Indonesian Rupiah.
 * formatRupiah(28000) → "Rp28.000"
 * formatRupiah(5000, true) → "+Rp5.000"
 */
export function formatRupiah(amount: number, showPlus = false): string {
  const prefix = showPlus && amount > 0 ? '+' : ''
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return `${prefix}${formatted}`
}

/**
 * Format number to compact Rupiah.
 * formatRupiahCompact(28000) → "Rp28rb"
 */
export function formatRupiahCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}jt`
  }
  if (amount >= 1_000) {
    return `Rp${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}rb`
  }
  return `Rp${amount}`
}

/** Alias formatRp for convenience */
export const formatRp = formatRupiah


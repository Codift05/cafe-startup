// ============================================================
// Order Number Generator
// ============================================================

import { createError } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ORDER_NUMBER_PREFIX } from '~/utils/constants'

/**
 * Generate the next order number for a branch using an atomic PostgreSQL function.
 * Format: PH0001, PH0002, ... (resets daily)
 */
export async function generateOrderNumber(
  supabase: SupabaseClient,
  branchId: string,
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data, error } = await supabase.rpc('next_order_number', {
    p_branch_id: branchId,
    p_date: today,
  })

  if (error) {
    throw createError({
      statusCode: 500,
      message: 'Gagal membuat nomor pesanan',
    })
  }

  return `${ORDER_NUMBER_PREFIX}${String(data).padStart(4, '0')}`
}

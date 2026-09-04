// ============================================================
// PATCH /api/staff/orders/:id/status — Update order status (Barista KDS)
// ============================================================

import { z } from 'zod'
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { ORDER_TRANSITIONS } from '~/utils/constants'
import type { OrderStatus } from '~/types/order'
import { requireAuth, requireRole } from '~/server/utils/auth'
import { UserRole } from '~/types/user'

const statusSchema = z.object({
  status: z.enum(['PAID', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  requireRole(user, [UserRole.BARISTA, UserRole.ADMIN, UserRole.OWNER])

  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const result = statusSchema.safeParse(body)

  if (!orderId || !result.success) {
    throw createError({ statusCode: 400, message: 'ID pesanan dan status target wajib valid' })
  }

  const targetStatus = result.data.status as OrderStatus
  const supabase = getSupabaseAdmin()

  // Find current status
  const { data: order } = await supabase
    .from('orders')
    .select('id, status, order_number')
    .eq('id', orderId)
    .eq('branch_id', user.branch_id)
    .single()

  if (!order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan' })
  }

  const currentStatus = order.status as OrderStatus

  // Validate state machine transition
  const validNextStatuses = ORDER_TRANSITIONS[currentStatus] || []
  if (!validNextStatuses.includes(targetStatus)) {
    throw createError({
      statusCode: 400,
      message: `Transisi status tidak valid: ${currentStatus} → ${targetStatus}`,
    })
  }

  // Update Status
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: targetStatus })
    .eq('id', orderId)
    .eq('branch_id', user.branch_id)

  if (updateErr) {
    throw createError({ statusCode: 500, message: 'Gagal memperbarui status pesanan' })
  }

  // Record History
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    from_status: currentStatus,
    to_status: targetStatus,
    source: 'STAFF',
    changed_by: user.id,
    notes: `Barista KDS update: ${currentStatus} -> ${targetStatus}`,
  })

  return {
    success: true,
    data: {
      id: orderId,
      order_number: order.order_number,
      previous_status: currentStatus,
      status: targetStatus,
    },
  }
})

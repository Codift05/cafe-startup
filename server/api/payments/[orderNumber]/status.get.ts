// ============================================================
// GET /api/payments/:orderNumber/status — Get Payment & Order Status
// ============================================================

import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const orderNumber = getRouterParam(event, 'orderNumber')

  if (!orderNumber) {
    throw createError({ statusCode: 400, message: 'Nomor pesanan wajib diisi' })
  }

  const supabase = getSupabaseAdmin()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payments (
        id,
        payment_method,
        status,
        amount,
        paid_at
      )
    `)
    .eq('order_number', orderNumber)
    .single()

  if (error || !order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan' })
  }

  const payment = (order.payments && order.payments.length > 0) ? order.payments[0] : null

  return {
    success: true,
    data: {
      order_number: order.order_number,
      order_status: order.status,
      payment_status: payment?.status || 'PENDING',
      payment_method: payment?.payment_method || null,
      paid_at: payment?.paid_at || null,
    },
  }
})

// ============================================================
// GET /api/orders/:orderNumber — Get Order Details for Tracking
// ============================================================

import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const orderNumber = getRouterParam(event, 'orderNumber')

  if (!orderNumber) {
    throw createError({ statusCode: 400, message: 'Nomor pesanan wajib diisi' })
  }

  const supabase = getSupabaseAdmin()

  // Fetch Order with Table, Items, Modifiers, Payment
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_type,
      customer_name,
      customer_phone,
      status,
      subtotal,
      total,
      created_at,
      tables (table_number),
      order_items (
        id,
        product_name_snapshot,
        variant_name_snapshot,
        base_price_snapshot,
        variant_price_snapshot,
        quantity,
        unit_price,
        subtotal,
        notes,
        order_item_modifiers (
          id,
          modifier_name_snapshot,
          modifier_group_name_snapshot,
          price_adjustment_snapshot
        )
      ),
      payments (
        id,
        payment_method,
        status,
        amount,
        paid_at,
        snap_token
      )
    `)
    .eq('order_number', orderNumber)
    .single()

  if (error || !order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan' })
  }

  return {
    success: true,
    data: {
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      table_number: (order as any).tables?.table_number || null,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      status: order.status,
      subtotal: order.subtotal,
      total: order.total,
      created_at: order.created_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        product_name: item.product_name_snapshot,
        variant_name: item.variant_name_snapshot,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        notes: item.notes,
        modifiers: (item.order_item_modifiers || []).map((mod: any) => ({
          name: mod.modifier_name_snapshot,
          group: mod.modifier_group_name_snapshot,
          price: mod.price_adjustment_snapshot,
        })),
      })),
      payment: (order.payments && order.payments.length > 0) ? {
        id: order.payments[0].id,
        method: order.payments[0].payment_method,
        status: order.payments[0].status,
        amount: order.payments[0].amount,
        paid_at: order.payments[0].paid_at,
        snap_token: order.payments[0].snap_token,
      } : null,
    },
  }
})

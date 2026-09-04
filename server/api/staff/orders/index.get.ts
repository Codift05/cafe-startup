// ============================================================
// GET /api/staff/orders — Fetch active orders for KDS
// ============================================================

import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const statusFilter = query.status ? (query.status as string).split(',') : ['PAID', 'PREPARING', 'READY']

  const supabase = getSupabaseAdmin()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_type,
      customer_name,
      status,
      created_at,
      tables (table_number),
      order_items (
        id,
        product_name_snapshot,
        variant_name_snapshot,
        quantity,
        notes,
        order_item_modifiers (
          modifier_name_snapshot,
          modifier_group_name_snapshot
        )
      )
    `)
    .in('status', statusFilter)
    .order('created_at', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, message: 'Gagal mengambil antrean KDS' })
  }

  return {
    success: true,
    data: (orders || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      table_number: order.tables?.table_number || null,
      customer_name: order.customer_name,
      status: order.status,
      created_at: order.created_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        product_name: item.product_name_snapshot,
        variant_name: item.variant_name_snapshot,
        quantity: item.quantity,
        notes: item.notes,
        modifiers: (item.order_item_modifiers || []).map((mod: any) => mod.modifier_name_snapshot),
      })),
    })),
  }
})

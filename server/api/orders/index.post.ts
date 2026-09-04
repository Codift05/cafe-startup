// ============================================================
// POST /api/orders — Create Order API
// ============================================================

import { z } from 'zod'
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { calculateOrderPrices } from '~/server/utils/price-calculator'
import { DEFAULT_BRANCH_ID } from '~/utils/constants'
import { MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from '~/utils/constants'

const createOrderSchema = z.object({
  order_type: z.enum(['DINE_IN', 'PICKUP']),
  table_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().trim().min(1, 'Nama pemesan wajib diisi').max(100),
  customer_phone: z.string().trim().regex(/^[0-9+()\s-]{8,20}$/, 'Nomor telepon tidak valid').optional(),
  idempotency_key: z.string().min(1).max(64).optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullable().optional(),
      modifier_ids: z.array(z.string().uuid()).max(20).refine(ids => new Set(ids).size === ids.length, 'Modifier tidak boleh duplikat').default([]),
      quantity: z.number().int().min(1).max(MAX_ITEM_QUANTITY),
      notes: z.string().trim().max(200).nullable().optional(),
    })
  ).min(1, 'Pesanan minimal berisi 1 item').max(MAX_CART_ITEMS),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createOrderSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0]?.message || 'Data pesanan tidak valid',
    })
  }

  const { order_type, table_id, customer_name, customer_phone, idempotency_key, items } = result.data

  // Validate Dine In table constraint
  if (order_type === 'DINE_IN' && !table_id) {
    throw createError({
      statusCode: 400,
      message: 'Meja wajib ditentukan untuk pesanan Dine In',
    })
  }

  const supabase = getSupabaseAdmin()

  // Check operational settings (cafe open / ordering paused)
  const { data: branch } = await supabase
    .from('branches')
    .select('is_active, ordering_paused, dine_in_enabled, pickup_enabled')
    .eq('id', DEFAULT_BRANCH_ID)
    .single()

  if (branch) {
    if (!branch.is_active || branch.ordering_paused) {
      throw createError({
        statusCode: 403,
        message: 'Pemesanan cafe sedang dihentikan sementara (Paused). Silakan coba lagi nanti.',
      })
    }
    if (order_type === 'DINE_IN' && !branch.dine_in_enabled) {
      throw createError({ statusCode: 403, message: 'Layanan Dine In sedang tidak aktif' })
    }
    if (order_type === 'PICKUP' && !branch.pickup_enabled) {
      throw createError({ statusCode: 403, message: 'Layanan Pickup sedang tidak aktif' })
    }
  } else {
    throw createError({ statusCode: 503, message: 'Cabang tidak tersedia' })
  }

  if (order_type === 'DINE_IN') {
    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('id', table_id)
      .eq('branch_id', DEFAULT_BRANCH_ID)
      .eq('status', 'ACTIVE')
      .single()

    if (!table) {
      throw createError({ statusCode: 422, message: 'Meja tidak valid atau sedang tidak aktif' })
    }
  }

  // Calculate and validate prices and availability server-side
  const normalizedItems = items.map(item => ({ ...item, variant_id: item.variant_id ?? null }))
  const priceResult = await calculateOrderPrices(supabase, normalizedItems, DEFAULT_BRANCH_ID)

  if (priceResult.sold_out_items.length > 0) {
    const soldOutNames = priceResult.sold_out_items.map(i => i.product_name).join(', ')
    throw createError({
      statusCode: 422,
      message: `Menu berikut telah habis (Sold Out): ${soldOutNames}`,
    })
  }

  const atomicItems = priceResult.items.map((item, index) => ({
    ...item,
    notes: items[index]?.notes || null,
  }))
  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_branch_id: DEFAULT_BRANCH_ID,
    p_order_type: order_type,
    p_table_id: order_type === 'DINE_IN' ? table_id : null,
    p_customer_name: customer_name,
    p_customer_phone: customer_phone || null,
    p_subtotal: priceResult.subtotal,
    p_total: priceResult.total,
    p_idempotency_key: idempotency_key || null,
    p_items: atomicItems,
  })

  if (error || !data) {
    console.error('Atomic order creation failed:', error)
    throw createError({ statusCode: 500, message: 'Gagal menyimpan pesanan ke database' })
  }

  return data
})

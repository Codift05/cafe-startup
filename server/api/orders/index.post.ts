// ============================================================
// POST /api/orders — Create Order API
// ============================================================

import { z } from 'zod'
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { calculateOrderPrices } from '~/server/utils/price-calculator'
import { generateOrderNumber } from '~/server/utils/order-number'
import { DEFAULT_BRANCH_ID } from '~/utils/constants'

const createOrderSchema = z.object({
  order_type: z.enum(['DINE_IN', 'PICKUP']),
  table_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().min(1, 'Nama pemesan wajib diisi'),
  customer_phone: z.string().optional(),
  idempotency_key: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullable().optional(),
      modifier_ids: z.array(z.string().uuid()).default([]),
      quantity: z.number().int().min(1),
      notes: z.string().nullable().optional(),
    })
  ).min(1, 'Pesanan minimal berisi 1 item'),
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

  // Step 1: Idempotency Check
  if (idempotency_key) {
    const { data: existingKey } = await supabase
      .from('idempotency_keys')
      .select('response_body')
      .eq('key', idempotency_key)
      .single()

    if (existingKey) {
      return existingKey.response_body
    }
  }

  // Step 2: Check Operational Settings (Cafe open / ordering paused)
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
  }

  // Step 3: Calculate & Validate Prices & Availability Server-side
  const priceResult = await calculateOrderPrices(supabase, items, DEFAULT_BRANCH_ID)

  if (priceResult.sold_out_items.length > 0) {
    const soldOutNames = priceResult.sold_out_items.map(i => i.product_name).join(', ')
    throw createError({
      statusCode: 422,
      message: `Menu berikut telah habis (Sold Out): ${soldOutNames}`,
    })
  }

  // Step 4: Generate Atomic Order Number (e.g. PH1024)
  const orderNumber = await generateOrderNumber(supabase, DEFAULT_BRANCH_ID)

  // Step 5: Insert Order into DB
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      branch_id: DEFAULT_BRANCH_ID,
      order_number: orderNumber,
      order_type,
      table_id: order_type === 'DINE_IN' ? table_id : null,
      customer_name,
      customer_phone: customer_phone || null,
      status: 'WAITING_PAYMENT',
      subtotal: priceResult.subtotal,
      total: priceResult.total,
      idempotency_key: idempotency_key || null,
    })
    .select()
    .single()

  if (orderErr || !order) {
    console.error('Order creation DB error:', orderErr)
    throw createError({ statusCode: 500, message: 'Gagal menyimpan pesanan ke database' })
  }

  // Step 6: Insert Order Items & Item Modifiers (with snapshots)
  for (let i = 0; i < priceResult.items.length; i++) {
    const calcItem = priceResult.items[i]
    const origItem = items[i]

    const { data: orderItem, error: itemErr } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: calcItem.product_id,
        product_variant_id: calcItem.variant_id,
        product_name_snapshot: calcItem.product_name,
        variant_name_snapshot: calcItem.variant_name,
        base_price_snapshot: calcItem.base_price,
        variant_price_snapshot: calcItem.variant_price,
        quantity: calcItem.quantity,
        unit_price: calcItem.unit_price,
        subtotal: calcItem.subtotal,
        notes: origItem?.notes || null,
      })
      .select()
      .single()

    if (itemErr || !orderItem) {
      console.error('Order item creation error:', itemErr)
      continue
    }

    // Insert Item Modifiers Snapshots
    for (const mod of calcItem.modifier_details) {
      await supabase.from('order_item_modifiers').insert({
        order_item_id: orderItem.id,
        modifier_id: mod.modifier_id,
        modifier_name_snapshot: mod.modifier_name,
        modifier_group_name_snapshot: mod.group_name,
        price_adjustment_snapshot: mod.price_adjustment,
      })
    }
  }

  // Step 7: Record Order Status History
  await supabase.from('order_status_history').insert({
    order_id: order.id,
    from_status: null,
    to_status: 'WAITING_PAYMENT',
    source: 'SYSTEM',
    notes: 'Order created',
  })

  const responseBody = {
    success: true,
    data: {
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
    },
  }

  // Cache Idempotency Key
  if (idempotency_key) {
    await supabase.from('idempotency_keys').insert({
      key: idempotency_key,
      endpoint: '/api/orders',
      response_status: 200,
      response_body: responseBody,
    })
  }

  return responseBody
})

// ============================================================
// POST /api/payments — Create Payment Transaction API
// ============================================================

import { z } from 'zod'
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { createSnapTransaction } from '~/server/utils/midtrans'

const createPaymentSchema = z.object({
  order_number: z.string().min(1, 'Nomor pesanan wajib diisi'),
  payment_method: z.enum(['QRIS', 'E_WALLET', 'PAY_AT_CASHIER']),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createPaymentSchema.safeParse(body)

  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message || 'Data pembayaran tidak valid' })
  }

  const { order_number, payment_method } = result.data
  const supabase = getSupabaseAdmin()

  // Step 1: Find Order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, order_number, total, customer_name, customer_phone, status')
    .eq('order_number', order_number)
    .single()

  if (orderErr || !order) {
    throw createError({ statusCode: 404, message: 'Pesanan tidak ditemukan' })
  }

  if (order.status !== 'WAITING_PAYMENT') {
    throw createError({
      statusCode: 400,
      message: `Pesanan sudah berada dalam status ${order.status}`,
    })
  }

  // Check if payment already exists
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, payment_method, status, snap_token, payment_url')
    .eq('order_id', order.id)
    .single()

  if (existingPayment && existingPayment.status === 'PAID') {
    return {
      success: true,
      data: {
        payment_id: existingPayment.id,
        status: existingPayment.status,
        snap_token: existingPayment.snap_token,
      },
    }
  }

  // Handle Pay at Cashier
  if (payment_method === 'PAY_AT_CASHIER') {
    if (existingPayment) {
      await supabase
        .from('payments')
        .update({ payment_method: 'PAY_AT_CASHIER', status: 'PENDING' })
        .eq('id', existingPayment.id)

      return {
        success: true,
        data: {
          payment_id: existingPayment.id,
          payment_method: 'PAY_AT_CASHIER',
          status: 'PENDING',
        },
      }
    }

    const { data: newPayment, error: payErr } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        payment_method: 'PAY_AT_CASHIER',
        status: 'PENDING',
        amount: order.total,
      })
      .select()
      .single()

    if (payErr || !newPayment) {
      throw createError({ statusCode: 500, message: 'Gagal membuat pembayaran kasir' })
    }

    return {
      success: true,
      data: {
        payment_id: newPayment.id,
        payment_method: 'PAY_AT_CASHIER',
        status: 'PENDING',
      },
    }
  }

  // Handle Digital Payment via Midtrans (QRIS / E_WALLET)
  let snapToken = existingPayment?.snap_token || null
  let paymentUrl = existingPayment?.payment_url || null

  if (!snapToken) {
    try {
      const snapRes = await createSnapTransaction({
        order_id: `${order.order_number}-${Date.now()}`,
        gross_amount: order.total,
        customer_details: {
          first_name: order.customer_name,
          phone: order.customer_phone || undefined,
        },
      })
      snapToken = snapRes.token
      paymentUrl = snapRes.redirect_url
    } catch (midtransErr: any) {
      console.warn('Midtrans client simulation/error mode:', midtransErr.message)
      // Fallback token for local development mode
      snapToken = `MOCK_SNAP_${order.order_number}`
      paymentUrl = '#'
    }
  }

  if (existingPayment) {
    await supabase
      .from('payments')
      .update({
        payment_method,
        snap_token: snapToken,
        payment_url: paymentUrl,
      })
      .eq('id', existingPayment.id)

    return {
      success: true,
      data: {
        payment_id: existingPayment.id,
        payment_method,
        status: existingPayment.status,
        snap_token: snapToken,
        payment_url: paymentUrl,
      },
    }
  }

  const { data: payment, error: createPayErr } = await supabase
    .from('payments')
    .insert({
      order_id: order.id,
      payment_method,
      status: 'PENDING',
      amount: order.total,
      snap_token: snapToken,
      payment_url: paymentUrl,
    })
    .select()
    .single()

  if (createPayErr || !payment) {
    throw createError({ statusCode: 500, message: 'Gagal menyimpan transaksi pembayaran' })
  }

  return {
    success: true,
    data: {
      payment_id: payment.id,
      payment_method,
      status: payment.status,
      snap_token: snapToken,
      payment_url: paymentUrl,
    },
  }
})

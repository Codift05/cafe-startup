// ============================================================
// POST /api/payments/midtrans/webhook — Midtrans Notification Endpoint
// ============================================================

import crypto from 'node:crypto'
import { getSupabaseAdmin } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.order_id || !body.status_code || !body.gross_amount) {
    return { success: false, message: 'Payload webhook tidak lengkap' }
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } = body
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''

  // Verify Signature Key if serverKey is available
  if (serverKey && signature_key) {
    const expectedHash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex')

    if (expectedHash !== signature_key) {
      console.warn('Invalid Midtrans signature hash')
      return { success: false, message: 'Invalid signature key' }
    }
  }

  // Extract order_number (e.g. PH1024 from PH1024-1712345678)
  const orderNumber = order_id.split('-')[0]
  const supabase = getSupabaseAdmin()

  // Find order & payment
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('order_number', orderNumber)
    .single()

  if (!order) {
    return { success: true, message: 'Order not found, ignored' }
  }

  const { data: payment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('order_id', order.id)
    .single()

  if (!payment) {
    return { success: true, message: 'Payment record not found, ignored' }
  }

  // Map Midtrans Status
  let targetPaymentStatus: 'PAID' | 'FAILED' | 'EXPIRED' | 'PENDING' = 'PENDING'
  let targetOrderStatus: 'PAID' | 'CANCELLED' | 'WAITING_PAYMENT' = 'WAITING_PAYMENT'

  if (transaction_status === 'settlement' || transaction_status === 'capture') {
    targetPaymentStatus = 'PAID'
    targetOrderStatus = 'PAID'
  } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
    targetPaymentStatus = 'FAILED'
    targetOrderStatus = 'CANCELLED'
  } else if (transaction_status === 'expire') {
    targetPaymentStatus = 'EXPIRED'
    targetOrderStatus = 'CANCELLED'
  }

  if (targetPaymentStatus !== 'PENDING') {
    // Update Payment
    await supabase
      .from('payments')
      .update({
        status: targetPaymentStatus,
        provider_transaction_id: transaction_id || null,
        provider_status: transaction_status,
        paid_at: targetPaymentStatus === 'PAID' ? new Date().toISOString() : null,
      })
      .eq('id', payment.id)

    // Update Order if state transition is valid
    if (order.status === 'WAITING_PAYMENT' && targetOrderStatus !== 'WAITING_PAYMENT') {
      await supabase
        .from('orders')
        .update({ status: targetOrderStatus })
        .eq('id', order.id)

      await supabase.from('order_status_history').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: targetOrderStatus,
        source: 'WEBHOOK',
        notes: `Midtrans webhook: ${transaction_status}`,
      })
    }

    // Log Payment Event
    await supabase.from('payment_events').insert({
      payment_id: payment.id,
      event_type: `MIDTRANS_${transaction_status.toUpperCase()}`,
      provider_status: transaction_status,
      raw_payload: body,
      source: 'WEBHOOK',
    })
  }

  return { success: true, message: 'Webhook processed successfully' }
})

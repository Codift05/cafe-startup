// ============================================================
// POST /api/payments/midtrans/webhook — Midtrans Notification Endpoint
// ============================================================

import { getSupabaseAdmin } from '~/server/utils/supabase'
import { verifyMidtransSignature } from '~/server/utils/midtrans'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.order_id || !body.status_code || !body.gross_amount || !body.signature_key) {
    return { success: false, message: 'Payload webhook tidak lengkap' }
  }

  const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } = body

  if (!verifyMidtransSignature({ order_id, status_code, gross_amount, signature_key })) {
    console.warn('Invalid Midtrans signature hash')
    return { success: false, message: 'Invalid signature key' }
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
    .select('id, status, provider_transaction_id')
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
    const eventType = `MIDTRANS_${transaction_status.toUpperCase()}`
    if (payment.status === targetPaymentStatus && payment.provider_transaction_id === transaction_id) {
      return { success: true, message: 'Webhook already processed' }
    }

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
      .eq('status', payment.status)

    // Update Order if state transition is valid
    if (order.status === 'WAITING_PAYMENT' && targetOrderStatus !== 'WAITING_PAYMENT') {
      const { data: updatedOrders } = await supabase
        .from('orders')
        .update({ status: targetOrderStatus })
        .eq('id', order.id)
        .eq('status', order.status)
        .select('id')

      if (updatedOrders?.length) {
        await supabase.from('order_status_history').insert({
          order_id: order.id,
          from_status: order.status,
          to_status: targetOrderStatus,
          source: 'WEBHOOK',
          notes: `Midtrans webhook: ${transaction_status}`,
        })
      }
    }

    // Log Payment Event
    await supabase.from('payment_events').upsert({
      payment_id: payment.id,
      event_type: eventType,
      provider_event_id: transaction_id || null,
      provider_status: transaction_status,
      raw_payload: body,
      source: 'WEBHOOK',
    }, { onConflict: 'payment_id,event_type,provider_event_id', ignoreDuplicates: true })
  }

  return { success: true, message: 'Webhook processed successfully' }
})

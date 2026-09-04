// ============================================================
// Midtrans Server Utility
// ============================================================

import crypto from 'crypto'

// Midtrans Snap API client (lightweight, no SDK dependency needed for basic use)

interface MidtransConfig {
  serverKey: string
  clientKey: string
  isProduction: boolean
}

function getMidtransConfig(): MidtransConfig {
  const config = useRuntimeConfig()
  return {
    serverKey: config.midtransServerKey,
    clientKey: config.public.midtransClientKey,
    isProduction: config.midtransIsProduction === true,
  }
}

function getBaseUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com'
}

/**
 * Create a Midtrans Snap transaction.
 */
export async function createSnapTransaction(params: {
  orderId: string
  grossAmount: number
  customerName: string
  customerPhone?: string
}): Promise<{ token: string; redirect_url: string }> {
  const config = getMidtransConfig()
  const baseUrl = getBaseUrl(config.isProduction)

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      first_name: params.customerName,
      phone: params.customerPhone || undefined,
    },
    callbacks: {
      finish: `${useRuntimeConfig().public.appUrl}/order/${params.orderId}`,
    },
  }

  const authString = Buffer.from(`${config.serverKey}:`).toString('base64')

  const response = await $fetch<{ token: string; redirect_url: string }>(
    `${baseUrl}/snap/v1/transactions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body,
    }
  )

  return response
}

/**
 * Check Midtrans transaction status (for reconciliation).
 */
export async function getTransactionStatus(orderId: string): Promise<{
  transaction_status: string
  fraud_status: string
  status_code: string
  gross_amount: string
}> {
  const config = getMidtransConfig()
  const baseUrl = config.isProduction
    ? 'https://api.midtrans.com'
    : 'https://api.sandbox.midtrans.com'

  const authString = Buffer.from(`${config.serverKey}:`).toString('base64')

  return await $fetch<{
    transaction_status: string
    fraud_status: string
    status_code: string
    gross_amount: string
  }>(`${baseUrl}/v2/${orderId}/status` as string, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`,
    },
  })
}

/**
 * Verify Midtrans webhook signature.
 */
export function verifyMidtransSignature(notification: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean {
  const config = getMidtransConfig()
  if (!config.serverKey || !notification.signature_key) return false

  const hash = crypto
    .createHash('sha512')
    .update(
      notification.order_id +
      notification.status_code +
      notification.gross_amount +
      config.serverKey
    )
    .digest('hex')

  const expected = Buffer.from(hash, 'hex')
  const received = Buffer.from(notification.signature_key, 'hex')
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}

/**
 * Map Midtrans transaction_status to our PaymentStatus.
 */
export function mapMidtransStatus(transactionStatus: string): 'PAID' | 'FAILED' | 'EXPIRED' | 'PENDING' {
  switch (transactionStatus) {
    case 'capture':
    case 'settlement':
      return 'PAID'
    case 'deny':
    case 'cancel':
      return 'FAILED'
    case 'expire':
      return 'EXPIRED'
    case 'pending':
    default:
      return 'PENDING'
  }
}

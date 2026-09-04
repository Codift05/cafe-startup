// ============================================================
// Payment Types & Enums
// ============================================================

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  QRIS = 'QRIS',
  E_WALLET = 'E_WALLET',
  PAY_AT_CASHIER = 'PAY_AT_CASHIER',
}

export interface Payment {
  id: string
  order_id: string
  payment_method: PaymentMethod
  status: PaymentStatus
  amount: number
  provider_transaction_id: string | null
  provider_status: string | null
  snap_token: string | null
  payment_url: string | null
  paid_at: string | null
  expired_at: string | null
  confirmed_by: string | null
  last_reconciled_at: string | null
  created_at: string
  updated_at: string
}

export interface CreatePaymentRequest {
  order_id: string
  payment_method: PaymentMethod
}

export interface CreatePaymentResponse {
  payment_id: string
  order_number: string
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  snap_token: string | null
  payment_url: string | null
  expires_at: string | null
}

export interface PaymentStatusResponse {
  order_number: string
  payment_status: PaymentStatus
  order_status: string
  paid_at: string | null
}

// Midtrans webhook notification
export interface MidtransNotification {
  transaction_time: string
  transaction_status: string
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  payment_type: string
  order_id: string
  merchant_id: string
  gross_amount: string
  fraud_status: string
  currency: string
}

// Valid payment status transitions
export const PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.EXPIRED],
  [PaymentStatus.PAID]: [PaymentStatus.REFUNDED],
  [PaymentStatus.FAILED]: [],
  [PaymentStatus.EXPIRED]: [],
  [PaymentStatus.REFUNDED]: [],
}

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.QRIS]: 'QRIS',
  [PaymentMethod.E_WALLET]: 'E-Wallet',
  [PaymentMethod.PAY_AT_CASHIER]: 'Bayar di Kasir',
}

// Payment status labels
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Menunggu',
  [PaymentStatus.PAID]: 'Lunas',
  [PaymentStatus.FAILED]: 'Gagal',
  [PaymentStatus.EXPIRED]: 'Kedaluwarsa',
  [PaymentStatus.REFUNDED]: 'Dikembalikan',
}

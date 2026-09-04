// ============================================================
// Order Types & Enums
// ============================================================

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  PICKUP = 'PICKUP',
}

export interface Order {
  id: string
  branch_id: string
  order_number: string
  order_type: OrderType
  table_id: string | null
  table_number: string | null
  customer_name: string
  customer_phone: string | null
  status: OrderStatus
  subtotal: number
  total: number
  notes: string | null
  items: OrderItem[]
  payment: PaymentSummary | null
  timeline: OrderTimelineEntry[]
  estimated_ready_at: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string | null
  product_name: string
  variant_name: string | null
  base_price: number
  variant_price: number
  modifiers: OrderItemModifier[]
  quantity: number
  unit_price: number
  subtotal: number
  notes: string | null
}

export interface OrderItemModifier {
  id: string
  modifier_name: string
  modifier_group_name: string
  price_adjustment: number
}

export interface OrderTimelineEntry {
  status: OrderStatus
  at: string
  changed_by?: string
}

export interface PaymentSummary {
  id: string
  method: string
  status: string
  paid_at: string | null
}

// Create order request
export interface CreateOrderRequest {
  branch_id: string
  order_type: OrderType
  table_id: string | null
  customer_name: string
  customer_phone?: string
  items: CreateOrderItemRequest[]
  notes?: string
}

export interface CreateOrderItemRequest {
  product_id: string
  variant_id: string | null
  modifier_ids: string[]
  quantity: number
  notes?: string
}

// Order status labels (Bahasa Indonesia)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.WAITING_PAYMENT]: 'Menunggu Pembayaran',
  [OrderStatus.PAID]: 'Pesanan Masuk',
  [OrderStatus.PREPARING]: 'Sedang Dibuat',
  [OrderStatus.READY]: 'Siap',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
}

// KDS column labels
export const KDS_COLUMN_LABELS: Record<string, string> = {
  [OrderStatus.PAID]: 'Baru',
  [OrderStatus.PREPARING]: 'Dibuat',
  [OrderStatus.READY]: 'Siap',
}

// Valid order status transitions
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.WAITING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
}

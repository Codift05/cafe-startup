// ============================================================
// Shared Constants
// ============================================================

/** Default branch ID (single branch MVP) */
export const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000001'

/** Cart auto-expire after 4 hours */
export const CART_TTL_MS = 4 * 60 * 60 * 1000

/** Cart localStorage key */
export const CART_STORAGE_KEY = 'philanthroffee_cart'

/** Order number prefix */
export const ORDER_NUMBER_PREFIX = 'PH'

/** Default preparation time in minutes */
export const DEFAULT_PREP_TIME_MINUTES = 8

/** Reconciliation threshold: check PENDING payments older than this (ms) */
export const RECONCILIATION_THRESHOLD_MS = 5 * 60 * 1000

/** Idempotency key TTL (24 hours) */
export const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000

/** Maximum items in cart */
export const MAX_CART_ITEMS = 20

/** Maximum quantity per item */
export const MAX_ITEM_QUANTITY = 10

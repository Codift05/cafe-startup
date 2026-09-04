// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  data: null
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError

// Pagination meta
export interface PaginationMeta {
  total: number
  limit: number
  offset: number
}

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  SOLD_OUT: 'SOLD_OUT',
  INVALID_TRANSITION: 'INVALID_TRANSITION',
  CAFE_CLOSED: 'CAFE_CLOSED',
  TABLE_INVALID: 'TABLE_INVALID',
  TABLE_DISABLED: 'TABLE_DISABLED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

// ============================================================
// Table Types & Enums
// ============================================================

export enum TableStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export interface Table {
  id: string
  branch_id: string
  table_number: string
  qr_token: string
  status: TableStatus
  qr_url: string
  created_at: string
  updated_at: string
}

export interface VerifyTableRequest {
  table_number: string
  token: string
}

export interface VerifyTableResponse {
  table_id: string
  table_number: string
  branch_id: string
}

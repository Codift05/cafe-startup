// ============================================================
// User Types & Enums
// ============================================================

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  BARISTA = 'BARISTA',
}

export interface User {
  id: string
  branch_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

// Role labels
export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Pemilik',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.CASHIER]: 'Kasir',
  [UserRole.BARISTA]: 'Barista',
}

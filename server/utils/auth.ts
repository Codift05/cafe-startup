// ============================================================
// Server Auth Utilities
// ============================================================

import type { H3Event } from 'h3'
import type { UserRole } from '~/types/user'

interface AuthenticatedUser {
  id: string
  email: string
  branch_id: string
  full_name: string
  role: UserRole
}

/**
 * Extract and verify the authenticated staff user from the request.
 * Throws 401 if no valid auth token.
 */
export async function requireAuth(event: H3Event): Promise<AuthenticatedUser> {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const token = authHeader.slice(7)
  const supabase = useSupabaseAdmin()

  // Verify the JWT and get user
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Token tidak valid' })
  }

  // Fetch user profile with role
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, email, branch_id, full_name, role')
    .eq('id', user.id)
    .eq('is_active', true)
    .single()

  if (profileError || !profile) {
    throw createError({ statusCode: 403, message: 'Akun tidak aktif atau tidak ditemukan' })
  }

  return profile as AuthenticatedUser
}

/**
 * Ensure the authenticated user has one of the required roles.
 * Throws 403 if role is insufficient.
 */
export function requireRole(user: AuthenticatedUser, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw createError({
      statusCode: 403,
      message: 'Anda tidak memiliki akses untuk operasi ini',
    })
  }
}

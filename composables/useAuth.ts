// ============================================================
// Staff Authentication Composable
// ============================================================

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createClient } from '@supabase/supabase-js'

export function useAuth() {
  const user = ref<any>(null)
  const role = ref<'OWNER' | 'ADMIN' | 'CASHIER' | 'BARISTA' | null>(null)
  const isLoading = ref(false)
  const router = useRouter()

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl || ''
  const supabaseAnonKey = config.public.supabaseKey || ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  async function login(email: string, pass: string) {
    isLoading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })

      if (error) throw error

      user.value = data.user

      // Fetch user role from public.users
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      role.value = profile?.role || 'BARISTA'

      if (role.value === 'BARISTA') {
        router.push('/staff/kds')
      } else {
        router.push('/admin')
      }
    } catch (err: any) {
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    role.value = null
    router.push('/staff/login')
  }

  return {
    user,
    role,
    isLoading,
    login,
    logout,
  }
}

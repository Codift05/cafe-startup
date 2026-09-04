<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-2xl">
      <!-- Logo Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          P
        </div>
        <h1 class="text-xl font-bold tracking-tight">Philanthroffee Staff Portal</h1>
        <p class="text-xs text-neutral-400">Masuk untuk mengelola KDS & Dashboard Admin</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div v-if="errorMsg" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {{ errorMsg }}
        </div>

        <div>
          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Email Staff</label>
          <input
            v-model="email"
            type="email"
            placeholder="barista@philanthroffee.id"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="auth.isLoading.value"
          class="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="auth.isLoading.value" class="animate-spin">⏳</span>
          <span>{{ auth.isLoading.value ? 'Memproses Login...' : 'Masuk ke Sistem' }}</span>
        </button>
      </form>

      <div class="text-center text-[11px] text-neutral-500">
        Khusus staff Philanthroffee terdaftar.
      </div>
    </div>
  </div>
</template>

<script setup ts>
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const auth = useAuth()

async function handleLogin() {
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
  } catch (err: any) {
    errorMsg.value = err.message || 'Login gagal. Periksa email dan password.'
  }
}
</script>

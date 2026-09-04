<script setup lang="ts">
/**
 * Staff Login Page — Earthy Botanical Design System
 * Clean, high-fidelity staff login portal with SVG vector icons and strict security integration.
 */

useHead({ title: 'Login Staff — Philanthroffee' })

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

<template>
  <div class="staff-login-page ph-page">
    <div class="login-card ph-card">
      
      <!-- Brand Header -->
      <div class="login-brand-header">
        <div class="brand-logo-circle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--ph-primary);">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <h1 class="brand-title">Philanthroffee Staff Portal</h1>
        <p class="brand-subtitle">Masuk untuk mengelola pesanan (KDS) & operational dashboard.</p>
      </div>

      <!-- Error Alert -->
      <div v-if="errorMsg" class="error-alert">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- Login Form -->
      <form class="login-form" @submit.prevent="handleLogin">
        
        <div class="form-group">
          <label class="form-label" for="staff-email">Email Staff</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              id="staff-email"
              v-model="email"
              type="email"
              required
              placeholder="barista@philanthroffee.com"
              class="ph-input login-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="staff-password">Kata Sandi</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="staff-password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="ph-input login-input"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="auth.isLoading.value"
          class="ph-btn ph-btn--primary ph-btn--lg submit-btn"
        >
          <svg v-if="auth.isLoading.value" class="spinner-icon animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
          <span>{{ auth.isLoading.value ? 'Memproses Login...' : 'Masuk ke Sistem Portal' }}</span>
        </button>

      </form>

      <div class="login-footer-text">
        Akses khusus staff Philanthroffee terdaftar.
      </div>

    </div>
  </div>
</template>

<style scoped>
.staff-login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ph-space-md);
  background: var(--ph-bg);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: var(--ph-space-xl);
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-lg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
}

.login-brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.brand-logo-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.brand-title {
  font-family: var(--ph-font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ph-text);
  letter-spacing: -0.01em;
}

.brand-subtitle {
  font-size: 0.8125rem;
  color: var(--ph-text-secondary);
  line-height: 1.4;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--ph-radius-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  font-size: 0.8125rem;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ph-text);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--ph-text-muted);
}

.login-input {
  width: 100%;
  padding-left: 38px;
}

.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-footer-text {
  text-align: center;
  font-size: 0.75rem;
  color: var(--ph-text-muted);
  border-top: 1px dashed var(--ph-border);
  padding-top: var(--ph-space-md);
}
</style>

<script setup lang="ts">
import { OrderType } from '~/types/order'

useHead({ title: 'Verifikasi Meja — Philanthroffee' })

const route = useRoute()
const router = useRouter()
const { setOrderContext } = useCart()

const tableNumber = (route.params.tableNumber as string) || ''
const token = (route.query.token as string) || ''

const loading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  if (!token) {
    errorMsg.value = 'QR meja tidak valid. Token tidak ditemukan.'
    loading.value = false
    return
  }

  try {
    const { data } = await $fetch<{
      success: boolean
      data: { table_id: string; table_number: string; branch_id: string }
    }>('/api/tables/verify', {
      method: 'POST',
      body: { table_number: tableNumber, token },
    })

    // Set cart context
    setOrderContext(
      OrderType.DINE_IN,
      data.table_id,
      data.table_number,
      data.branch_id,
    )

    // Redirect to menu
    router.replace('/menu')
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    if (status === 404) {
      errorMsg.value = 'QR meja sudah tidak berlaku. Silakan minta bantuan staff.'
    } else if (status === 403) {
      errorMsg.value = 'Meja ini sedang tidak aktif.'
    } else {
      errorMsg.value = 'Terjadi kesalahan. Silakan coba lagi.'
    }
    loading.value = false
  }
})
</script>

<template>
  <div class="qr-entry ph-page">
    <div class="ph-container qr-entry__container">
      <div class="qr-card ph-card">
        
        <!-- Loading State -->
        <div v-if="loading" class="qr-state">
          <div class="spinner-ring"></div>
          <h2 class="state-title">Memverifikasi Meja {{ tableNumber }}</h2>
          <p class="state-desc">Menghubungkan ke sistem Philanthroffee...</p>
        </div>

        <!-- Error State -->
        <div v-else class="qr-state ph-animate-in">
          <div class="error-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #dc2626;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 class="state-title">Verifikasi QR Gagal</h2>
          <p class="error-msg">{{ errorMsg }}</p>
          <NuxtLink to="/" class="ph-btn ph-btn--primary">
            Kembali ke Beranda
          </NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-entry {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ph-space-md);
  background: var(--ph-bg);
}

.qr-entry__container {
  width: 100%;
  max-width: 420px;
}

.qr-card {
  padding: var(--ph-space-xl) var(--ph-space-lg);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  border-radius: var(--ph-radius-xl);
  text-align: center;
  box-shadow: var(--ph-shadow-md);
}

.qr-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-sm);
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border: 3px solid var(--ph-border);
  border-top-color: var(--ph-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--ph-space-xs);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.state-title {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
}

.state-desc {
  font-size: 0.8125rem;
  color: var(--ph-text-muted);
}

.error-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fef2f2;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--ph-space-xs);
}

.error-msg {
  font-size: 0.875rem;
  color: var(--ph-text-secondary);
  max-width: 300px;
}
</style>

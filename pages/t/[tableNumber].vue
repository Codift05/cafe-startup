<script setup lang="ts">
/**
 * QR Table Entry — /t/[tableNumber]?token=xxx
 * Verifies the QR token, sets cart context to DINE_IN, and redirects to menu.
 */

import { OrderType } from '~/types/order'

const route = useRoute()
const router = useRouter()
const { setOrderContext } = useCart()

const tableNumber = route.params.tableNumber as string
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
  <div class="qr-entry">
    <div class="ph-container qr-entry__content">
      <!-- Loading -->
      <div v-if="loading" class="qr-entry__loading">
        <div class="qr-entry__spinner" />
        <p class="qr-entry__text">Memverifikasi meja...</p>
        <p class="ph-caption">Meja {{ tableNumber }}</p>
      </div>

      <!-- Error -->
      <div v-else class="qr-entry__error ph-animate-in">
        <div class="qr-entry__error-icon">⚠️</div>
        <h2 class="ph-heading-md">Oops!</h2>
        <p class="qr-entry__error-msg">{{ errorMsg }}</p>
        <NuxtLink to="/" class="ph-btn ph-btn--secondary" style="margin-top: 16px;">
          Kembali ke Beranda
        </NuxtLink>
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
}

.qr-entry__content {
  text-align: center;
  padding: var(--ph-space-2xl) var(--ph-space-md);
}

.qr-entry__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-md);
}

.qr-entry__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ph-border);
  border-top-color: var(--ph-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.qr-entry__text {
  color: var(--ph-text-secondary);
  font-size: 0.9375rem;
}

.qr-entry__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-sm);
}

.qr-entry__error-icon {
  font-size: 3rem;
  margin-bottom: var(--ph-space-sm);
}

.qr-entry__error-msg {
  color: var(--ph-text-secondary);
  font-size: 0.9375rem;
  max-width: 280px;
  line-height: 1.5;
}
</style>

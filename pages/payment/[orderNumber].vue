<template>
  <div class="ph-page" style="background: var(--ph-bg); min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 24px 16px;">
    <div class="ph-card ph-animate-in" style="width: 100%; max-width: 440px; background: #ffffff; border-radius: var(--ph-radius-2xl); border: 1px solid var(--ph-border); padding: var(--ph-space-xl); display: flex; flex-direction: column; gap: var(--ph-space-lg); text-align: center; box-shadow: var(--ph-shadow-xl);">
      
      <!-- Loading State -->
      <div v-if="isLoading" style="padding: 48px 0; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="ph-skeleton" style="width: 48px; height: 48px; border-radius: 50%;" />
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary);">Memuat detail pembayaran...</p>
      </div>

      <!-- Payment Content -->
      <div v-else-if="order" style="display: flex; flex-direction: column; gap: var(--ph-space-lg);">
        
        <!-- Header -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--ph-bg-elevated); border: 1.5px solid var(--ph-border); color: var(--ph-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 4px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <span class="ph-label" style="color: var(--ph-accent);">PEMBAYARAN DIGITAL</span>
          <h1 class="ph-heading-lg" style="color: var(--ph-text);">Order #{{ order.order_number }}</h1>
        </div>

        <!-- Total Box -->
        <div style="background: var(--ph-bg-elevated); border: 1px solid var(--ph-border); border-radius: var(--ph-radius-xl); padding: 16px; display: flex; flex-direction: column; gap: 4px;">
          <span class="ph-caption" style="color: var(--ph-text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">Total Tagihan</span>
          <span class="ph-price" style="font-size: 2rem; font-weight: 700; color: var(--ph-primary);">{{ formatRp(order.total) }}</span>
        </div>

        <!-- Mode: Pay at Cashier -->
        <div v-if="order.payment?.method === 'PAY_AT_CASHIER'" style="background: var(--ph-bg-muted); border: 1px solid var(--ph-border); border-radius: var(--ph-radius-lg); padding: 16px; text-align: left; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--ph-primary); font-size: 0.875rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Pembayaran di Kasir (Tunai / POS)</span>
          </div>
          <ol style="font-size: 0.8125rem; color: var(--ph-text-secondary); padding-left: 20px; line-height: 1.5; display: flex; flex-direction: column; gap: 6px;">
            <li>Sebutkan kode pesanan <strong style="color: var(--ph-primary);">#{{ order.order_number }}</strong> ke kasir.</li>
            <li>Lakukan pembayaran tunai atau QRIS fisik di meja kasir.</li>
            <li>Kasir mengonfirmasi pesanan &amp; otomatis masuk antrean KDS.</li>
          </ol>
        </div>

        <!-- Mode: Midtrans QRIS -->
        <div v-else style="display: flex; flex-direction: column; gap: 14px;">
          <button @click="openSnap" class="ph-btn ph-btn--primary ph-btn--full ph-btn--lg" style="background: var(--ph-accent); border: none;">
            <span>Bayar via Midtrans / QRIS</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Status Auto Checker Alert -->
        <div style="padding: 10px 14px; background: var(--ph-bg-elevated); border: 1px solid var(--ph-border); border-radius: var(--ph-radius-md); display: flex; align-items: center; justify-content: space-between; font-size: 0.8125rem; color: var(--ph-text-secondary);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="ph-status-dot ph-status-dot--pulse" style="background: var(--ph-success);"></span>
            <span>Mengecek status pembayaran...</span>
          </div>
          <button @click="checkStatus" style="color: var(--ph-primary); font-weight: 600; background: none; border: none; cursor: pointer;">Cek Sekarang</button>
        </div>

        <!-- Tracking Direct Button -->
        <NuxtLink :to="`/order/${order.order_number}`" class="ph-btn ph-btn--secondary ph-btn--full">
          Lihat Status Pesanan
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-else style="padding: 32px 0; display: flex; flex-direction: column; gap: 12px;">
        <p style="font-size: 0.875rem; color: var(--ph-error);">Pesanan tidak ditemukan atau gagal dimuat.</p>
        <NuxtLink to="/menu" class="ph-btn ph-btn--secondary">Kembali ke Menu</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatRp } from '~/utils/currency'

const route = useRoute()
const router = useRouter()
const orderNumber = route.params.orderNumber as string

const order = ref<any>(null)
const isLoading = ref(true)
let pollTimer: any = null

async function loadOrder() {
  try {
    const res = await $fetch<{ success: boolean; data: any }>(`/api/orders/${orderNumber}`)
    order.value = res.data

    if (res.data.status === 'PAID' || res.data.status === 'PREPARING' || res.data.status === 'READY') {
      router.push(`/order/${orderNumber}`)
    }
  } catch (err) {
    console.error('Failed to load order:', err)
  } finally {
    isLoading.value = false
  }
}

async function checkStatus() {
  try {
    const res = await $fetch<{ success: boolean; data: any }>(`/api/payments/${orderNumber}/status`)
    if (res.data.order_status === 'PAID' || res.data.order_status === 'PREPARING') {
      router.push(`/order/${orderNumber}`)
    }
  } catch (err) {
    console.error('Check status error:', err)
  }
}

function openSnap() {
  if (order.value?.payment?.snap_token && (window as any).snap) {
    ;(window as any).snap.pay(order.value.payment.snap_token, {
      onSuccess: () => router.push(`/order/${orderNumber}`),
      onPending: () => checkStatus(),
      onError: () => alert('Pembayaran gagal, silakan coba lagi.'),
    })
  } else {
    alert('Pembayaran digital belum tersedia. Silakan muat ulang atau hubungi kasir.')
  }
}

onMounted(() => {
  loadOrder()
  pollTimer = setInterval(checkStatus, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

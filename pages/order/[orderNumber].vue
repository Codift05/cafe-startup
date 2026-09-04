<template>
  <div class="ph-page" style="background: var(--ph-bg); min-height: 100dvh; padding-bottom: 120px;">
    <!-- Top Nav Header -->
    <header style="position: sticky; top: 0; z-index: 40; background: var(--ph-bg); border-bottom: 1px solid var(--ph-border); padding: 14px 0;">
      <div class="ph-container" style="display: flex; align-items: center; justify-content: space-between;">
        <NuxtLink to="/menu" style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 600; color: var(--ph-primary); text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Menu</span>
        </NuxtLink>
        <span class="ph-label" style="color: var(--ph-text-secondary); letter-spacing: 0.05em;">NOTA & PELACAKAN PESANAN</span>
        <div style="width: 48px;"></div>
      </div>
    </header>

    <main class="ph-container" style="padding-top: var(--ph-space-lg); display: flex; flex-direction: column; gap: var(--ph-space-lg);">
      <!-- Loading State -->
      <div v-if="isLoading" style="padding: 64px 0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div class="ph-skeleton" style="width: 48px; height: 48px; border-radius: 50%;" />
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary);">Memuat status pesanan...</p>
      </div>

      <!-- Order Tracking Content -->
      <div v-else-if="order" style="display: flex; flex-direction: column; gap: var(--ph-space-lg);">
        
        <!-- Order Header Banner -->
        <div class="ph-card ph-animate-in" style="padding: var(--ph-space-lg); background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <span class="ph-label">ORDER ID</span>
              <h1 class="ph-heading-lg" style="color: var(--ph-text); font-family: var(--ph-font-display);">#{{ order.order_number }}</h1>
            </div>
            <span class="ph-badge ph-badge--accent" style="padding: 6px 14px; font-size: 0.8125rem;">
              {{ order.order_type === 'DINE_IN' ? `Dine In · Meja ${order.table_number || '-'}` : 'Pickup' }}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--ph-bg-elevated); border-radius: var(--ph-radius-lg); border: 1px solid var(--ph-border);">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--ph-primary); color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h2 style="font-size: 1rem; font-weight: 700; color: var(--ph-text);">{{ getStatusTitle(order.status) }}</h2>
              <p style="font-size: 0.8125rem; color: var(--ph-text-secondary);">{{ getStatusDesc(order.status) }}</p>
            </div>
          </div>
        </div>

        <!-- Vertical Timeline Card -->
        <div class="ph-card ph-animate-slide" style="padding: var(--ph-space-lg); background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border);">
          <h3 class="ph-label" style="margin-bottom: 20px; color: var(--ph-text-muted);">TIMELINE STATUS REALTIME</h3>

          <div style="position: relative; padding-left: 28px; border-left: 2px solid var(--ph-border); display: flex; flex-direction: column; gap: 24px;">
            <!-- Step 1: Dibuat -->
            <div style="position: relative;">
              <div :style="{ position: 'absolute', left: '-37px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isStepReached('WAITING_PAYMENT') ? 'var(--ph-primary)' : 'var(--ph-border)', border: '3px solid #ffffff' }"></div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--ph-text);">Pesanan Masuk</h4>
              <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 2px;">Diterima oleh sistem meja bar.</p>
            </div>

            <!-- Step 2: Pembayaran -->
            <div style="position: relative;">
              <div :style="{ position: 'absolute', left: '-37px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isStepReached('PAID') ? 'var(--ph-primary)' : 'var(--ph-border)', border: '3px solid #ffffff' }"></div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; color: var(--ph-text);">Pembayaran Berhasil</h4>
              <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 2px;">Verifikasi transaksi terkonfirmasi.</p>
            </div>

            <!-- Step 3: Dibuat Barista -->
            <div style="position: relative;">
              <div :style="{ position: 'absolute', left: '-37px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isStepReached('PREPARING') ? 'var(--ph-accent)' : 'var(--ph-border)', border: '3px solid #ffffff' }"></div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; color: isStepReached('PREPARING') ? 'var(--ph-accent)' : 'var(--ph-text)';">Sedang Dibuat Barista</h4>
              <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 2px;">Barista sedang meracik minuman Anda.</p>
            </div>

            <!-- Step 4: Siap -->
            <div style="position: relative;">
              <div :style="{ position: 'absolute', left: '-37px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isStepReached('READY') ? 'var(--ph-success)' : 'var(--ph-border)', border: '3px solid #ffffff' }"></div>
              <h4 style="font-size: 0.9375rem; font-weight: 600; color: isStepReached('READY') ? 'var(--ph-success)' : 'var(--ph-text)';">Siap Diantar / Diambil</h4>
              <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 2px;">Staf kafe akan membawakan pesanan ke meja.</p>
            </div>
          </div>
        </div>

        <!-- Rincian Pesanan Card -->
        <div class="ph-card" style="padding: var(--ph-space-lg); background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border);">
          <h3 class="ph-label" style="margin-bottom: 16px; color: var(--ph-text-muted);">DETAIL ITEM KASIR</h3>

          <div style="display: flex; flex-direction: column; gap: 12px; border-bottom: 1px solid var(--ph-border); padding-bottom: 16px;">
            <div v-for="item in order.items" :key="item.id" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span style="font-size: 0.9375rem; font-weight: 600; color: var(--ph-text);">
                  {{ item.quantity }}x {{ item.product_name }}
                </span>
                <p v-if="item.variant_name" style="font-size: 0.75rem; color: var(--ph-text-secondary); margin-top: 2px;">
                  {{ item.variant_name }}
                </p>
                <div v-if="item.modifiers && item.modifiers.length > 0" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                  <span v-for="mod in item.modifiers" :key="mod.name" class="ph-caption" style="background: var(--ph-bg-muted); padding: 2px 8px; border-radius: 999px;">
                    {{ mod.name }}
                  </span>
                </div>
              </div>
              <span class="ph-price" style="font-size: 0.9375rem; color: var(--ph-text); font-weight: 600;">{{ formatRp(item.subtotal) }}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px;">
            <span style="font-size: 0.9375rem; font-weight: 700; color: var(--ph-text);">Total Tagihan</span>
            <span class="ph-price" style="font-size: 1.25rem; font-weight: 700; color: var(--ph-accent);">{{ formatRp(order.total) }}</span>
          </div>
        </div>

        <!-- Action Button if Waiting Payment -->
        <div v-if="order.status === 'WAITING_PAYMENT'" class="ph-floating-bar">
          <div class="ph-floating-bar__content">
            <button @click="router.push(`/payment/${order.order_number}`)" class="ph-btn ph-btn--primary ph-btn--full ph-btn--lg">
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </main>
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

const statusOrder = ['WAITING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'COMPLETED']

function isStepReached(stepStatus: string) {
  if (!order.value) return false
  const currentIndex = statusOrder.indexOf(order.value.status)
  const stepIndex = statusOrder.indexOf(stepStatus)
  return currentIndex >= stepIndex
}

function getStatusTitle(status: string) {
  switch (status) {
    case 'WAITING_PAYMENT': return 'Menunggu Pembayaran'
    case 'PAID': return 'Pesanan Diterima'
    case 'PREPARING': return 'Sedang Dibuat Barista'
    case 'READY': return 'Pesanan Siap!'
    case 'COMPLETED': return 'Pesanan Selesai'
    case 'CANCELLED': return 'Pesanan Dibatalkan'
    default: return status
  }
}

function getStatusDesc(status: string) {
  switch (status) {
    case 'WAITING_PAYMENT': return 'Silakan lakukan pembayaran untuk melanjutkan.'
    case 'PAID': return 'Pesanan sudah lunas dan masuk antrean dapur.'
    case 'PREPARING': return 'Barista kami sedang meracik pesanan Anda dengan kasih sayang.'
    case 'READY': return 'Silakan ambil di counter atau tunggu disajikan.'
    case 'COMPLETED': return 'Terima kasih telah menikmati Philanthroffee!'
    default: return ''
  }
}

async function fetchOrder() {
  try {
    const res = await $fetch<{ success: boolean; data: any }>(`/api/orders/${orderNumber}`)
    order.value = res.data
  } catch (err) {
    console.error('Fetch order error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrder()
  pollTimer = setInterval(fetchOrder, 4000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

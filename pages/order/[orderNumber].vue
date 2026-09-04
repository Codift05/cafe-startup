<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 px-4 py-3.5 flex items-center justify-between">
      <button @click="router.push('/menu')" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
        <span>← Menu</span>
      </button>
      <h1 class="text-base font-bold tracking-tight">Status Pesanan</h1>
      <div class="w-12"></div>
    </header>

    <main class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-16 text-center space-y-4">
        <div class="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs text-neutral-400">Memuat status pesanan...</p>
      </div>

      <!-- Order Tracking Details -->
      <div v-else-if="order" class="space-y-6">
        <!-- Main Status Hero Card -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div class="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
            <span v-if="order.status === 'WAITING_PAYMENT'">⏳</span>
            <span v-else-if="order.status === 'PAID'">✅</span>
            <span v-else-if="order.status === 'PREPARING'">👨‍🍳</span>
            <span v-else-if="order.status === 'READY'">🎉</span>
            <span v-else-if="order.status === 'COMPLETED'">✨</span>
            <span v-else>❌</span>
          </div>

          <div class="space-y-1">
            <h2 class="text-xl font-bold text-white">{{ getStatusTitle(order.status) }}</h2>
            <p class="text-xs text-neutral-400">{{ getStatusDesc(order.status) }}</p>
          </div>

          <div class="inline-block px-4 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-xs font-mono text-amber-400 font-bold">
            #{{ order.order_number }} • {{ order.order_type === 'DINE_IN' ? `Meja ${order.table_number || '-'}` : 'Pickup' }}
          </div>
        </div>

        <!-- Vertical Timeline Card -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">Timeline Pesanan</h3>

          <div class="space-y-6 relative pl-6 border-l-2 border-neutral-800">
            <!-- Step 1: Order Masuk -->
            <div class="relative">
              <div
                class="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all"
                :class="isStepReached('WAITING_PAYMENT') ? 'bg-amber-500 border-amber-400' : 'bg-neutral-900 border-neutral-700'"
              ></div>
              <h4 class="text-sm font-semibold" :class="isStepReached('WAITING_PAYMENT') ? 'text-white' : 'text-neutral-500'">
                Pesanan Dibuat
              </h4>
              <p class="text-xs text-neutral-400">Pesanan berhasil tercatat di sistem Philanthroffee.</p>
            </div>

            <!-- Step 2: Paid -->
            <div class="relative">
              <div
                class="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all"
                :class="isStepReached('PAID') ? 'bg-amber-500 border-amber-400' : 'bg-neutral-900 border-neutral-700'"
              ></div>
              <h4 class="text-sm font-semibold" :class="isStepReached('PAID') ? 'text-white' : 'text-neutral-500'">
                Pembayaran Terkonfirmasi
              </h4>
              <p class="text-xs text-neutral-400">Pembayaran terverifikasi, masuk ke antrean dapur.</p>
            </div>

            <!-- Step 3: Preparing -->
            <div class="relative">
              <div
                class="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all"
                :class="isStepReached('PREPARING') ? 'bg-amber-500 border-amber-400' : 'bg-neutral-900 border-neutral-700'"
              ></div>
              <h4 class="text-sm font-semibold" :class="isStepReached('PREPARING') ? 'text-white' : 'text-neutral-500'">
                Sedang Dibuat Barista
              </h4>
              <p class="text-xs text-neutral-400">Barista sedang meracik minuman Anda.</p>
            </div>

            <!-- Step 4: Ready -->
            <div class="relative">
              <div
                class="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all"
                :class="isStepReached('READY') ? 'bg-emerald-500 border-emerald-400' : 'bg-neutral-900 border-neutral-700'"
              ></div>
              <h4 class="text-sm font-semibold" :class="isStepReached('READY') ? 'text-emerald-400' : 'text-neutral-500'">
                Siap Diambil / Diantar
              </h4>
              <p class="text-xs text-neutral-400">Pesanan Anda telah siap!</p>
            </div>
          </div>
        </div>

        <!-- Order Items Detail Card -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">Detail Pesanan</h3>

          <div class="divide-y divide-neutral-800">
            <div v-for="item in order.items" :key="item.id" class="py-3 first:pt-0 last:pb-0 space-y-1">
              <div class="flex justify-between items-start text-sm">
                <span class="font-medium text-neutral-200">
                  <span class="font-bold text-amber-400 mr-1.5">{{ item.quantity }}x</span>
                  {{ item.product_name }}
                </span>
                <span class="font-mono text-neutral-300 font-semibold">{{ formatRp(item.subtotal) }}</span>
              </div>
              <div v-if="item.variant_name" class="text-xs text-neutral-400 pl-6">
                Variant: {{ item.variant_name }}
              </div>
              <div v-if="item.modifiers.length > 0" class="text-xs text-neutral-400 pl-6 flex flex-wrap gap-1">
                <span v-for="mod in item.modifiers" :key="mod.name" class="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[11px]">
                  {{ mod.name }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t border-neutral-800 pt-3 flex justify-between font-bold text-sm text-amber-400">
            <span>Total Pembayaran</span>
            <span class="font-mono">{{ formatRp(order.total) }}</span>
          </div>
        </div>

        <!-- Pay Button fallback if WAITING_PAYMENT -->
        <div v-if="order.status === 'WAITING_PAYMENT'">
          <button
            @click="router.push(`/payment/${order.order_number}`)"
            class="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg transition-all"
          >
            Lanjutkan Pembayaran Sekarang
          </button>
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

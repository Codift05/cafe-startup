<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 p-4 flex flex-col items-center justify-center">
    <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 text-center shadow-2xl">
      <!-- Loading State -->
      <div v-if="isLoading" class="py-12 space-y-4">
        <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-sm text-neutral-400">Memuat detail pembayaran...</p>
      </div>

      <!-- Payment Content -->
      <div v-else-if="order" class="space-y-6">
        <!-- Status Header -->
        <div class="space-y-2">
          <div class="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mx-auto font-bold">
            💳
          </div>
          <h1 class="text-xl font-bold">Selesaikan Pembayaran</h1>
          <p class="text-xs text-neutral-400">
            Nomor Pesanan: <span class="font-mono text-amber-400 font-bold">#{{ order.order_number }}</span>
          </p>
        </div>

        <!-- Total Amount -->
        <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-1">
          <p class="text-xs text-neutral-400 uppercase tracking-wider">Total Tagihan</p>
          <p class="text-2xl font-bold font-mono text-amber-400">{{ formatRp(order.total) }}</p>
        </div>

        <!-- Mode: Pay at Cashier -->
        <div v-if="order.payment?.method === 'PAY_AT_CASHIER'" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-left space-y-3">
          <div class="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <span>🏪</span> Pembayaran di Kasir (Cash / Tunai)
          </div>
          <ol class="text-xs text-neutral-300 space-y-2 list-decimal pl-4">
            <li>Tunjukkan kode pesanan <strong class="font-mono text-amber-400">#{{ order.order_number }}</strong> ke kasir Philanthroffee.</li>
            <li>Lakukan pembayaran secara tunai atau metode fisik kasir.</li>
            <li>Kasir akan mengonfirmasi pembayaran Anda dan pesanan langsung masuk ke dapur!</li>
          </ol>
        </div>

        <!-- Mode: Digital QRIS / E-Wallet -->
        <div v-else class="space-y-4">
          <div class="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
            <p class="text-xs text-neutral-300 font-semibold">Scan QRIS atau bayar via E-Wallet</p>
            <button
              @click="openSnap"
              class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Bayar Sekarang via Midtrans</span>
              <span>→</span>
            </button>
          </div>
        </div>

        <!-- Status Auto Checker Alert -->
        <div class="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-neutral-400">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Mengecek status pembayaran...</span>
          </div>
          <button @click="checkStatus" class="text-amber-400 hover:underline text-[11px]">Check Now</button>
        </div>

        <!-- Tracking Direct Button -->
        <button
          @click="router.push(`/order/${order.order_number}`)"
          class="w-full py-3 rounded-xl border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-medium text-xs transition-colors"
        >
          Lihat Halaman Tracking Pesanan
        </button>
      </div>

      <!-- Error State -->
      <div v-else class="py-12 space-y-4">
        <p class="text-sm text-rose-400">Pesanan tidak ditemukan atau gagal dimuat.</p>
        <button @click="router.push('/menu')" class="px-6 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-full">
          Kembali ke Menu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup ts>
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
    alert('Mock Mode: Membuka Payment Simulation Midtrans')
    // Dev mock auto simulate paid
    checkStatus()
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

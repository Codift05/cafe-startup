<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 pb-28">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 px-4 py-3.5 flex items-center justify-between">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <span class="text-lg">←</span>
        <span>Kembali</span>
      </button>
      <h1 class="text-base font-bold tracking-tight">Checkout</h1>
      <div class="w-16"></div>
    </header>

    <main class="max-w-lg mx-auto px-4 py-6 space-y-6">
      <!-- Empty Cart Guard -->
      <div v-if="cart.items.length === 0" class="text-center py-16 space-y-4">
        <div class="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-2xl">
          🛒
        </div>
        <h2 class="text-lg font-semibold">Keranjang Anda Kosong</h2>
        <p class="text-xs text-neutral-400 max-w-xs mx-auto">
          Silakan pilih menu favorit Anda terlebih dahulu sebelum melakukan checkout.
        </p>
        <button
          @click="router.push('/menu')"
          class="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all"
        >
          Lihat Menu
        </button>
      </div>

      <div v-else class="space-y-6">
        <!-- Order Type Banner -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-lg">
              {{ cart.orderType === 'DINE_IN' ? '🍽️' : '🛍️' }}
            </div>
            <div>
              <p class="text-xs text-neutral-400 font-medium uppercase tracking-wider">Tipe Pesanan</p>
              <h2 class="text-base font-bold text-white">
                {{ cart.orderType === 'DINE_IN' ? `Dine In — Meja ${cart.tableNumber || '-'}` : 'Pickup / Takeaway' }}
              </h2>
            </div>
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-xs font-semibold"
            :class="cart.orderType === 'DINE_IN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'"
          >
            {{ cart.orderType === 'DINE_IN' ? 'Meja' : 'Pickup' }}
          </span>
        </div>

        <!-- Customer Detail Form -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span>👤</span> Informasi Pemesan
          </h3>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">
                Nama Pemesan <span class="text-amber-500">*</span>
              </label>
              <input
                v-model="customerName"
                type="text"
                placeholder="Contoh: Budi Prasetyo"
                class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-neutral-600"
                required
              />
              <p v-if="nameError" class="text-xs text-rose-400 mt-1">Nama pemesan wajib diisi.</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1.5">
                Nomor WhatsApp / HP <span class="text-neutral-500 text-[10px]">(Opsional)</span>
              </label>
              <input
                v-model="customerPhone"
                type="tel"
                placeholder="Contoh: 081234567890"
                class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        <!-- Cart Summary Card -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <span>☕</span> Ringkasan Pesanan ({{ cart.totalItems }} item)
            </h3>
            <button @click="router.push('/cart')" class="text-xs text-amber-400 hover:underline">
              Ubah Cart
            </button>
          </div>

          <div class="divide-y divide-neutral-800/60">
            <div v-for="item in cart.items" :key="item.id" class="py-3 first:pt-0 last:pb-0 space-y-1">
              <div class="flex justify-between items-start text-sm">
                <span class="font-medium text-neutral-100">
                  <span class="font-bold text-amber-400 mr-1.5">{{ item.quantity }}x</span>
                  {{ item.productName }}
                </span>
                <span class="font-mono text-neutral-300 font-semibold">{{ formatRp(item.subtotal) }}</span>
              </div>
              <div v-if="item.variantName" class="text-xs text-neutral-400 pl-6">
                Variant: {{ item.variantName }}
              </div>
              <div v-if="item.modifiers.length > 0" class="text-xs text-neutral-400 pl-6 flex flex-wrap gap-1">
                <span v-for="mod in item.modifiers" :key="mod.id" class="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-[11px]">
                  {{ mod.name }}
                </span>
              </div>
              <div v-if="item.notes" class="text-xs italic text-neutral-400 pl-6">
                "{{ item.notes }}"
              </div>
            </div>
          </div>

          <!-- Total Breakdown -->
          <div class="border-t border-neutral-800 pt-3 space-y-1.5 text-sm">
            <div class="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span class="font-mono">{{ formatRp(cart.subtotal) }}</span>
            </div>
            <div class="flex justify-between font-bold text-base text-amber-400 pt-1 border-t border-neutral-800/80">
              <span>Total Pembayaran</span>
              <span class="font-mono">{{ formatRp(cart.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <span>💳</span> Metode Pembayaran
          </h3>

          <div class="grid grid-cols-1 gap-2.5">
            <!-- QRIS / E-Wallet -->
            <label
              class="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all"
              :class="selectedPaymentMethod === 'QRIS' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'"
            >
              <div class="flex items-center gap-3">
                <input type="radio" v-model="selectedPaymentMethod" value="QRIS" class="accent-amber-500" />
                <div>
                  <div class="font-semibold text-sm">QRIS / Instant Payment</div>
                  <div class="text-xs text-neutral-400">Gopay, OVO, ShopeePay, BCA, Mandiri QRIS</div>
                </div>
              </div>
              <span class="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">Otomatis</span>
            </label>

            <!-- Pay at Cashier -->
            <label
              class="flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all"
              :class="selectedPaymentMethod === 'PAY_AT_CASHIER' ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'"
            >
              <div class="flex items-center gap-3">
                <input type="radio" v-model="selectedPaymentMethod" value="PAY_AT_CASHIER" class="accent-amber-500" />
                <div>
                  <div class="font-semibold text-sm">Bayar di Kasir (Cash / Tunai)</div>
                  <div class="text-xs text-neutral-400">Tunjukkan nomor pesanan ke kasir untuk bayar</div>
                </div>
              </div>
              <span class="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">Kasir</span>
            </label>
          </div>
        </div>

        <!-- Error Notification -->
        <div v-if="errorMessage" class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <span>⚠️</span> Gagal Memproses Pesanan
          </div>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </main>

    <!-- Bottom Sticky Submit Bar -->
    <div v-if="cart.items.length > 0" class="fixed bottom-0 left-0 right-0 z-30 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800 p-4">
      <div class="max-w-lg mx-auto flex items-center justify-between gap-4">
        <div>
          <div class="text-[11px] text-neutral-400 uppercase tracking-wider">Total</div>
          <div class="text-lg font-bold text-amber-400 font-mono">{{ formatRp(cart.subtotal) }}</div>
        </div>

        <button
          @click="submitOrder"
          :disabled="isSubmitting"
          class="flex-1 py-3 px-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="animate-spin text-base">⏳</span>
          <span>{{ isSubmitting ? 'Memproses...' : 'Buat Pesanan Sekarang' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup ts>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'
import { formatRp } from '~/utils/currency'

const router = useRouter()
const cart = useCart()

const customerName = ref('')
const customerPhone = ref('')
const selectedPaymentMethod = ref<'QRIS' | 'PAY_AT_CASHIER'>('QRIS')
const isSubmitting = ref(false)
const nameError = ref(false)
const errorMessage = ref('')

async function submitOrder() {
  errorMessage.value = ''
  nameError.value = false

  if (!customerName.value.trim()) {
    nameError.value = true
    return
  }

  isSubmitting.value = true

  try {
    // Generate client idempotency key
    const idempotencyKey = crypto.randomUUID()

    // Step 1: Create Order
    const orderPayload = {
      order_type: cart.orderType,
      table_id: cart.tableId,
      customer_name: customerName.value.trim(),
      customer_phone: customerPhone.value.trim() || undefined,
      idempotency_key: idempotencyKey,
      items: cart.items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId || null,
        modifier_ids: item.modifiers.map(m => m.id),
        quantity: item.quantity,
        notes: item.notes || null,
      })),
    }

    const orderRes = await $fetch<{ success: boolean; data: any }>('/api/orders', {
      method: 'POST',
      body: orderPayload,
    })

    const orderNumber = orderRes.data.order_number

    // Step 2: Initialize Payment
    const paymentRes = await $fetch<{ success: boolean; data: any }>('/api/payments', {
      method: 'POST',
      body: {
        order_number: orderNumber,
        payment_method: selectedPaymentMethod.value,
      },
    })

    // Step 3: Clear cart & navigate to payment page
    cart.clearCart()
    router.push(`/payment/${orderNumber}`)
  } catch (err: any) {
    if (err.data && err.data.message) {
      errorMessage.value = err.data.message
    } else {
      errorMessage.value = 'Terjadi kesalahan sistem saat membuat pesanan. Silakan coba lagi.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

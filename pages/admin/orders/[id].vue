<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin/orders" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Kembali ke Daftar Pesanan
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Detail Pesanan #{{ orderNumber }}</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Informasi rincian pesanan, riwayat status, dan bukti pembayaran.</p>
      </div>

      <button @click="fetchOrder" class="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold">
        🔄 Refresh Status
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-16 text-center text-xs text-neutral-400">
      Memuat rincian pesanan...
    </div>

    <!-- Order Content -->
    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Details Card -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <span class="text-xs font-mono font-bold text-amber-400 text-lg">#{{ order.order_number }}</span>
              <p class="text-xs text-neutral-400">{{ order.order_type === 'DINE_IN' ? `Dine In — Meja ${order.table_number || '-'}` : 'Pickup / Takeaway' }}</p>
            </div>
            <span class="px-3 py-1 rounded-full font-bold text-xs" :class="getStatusBadgeClass(order.status)">
              {{ order.status }}
            </span>
          </div>

          <!-- Customer Info -->
          <div class="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p class="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">Nama Pemesan</p>
              <p class="text-sm font-semibold text-white mt-0.5">{{ order.customer_name }}</p>
            </div>
            <div>
              <p class="text-neutral-400 uppercase tracking-wider text-[10px] font-bold">No. WhatsApp / HP</p>
              <p class="text-sm font-semibold text-white mt-0.5">{{ order.customer_phone || '-' }}</p>
            </div>
          </div>

          <!-- Item Table -->
          <div class="border-t border-neutral-800 pt-4 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">Item Pesanan</h3>

            <div class="divide-y divide-neutral-800 text-xs">
              <div v-for="item in order.items" :key="item.id" class="py-3 first:pt-0 flex justify-between items-start">
                <div>
                  <div class="font-bold text-white text-sm">
                    <span class="text-amber-400">{{ item.quantity }}x</span> {{ item.product_name }}
                  </div>
                  <div v-if="item.variant_name" class="text-neutral-400 text-xs mt-0.5">Variant: {{ item.variant_name }}</div>
                  <div v-if="item.modifiers && item.modifiers.length > 0" class="text-neutral-400 text-[11px] mt-0.5 flex flex-wrap gap-1">
                    <span v-for="mod in item.modifiers" :key="mod.name" class="bg-neutral-800 px-1.5 py-0.2 rounded text-neutral-300">
                      + {{ mod.name }}
                    </span>
                  </div>
                  <div v-if="item.notes" class="text-amber-300/90 italic text-[11px] mt-0.5">
                    "{{ item.notes }}"
                  </div>
                </div>
                <div class="font-mono font-bold text-white text-sm">
                  {{ formatRp(item.subtotal) }}
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="border-t border-neutral-800 pt-3 flex justify-between items-center text-sm font-bold text-amber-400">
              <span>Total Tagihan</span>
              <span class="font-mono text-lg">{{ formatRp(order.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Info Card -->
      <div class="space-y-6">
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl text-xs">
          <h3 class="font-bold uppercase tracking-wider text-neutral-400">Informasi Pembayaran</h3>

          <div v-if="order.payment" class="space-y-2.5">
            <div class="flex justify-between">
              <span class="text-neutral-400">Metode</span>
              <span class="font-semibold text-white">{{ order.payment.method }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-400">Status Bayar</span>
              <span class="font-bold text-emerald-400">{{ order.payment.status }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-400">Waktu Bayar</span>
              <span class="font-mono text-neutral-300">{{ order.payment.paid_at ? new Date(order.payment.paid_at).toLocaleString() : '-' }}</span>
            </div>
          </div>

          <div v-else class="text-neutral-500 italic">
            Belum ada data pembayaran
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup ts>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { formatRp } from '~/utils/currency'

const route = useRoute()
const orderNumber = route.params.id as string

const order = ref<any>(null)
const isLoading = ref(true)

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'WAITING_PAYMENT': return 'bg-amber-500/20 text-amber-400'
    case 'PAID': return 'bg-emerald-500/20 text-emerald-400'
    case 'PREPARING': return 'bg-blue-500/20 text-blue-400'
    case 'READY': return 'bg-purple-500/20 text-purple-400'
    case 'COMPLETED': return 'bg-neutral-800 text-neutral-400'
    default: return 'bg-neutral-800 text-neutral-300'
  }
}

async function fetchOrder() {
  try {
    const res = await $fetch<{ success: boolean; data: any }>(`/api/orders/${orderNumber}`)
    order.value = res.data
  } catch (err) {
    console.error('Fetch order detail error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Dashboard Admin
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Kelola Seluruh Pesanan</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Daftar transaksi pesanan masuk, status pembuatan, dan riwayat pesanan.</p>
      </div>
      <button @click="fetchOrders" class="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold">
        🔄 Refresh Data
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs">
      <span class="text-neutral-400 font-bold uppercase tracking-wider">Filter Status:</span>
      <button
        v-for="s in statusOptions"
        :key="s.value"
        @click="selectedStatus = s.value"
        class="px-3 py-1.5 rounded-lg border transition-all font-medium"
        :class="selectedStatus === s.value ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- Order List Table -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
              <th class="p-4">No. Order</th>
              <th class="p-4">Tipe & Meja</th>
              <th class="p-4">Customer</th>
              <th class="p-4">Total</th>
              <th class="p-4">Status Pesanan</th>
              <th class="p-4">Waktu</th>
              <th class="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-800">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-neutral-800/40 transition-colors">
              <td class="p-4 font-mono font-bold text-amber-400 text-sm">#{{ order.order_number }}</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded font-bold text-[10px]" :class="order.order_type === 'DINE_IN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ order.order_type === 'DINE_IN' ? `Dine In (Meja ${order.table_number || '-'})` : 'Pickup' }}
                </span>
              </td>
              <td class="p-4 font-medium text-white">{{ order.customer_name }}</td>
              <td class="p-4 font-mono font-bold text-white">{{ formatRp(order.total) }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 rounded-full font-bold text-[10px]" :class="getStatusBadgeClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="p-4 text-neutral-400 text-[11px]">{{ new Date(order.created_at).toLocaleTimeString() }}</td>
              <td class="p-4 text-right">
                <NuxtLink :to="`/order/${order.order_number}`" class="text-amber-400 hover:underline font-semibold text-[11px]">
                  Detail Tracking →
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="7" class="p-8 text-center text-neutral-500">
                Tidak ada pesanan ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatRp } from '~/utils/currency'

const selectedStatus = ref('ALL')
const orders = ref<any[]>([])

const statusOptions = [
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Menunggu Bayar', value: 'WAITING_PAYMENT' },
  { label: 'Lunas (PAID)', value: 'PAID' },
  { label: 'Dibuat', value: 'PREPARING' },
  { label: 'Siap', value: 'READY' },
  { label: 'Selesai', value: 'COMPLETED' },
]

const filteredOrders = computed(() => {
  if (selectedStatus.value === 'ALL') return orders.value
  return orders.value.filter(o => o.status === selectedStatus.value)
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'WAITING_PAYMENT': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'PREPARING': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    case 'READY': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    case 'COMPLETED': return 'bg-neutral-800 text-neutral-400'
    default: return 'bg-neutral-800 text-neutral-300'
  }
}

async function fetchOrders() {
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/staff/orders?status=WAITING_PAYMENT,PAID,PREPARING,READY,COMPLETED')
    orders.value = res.data
  } catch (err) {
    console.error('Fetch orders error:', err)
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
    <!-- Top Header Bar -->
    <header class="bg-neutral-900 border-b border-neutral-800 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-lg">
          K
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight">Barista KDS — Kitchen Display System</h1>
          <p class="text-[11px] text-neutral-400">Philanthroffee Branch Main • Realtime Queue</p>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-full text-neutral-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Updates Active</span>
        </div>
        <button
          @click="fetchOrders"
          class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
    </header>

    <!-- Main Kanban 3-Column Display -->
    <main class="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start overflow-x-auto">
      <!-- Column 1: BARU (PAID) -->
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-4 min-h-[calc(100vh-120px)]">
        <div class="flex items-center justify-between px-2 pb-2 border-b border-neutral-800">
          <div class="flex items-center gap-2 font-bold text-amber-400 text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h2>BARU (PAID)</h2>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold font-mono">
            {{ baruOrders.length }}
          </span>
        </div>

        <div class="space-y-4 flex-1">
          <div
            v-for="order in baruOrders"
            :key="order.id"
            class="bg-neutral-900 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg relative hover:border-amber-500 transition-colors"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-mono font-bold text-amber-400 text-base">#{{ order.order_number }}</span>
                <p class="text-xs font-semibold text-neutral-300">{{ order.customer_name }}</p>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold" :class="order.order_type === 'DINE_IN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ order.order_type === 'DINE_IN' ? `MEJA ${order.table_number || '-'}` : 'PICKUP' }}
                </span>
                <p class="text-[10px] text-neutral-400 mt-1 font-mono">{{ getElapsedTime(order.created_at) }}m yang lalu</p>
              </div>
            </div>

            <!-- Item List -->
            <div class="border-t border-b border-neutral-800 py-2.5 space-y-2">
              <div v-for="item in order.items" :key="item.id" class="text-xs">
                <div class="font-bold text-white flex items-baseline gap-1.5">
                  <span class="text-amber-400 text-sm font-black">{{ item.quantity }}x</span>
                  <span>{{ item.product_name }}</span>
                  <span v-if="item.variant_name" class="text-[10px] text-neutral-400 font-normal">({{ item.variant_name }})</span>
                </div>
                <div v-if="item.modifiers.length > 0" class="pl-5 text-[11px] text-neutral-400 flex flex-wrap gap-1 mt-0.5">
                  <span v-for="mod in item.modifiers" :key="mod" class="bg-neutral-800 px-1.5 py-0.2 rounded text-neutral-300">
                    + {{ mod }}
                  </span>
                </div>
                <div v-if="item.notes" class="pl-5 text-[11px] text-amber-300/90 italic mt-0.5">
                  Catatan: "{{ item.notes }}"
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="updateStatus(order.id, 'PREPARING')"
              class="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <span>👨‍🍳 MULAI BUAT</span>
            </button>
          </div>

          <div v-if="baruOrders.length === 0" class="text-center py-12 text-neutral-500 text-xs">
            Tidak ada order baru
          </div>
        </div>
      </section>

      <!-- Column 2: DIBUAT (PREPARING) -->
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-4 min-h-[calc(100vh-120px)]">
        <div class="flex items-center justify-between px-2 pb-2 border-b border-neutral-800">
          <div class="flex items-center gap-2 font-bold text-blue-400 text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h2>DIBUAT (PREPARING)</h2>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold font-mono">
            {{ sedangDibuatOrders.length }}
          </span>
        </div>

        <div class="space-y-4 flex-1">
          <div
            v-for="order in sedangDibuatOrders"
            :key="order.id"
            class="bg-neutral-900 border border-blue-500/40 rounded-2xl p-4 space-y-3 shadow-lg relative hover:border-blue-400 transition-colors"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-mono font-bold text-blue-400 text-base">#{{ order.order_number }}</span>
                <p class="text-xs font-semibold text-neutral-300">{{ order.customer_name }}</p>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold" :class="order.order_type === 'DINE_IN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ order.order_type === 'DINE_IN' ? `MEJA ${order.table_number || '-'}` : 'PICKUP' }}
                </span>
                <p class="text-[10px] text-blue-400 mt-1 font-mono font-bold">{{ getElapsedTime(order.created_at) }}m diproses</p>
              </div>
            </div>

            <!-- Item List -->
            <div class="border-t border-b border-neutral-800 py-2.5 space-y-2">
              <div v-for="item in order.items" :key="item.id" class="text-xs">
                <div class="font-bold text-white flex items-baseline gap-1.5">
                  <span class="text-blue-400 text-sm font-black">{{ item.quantity }}x</span>
                  <span>{{ item.product_name }}</span>
                  <span v-if="item.variant_name" class="text-[10px] text-neutral-400 font-normal">({{ item.variant_name }})</span>
                </div>
                <div v-if="item.modifiers.length > 0" class="pl-5 text-[11px] text-neutral-400 flex flex-wrap gap-1 mt-0.5">
                  <span v-for="mod in item.modifiers" :key="mod" class="bg-neutral-800 px-1.5 py-0.2 rounded text-neutral-300">
                    + {{ mod }}
                  </span>
                </div>
                <div v-if="item.notes" class="pl-5 text-[11px] text-amber-300/90 italic mt-0.5">
                  Catatan: "{{ item.notes }}"
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="updateStatus(order.id, 'READY')"
              class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <span>🔔 TANDAI SIAP</span>
            </button>
          </div>

          <div v-if="sedangDibuatOrders.length === 0" class="text-center py-12 text-neutral-500 text-xs">
            Belum ada pesanan yang sedang dibuat
          </div>
        </div>
      </section>

      <!-- Column 3: SIAP (READY) -->
      <section class="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 flex flex-col gap-4 min-h-[calc(100vh-120px)]">
        <div class="flex items-center justify-between px-2 pb-2 border-b border-neutral-800">
          <div class="flex items-center gap-2 font-bold text-emerald-400 text-sm">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2>SIAP (READY)</h2>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono">
            {{ siapOrders.length }}
          </span>
        </div>

        <div class="space-y-4 flex-1">
          <div
            v-for="order in siapOrders"
            :key="order.id"
            class="bg-neutral-900 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg relative hover:border-emerald-400 transition-colors"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-mono font-bold text-emerald-400 text-base">#{{ order.order_number }}</span>
                <p class="text-xs font-semibold text-neutral-300">{{ order.customer_name }}</p>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold" :class="order.order_type === 'DINE_IN' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ order.order_type === 'DINE_IN' ? `MEJA ${order.table_number || '-'}` : 'PICKUP' }}
                </span>
                <p class="text-[10px] text-emerald-400 mt-1 font-mono font-bold">Siap Disajikan</p>
              </div>
            </div>

            <!-- Item List -->
            <div class="border-t border-b border-neutral-800 py-2.5 space-y-2">
              <div v-for="item in order.items" :key="item.id" class="text-xs">
                <div class="font-bold text-white flex items-baseline gap-1.5">
                  <span class="text-emerald-400 text-sm font-black">{{ item.quantity }}x</span>
                  <span>{{ item.product_name }}</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="updateStatus(order.id, 'COMPLETED')"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
            >
              <span>✅ SELESAIKAN</span>
            </button>
          </div>

          <div v-if="siapOrders.length === 0" class="text-center py-12 text-neutral-500 text-xs">
            Belum ada pesanan yang siap
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const orders = ref<any[]>([])
let pollTimer: any = null

const baruOrders = computed(() => orders.value.filter(o => o.status === 'PAID'))
const sedangDibuatOrders = computed(() => orders.value.filter(o => o.status === 'PREPARING'))
const siapOrders = computed(() => orders.value.filter(o => o.status === 'READY'))

function getElapsedTime(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime()
  return Math.floor(diff / 60000)
}

async function fetchOrders() {
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/staff/orders?status=PAID,PREPARING,READY')
    orders.value = res.data
  } catch (err) {
    console.error('Fetch KDS error:', err)
  }
}

async function updateStatus(orderId: string, status: string) {
  try {
    await $fetch(`/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    })
    await fetchOrders()
  } catch (err: any) {
    alert(err.data?.message || 'Gagal mengubah status pesanan')
  }
}

onMounted(() => {
  fetchOrders()
  pollTimer = setInterval(fetchOrders, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Dashboard Admin
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Kelola Pembayaran & Rekonsiliasi</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Konfirmasi pembayaran tunai kasir & penanganan status terpending.</p>
      </div>

      <button
        @click="runReconciliation"
        :disabled="isReconciling"
        class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isReconciling" class="animate-spin">🔄</span>
        <span>{{ isReconciling ? 'Menyelaraskan Data...' : '⚡ Jalankan Auto-Rekonsiliasi' }}</span>
      </button>
    </div>

    <!-- Mismatch Alert Banner -->
    <div v-if="mismatchCount > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xl">
          ⚠️
        </div>
        <div>
          <h3 class="text-sm font-bold text-amber-400">Terdeteksi {{ mismatchCount }} Transaksi Perlu Sinkronisasi</h3>
          <p class="text-xs text-neutral-300">Status di Midtrans lunas (PAID) namun status internal masih PENDING.</p>
        </div>
      </div>
      <button
        @click="runReconciliation"
        class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
      >
        Sinkronkan Sekarang
      </button>
    </div>

    <!-- Payments List Table -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
      <div class="p-4 border-b border-neutral-800 font-bold text-sm text-white">
        Daftar Transaksi Pembayaran
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
              <th class="p-4">No. Order</th>
              <th class="p-4">Metode Pembayaran</th>
              <th class="p-4">Jumlah Total</th>
              <th class="p-4">Status Pembayaran</th>
              <th class="p-4">Provider Ref ID</th>
              <th class="p-4 text-right">Aksi Kasir</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-800">
            <tr v-for="pay in paymentList" :key="pay.id" class="hover:bg-neutral-800/40 transition-colors">
              <td class="p-4 font-mono font-bold text-amber-400 text-sm">#{{ pay.order_number }}</td>
              <td class="p-4 font-semibold text-white">
                <span v-if="pay.method === 'PAY_AT_CASHIER'" class="text-amber-400">💵 Bayar di Kasir</span>
                <span v-else class="text-emerald-400">📱 {{ pay.method }}</span>
              </td>
              <td class="p-4 font-mono font-bold text-white">{{ formatRp(pay.amount) }}</td>
              <td class="p-4">
                <span
                  class="px-2.5 py-1 rounded-full font-bold text-[10px]"
                  :class="pay.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'"
                >
                  {{ pay.status }}
                </span>
              </td>
              <td class="p-4 font-mono text-[11px] text-neutral-400">{{ pay.provider_tx || '-' }}</td>
              <td class="p-4 text-right">
                <button
                  v-if="pay.method === 'PAY_AT_CASHIER' && pay.status === 'PENDING'"
                  @click="confirmCashPayment(pay.id)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow transition-all"
                >
                  Confirm Cash Paid
                </button>
                <span v-else class="text-neutral-500 text-[11px]">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup ts>
import { ref } from 'vue'
import { formatRp } from '~/utils/currency'

const isReconciling = ref(false)
const mismatchCount = ref(0)

const paymentList = ref<any[]>([
  { id: '1', order_number: 'PH1024', method: 'QRIS', amount: 33000, status: 'PAID', provider_tx: 'MID-129482918' },
  { id: '2', order_number: 'PH1025', method: 'PAY_AT_CASHIER', amount: 28000, status: 'PENDING', provider_tx: null },
  { id: '3', order_number: 'PH1026', method: 'QRIS', amount: 45000, status: 'PAID', provider_tx: 'MID-992182181' },
])

async function runReconciliation() {
  isReconciling.value = true
  setTimeout(() => {
    isReconciling.value = false
    alert('Rekonsiliasi selesai: Semua status pembayaran telah diselaraskan dengan provider Midtrans.')
  }, 1500)
}

function confirmCashPayment(id: string) {
  if (confirm('Konfirmasi bahwa customer telah membayarkan uang tunai di kasir?')) {
    const pay = paymentList.value.find(p => p.id === id)
    if (pay) {
      pay.status = 'PAID'
    }
  }
}
</script>

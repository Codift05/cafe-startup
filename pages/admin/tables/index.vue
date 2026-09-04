<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Dashboard Admin
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Manajemen Meja & QR Table</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Kelola QR unik per meja untuk pemesanan Dine In pelanggan.</p>
      </div>

      <button
        @click="showAddModal = true"
        class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all"
      >
        + Tambah Meja Baru
      </button>
    </div>

    <!-- Table Grid Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="table in tablesList"
        :key="table.id"
        class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-lg hover:border-neutral-700 transition-colors"
      >
        <!-- Table Header -->
        <div class="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-sm">
              🪑
            </span>
            <span class="font-bold text-base text-white">Meja {{ table.table_number }}</span>
          </div>
          <span
            class="px-2 py-0.5 rounded text-[10px] font-bold"
            :class="table.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
          >
            {{ table.status }}
          </span>
        </div>

        <!-- Generated QR Code Canvas / Visual Preview -->
        <div class="bg-white p-4 rounded-2xl flex flex-col items-center justify-center space-y-2">
          <img :src="getQrUrl(table.table_number, table.qr_token)" alt="QR Meja" class="w-36 h-36 object-contain" />
          <p class="text-[10px] text-neutral-600 font-mono font-bold uppercase tracking-wider">Philanthroffee</p>
        </div>

        <!-- Action Links -->
        <div class="space-y-2 text-xs">
          <div class="bg-neutral-950 border border-neutral-800 rounded-xl p-2 font-mono text-[10px] text-neutral-400 truncate">
            /t/{{ table.table_number }}?token={{ table.qr_token.slice(0, 8) }}...
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button
              @click="copyUrl(table.table_number, table.qr_token)"
              class="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-[11px] transition-colors"
            >
              📋 Copy Link
            </button>
            <button
              @click="regenerateToken(table.id)"
              class="py-1.5 px-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-medium text-[11px] transition-colors"
            >
              🔄 Reset Token
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Table Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <h3 class="text-lg font-bold text-white">Tambah Meja Baru</h3>
        <p class="text-xs text-neutral-400">Masukkan nomor meja yang akan ditambahkan ke sistem.</p>

        <div>
          <label class="block text-xs font-medium text-neutral-300 mb-1.5">Nomor Meja</label>
          <input
            v-model="newTableNumber"
            type="text"
            placeholder="Contoh: 08"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="showAddModal = false"
            class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
          >
            Batal
          </button>
          <button
            @click="addTable"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
          >
            Simpan Meja
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showAddModal = ref(false)
const newTableNumber = ref('')

const tablesList = ref<any[]>([
  { id: '1', table_number: '01', qr_token: 'token_01_abc123', status: 'ACTIVE' },
  { id: '2', table_number: '02', qr_token: 'token_02_xyz456', status: 'ACTIVE' },
  { id: '3', table_number: '03', qr_token: 'token_03_def789', status: 'ACTIVE' },
  { id: '4', table_number: '08', qr_token: 'token_08_qwe999', status: 'ACTIVE' },
])

function getQrUrl(tableNumber: string, token: string): string {
  const targetUrl = `https://order.philanthroffee.id/t/${tableNumber}?token=${token}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(targetUrl)}`
}

function copyUrl(tableNumber: string, token: string) {
  const targetUrl = `${window.location.origin}/t/${tableNumber}?token=${token}`
  navigator.clipboard.writeText(targetUrl)
  alert(`Link meja ${tableNumber} berhasil disalin!`)
}

function regenerateToken(id: string) {
  if (confirm('Regenerate token QR? Token lama akan menjadi tidak berlaku.')) {
    const table = tablesList.value.find(t => t.id === id)
    if (table) {
      table.qr_token = `token_${table.table_number}_${Math.random().toString(36).slice(2, 8)}`
    }
  }
}

function addTable() {
  if (!newTableNumber.value.trim()) return
  tablesList.value.push({
    id: String(Date.now()),
    table_number: newTableNumber.value.trim(),
    qr_token: `token_${newTableNumber.value.trim()}_${Math.random().toString(36).slice(2, 8)}`,
    status: 'ACTIVE',
  })
  newTableNumber.value = ''
  showAddModal.value = false
}
</script>

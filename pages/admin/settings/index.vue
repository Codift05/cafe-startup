<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Dashboard Admin
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Pengaturan Operasional Cafe</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Kontrol ketersediaan layanan pemesanan cafe Philanthroffee.</p>
      </div>

      <button
        @click="saveSettings"
        class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-all"
      >
        Simpan Perubahan
      </button>
    </div>

    <div class="max-w-3xl space-y-6">
      <!-- Pause Ordering Emergency Card -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>⏸️</span> Pause Pemesanan Cafe (Overload Mode)
            </h3>
            <p class="text-xs text-neutral-400 max-w-md mt-1">
              Jika diaktifkan, pelanggan tetap dapat melihat menu tetapi tombol checkout akan dinonaktifkan sementara.
            </p>
          </div>
          <button
            @click="isPaused = !isPaused"
            class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none"
            :class="isPaused ? 'bg-amber-500' : 'bg-neutral-800'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-neutral-950 transition-transform font-bold text-[10px] flex items-center justify-center"
              :class="isPaused ? 'translate-x-8 text-amber-500' : 'translate-x-1 text-neutral-400'"
            >
              {{ isPaused ? 'ON' : 'OFF' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Dine In & Pickup Toggles -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-400">Mode Layanan Pemesanan</h3>

        <div class="space-y-4 divide-y divide-neutral-800">
          <!-- Dine In Toggle -->
          <div class="pt-4 first:pt-0 flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-white">Layanan Dine In (Scan QR Meja)</h4>
              <p class="text-xs text-neutral-400">Izinkan pemesanan dari QR meja.</p>
            </div>
            <button
              @click="dineInEnabled = !dineInEnabled"
              class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors"
              :class="dineInEnabled ? 'bg-emerald-500' : 'bg-neutral-800'"
            >
              <span class="inline-block h-5 w-5 transform rounded-full bg-neutral-950 transition-transform" :class="dineInEnabled ? 'translate-x-8' : 'translate-x-1'"></span>
            </button>
          </div>

          <!-- Pickup Toggle -->
          <div class="pt-4 flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-white">Layanan Pickup / Takeaway</h4>
              <p class="text-xs text-neutral-400">Izinkan pemesanan tanpa scan meja.</p>
            </div>
            <button
              @click="pickupEnabled = !pickupEnabled"
              class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors"
              :class="pickupEnabled ? 'bg-emerald-500' : 'bg-neutral-800'"
            >
              <span class="inline-block h-5 w-5 transform rounded-full bg-neutral-950 transition-transform" :class="pickupEnabled ? 'translate-x-8' : 'translate-x-1'"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Prep Time Settings -->
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-400">Estimasi Waktu Penyajian</h3>

        <div class="max-w-xs space-y-2">
          <label class="block text-xs font-medium text-neutral-300">Estimasi waktu penyajian default (menit)</label>
          <input
            v-model.number="defaultPrepTime"
            type="number"
            min="1"
            max="60"
            class="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2 text-sm"
          />
          <p class="text-[11px] text-neutral-500">Estimasi ini akan ditampilkan kepada pelanggan di halaman tracking status.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup ts>
import { ref } from 'vue'

const isPaused = ref(false)
const dineInEnabled = ref(true)
const pickupEnabled = ref(true)
const defaultPrepTime = ref(8)

function saveSettings() {
  alert('Pengaturan operasional berhasil diperbarui!')
}
</script>

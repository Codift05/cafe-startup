<template>
  <div class="ph-page" style="background: var(--ph-bg); min-height: 100dvh; display: flex; flex-direction: column;">
    <!-- Top Header Bar -->
    <header style="background: #ffffff; border-bottom: 1px solid var(--ph-border); padding: 12px 24px; position: sticky; top: 0; z-index: 30; box-shadow: var(--ph-shadow-sm);">
      <div style="max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <!-- Brand -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--ph-radius-md); background: var(--ph-primary); color: #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          </div>
          <div>
            <h1 style="font-family: var(--ph-font-display); font-size: 1.125rem; font-weight: 700; color: var(--ph-text); line-height: 1.2;">Philanthroffee</h1>
            <p style="font-size: 0.75rem; color: var(--ph-text-secondary);">Pembayaran &amp; Rekonsiliasi · Senopati</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav style="display: flex; align-items: center; gap: 8px;">
          <NuxtLink to="/admin" class="menu-tab-btn" style="text-decoration: none;">← Dashboard Admin</NuxtLink>
          <NuxtLink to="/admin/payments" class="menu-tab-btn menu-tab-btn--active" style="text-decoration: none;">Pembayaran &amp; Rekonsiliasi</NuxtLink>
        </nav>

        <button @click="runReconciliation" :disabled="isReconciling" class="ph-btn ph-btn--primary ph-btn--sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span>{{ isReconciling ? 'Menyelaraskan...' : 'Jalankan Auto-Rekonsiliasi' }}</span>
        </button>
      </div>
    </header>

    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div>
        <span class="ph-label" style="color: var(--ph-accent);">FINANCE &amp; RECONCILIATION</span>
        <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">Pembayaran &amp; Rekonsiliasi Kasir</h2>
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Konfirmasi pembayaran tunai kasir &amp; verifikasi transaksi otomatis dengan provider Midtrans.</p>
      </div>

      <!-- Mismatch Alert Banner -->
      <div v-if="mismatchCount > 0" class="ph-card" style="padding: 16px; background: rgba(196, 123, 73, 0.08); border: 1px solid var(--ph-accent); border-radius: var(--ph-radius-xl); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--ph-radius-md); background: var(--ph-accent); color: #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <h3 style="font-size: 0.9375rem; font-weight: 700; color: var(--ph-accent);">Terdeteksi {{ mismatchCount }} Transaksi Perlu Sinkronisasi</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary);">Status di Midtrans lunas (PAID) namun status internal masih PENDING.</p>
          </div>
        </div>
        <button @click="runReconciliation" class="ph-btn ph-btn--primary ph-btn--sm" style="background: var(--ph-accent);">
          Sinkronkan Sekarang
        </button>
      </div>

      <!-- Payments List Table -->
      <div class="ph-card" style="background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); overflow: hidden; box-shadow: var(--ph-shadow-sm);">
        <div style="padding: 16px; border-bottom: 1px solid var(--ph-border); font-weight: 700; color: var(--ph-text);">
          Daftar Transaksi Pembayaran
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left;">
            <thead>
              <tr style="background: var(--ph-bg-elevated); border-bottom: 1px solid var(--ph-border); color: var(--ph-text-secondary); font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 14px 16px;">No. Order</th>
                <th style="padding: 14px 16px;">Metode Pembayaran</th>
                <th style="padding: 14px 16px;">Jumlah Total</th>
                <th style="padding: 14px 16px;">Status Pembayaran</th>
                <th style="padding: 14px 16px;">Provider Ref ID</th>
                <th style="padding: 14px 16px; text-align: right;">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pay in paymentList" :key="pay.id" style="border-bottom: 1px solid var(--ph-border);">
                <td style="padding: 14px 16px; font-weight: 700; color: var(--ph-primary); font-family: var(--ph-font-mono);">#{{ pay.order_number }}</td>
                <td style="padding: 14px 16px; font-weight: 600; color: var(--ph-text);">
                  <span v-if="pay.method === 'PAY_AT_CASHIER'" style="color: var(--ph-accent);">Bayar di Kasir</span>
                  <span v-else style="color: var(--ph-primary);">{{ pay.method }}</span>
                </td>
                <td style="padding: 14px 16px; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-mono);">{{ formatRp(pay.amount) }}</td>
                <td style="padding: 14px 16px;">
                  <span class="ph-badge" :class="pay.status === 'PAID' ? 'ph-badge--success' : 'ph-badge--warning'">
                    {{ pay.status }}
                  </span>
                </td>
                <td style="padding: 14px 16px; font-family: var(--ph-font-mono); font-size: 0.8125rem; color: var(--ph-text-secondary);">{{ pay.provider_tx || '-' }}</td>
                <td style="padding: 14px 16px; text-align: right;">
                  <button v-if="pay.method === 'PAY_AT_CASHIER' && pay.status === 'PENDING'" @click="confirmCashPayment(pay.id)" class="ph-btn ph-btn--primary ph-btn--sm" style="font-size: 0.75rem;">
                    Confirm Cash Paid
                  </button>
                  <span v-else style="color: var(--ph-text-muted); font-size: 0.8125rem;">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.menu-tab-btn {
  padding: 6px 14px;
  border-radius: var(--ph-radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ph-text-secondary);
  border: 1px solid transparent;
  transition: all var(--ph-transition-fast);
}
.menu-tab-btn:hover {
  background: var(--ph-bg-elevated);
  color: var(--ph-text);
}
.menu-tab-btn--active {
  background: var(--ph-primary);
  color: #ffffff !important;
  font-weight: 600;
}
</style>

<script setup lang="ts">
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

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
            <p style="font-size: 0.75rem; color: var(--ph-text-secondary);">Meja &amp; QR Table · Senopati</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav style="display: flex; align-items: center; gap: 8px;">
          <NuxtLink to="/admin" class="menu-tab-btn" style="text-decoration: none;">← Dashboard Admin</NuxtLink>
          <NuxtLink to="/admin/tables" class="menu-tab-btn menu-tab-btn--active" style="text-decoration: none;">Meja &amp; QR Code</NuxtLink>
        </nav>

        <button @click="showAddModal = true" class="ph-btn ph-btn--primary ph-btn--sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Tambah Meja Baru</span>
        </button>
      </div>
    </header>

    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div>
        <span class="ph-label" style="color: var(--ph-accent);">TABLE MANAGEMENT &amp; QR TOKEN</span>
        <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">Meja &amp; QR Code Dine In</h2>
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Kelola QR unik per meja untuk pemesanan Dine In pelanggan tanpa perlu login.</p>
      </div>

      <!-- Table Grid Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
        <div v-for="table in tablesList" :key="table.id" class="ph-card" style="background: #ffffff; border: 1px solid var(--ph-border); border-radius: var(--ph-radius-xl); padding: 20px; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--ph-shadow-sm);">
          
          <!-- Table Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--ph-border); padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: var(--ph-radius-md); background: rgba(39, 61, 46, 0.08); color: var(--ph-primary); display: flex; align-items: center; justify-content: center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <span style="font-weight: 700; font-size: 1rem; color: var(--ph-text); font-family: var(--ph-font-display);">Meja {{ table.table_number }}</span>
            </div>
            <span class="ph-badge" :class="table.status === 'ACTIVE' ? 'ph-badge--success' : 'ph-badge--secondary'">
              {{ table.status }}
            </span>
          </div>

          <!-- Generated QR Code Canvas / Visual Preview -->
          <div style="background: var(--ph-bg-elevated); padding: 16px; border-radius: var(--ph-radius-lg); border: 1px solid var(--ph-border); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
            <img :src="getQrUrl(table.table_number, table.qr_token)" alt="QR Meja" style="width: 140px; height: 140px; object-fit: contain; border-radius: var(--ph-radius-md); background: #ffffff; padding: 6px;" />
            <p style="font-size: 0.6875rem; color: var(--ph-text-secondary); font-family: var(--ph-font-mono); font-weight: 700; text-transform: uppercase;">Philanthroffee Meja {{ table.table_number }}</p>
          </div>

          <!-- Action Links -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="background: var(--ph-bg-elevated); border: 1px solid var(--ph-border); border-radius: var(--ph-radius-md); padding: 8px; font-family: var(--ph-font-mono); font-size: 0.6875rem; color: var(--ph-text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
              /t/{{ table.table_number }}?token={{ table.qr_token.slice(0, 8) }}...
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button @click="copyUrl(table.table_number, table.qr_token)" class="ph-btn ph-btn--secondary ph-btn--sm" style="font-size: 0.75rem; justify-content: center;">
                Copy Link
              </button>
              <button @click="regenerateToken(table.id)" class="ph-btn ph-btn--secondary ph-btn--sm" style="font-size: 0.75rem; justify-content: center; color: var(--ph-error);">
                Reset Token
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Table Modal -->
      <div v-if="showAddModal" style="position: fixed; inset: 0; z-index: 50; background: rgba(31, 27, 25, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px;">
        <div class="ph-card ph-animate-in" style="width: 100%; max-width: 440px; background: #ffffff; border-radius: var(--ph-radius-xl); padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--ph-shadow-lg);">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Tambah Meja Baru</h3>
          <p style="font-size: 0.8125rem; color: var(--ph-text-secondary);">Masukkan nomor meja yang akan ditambahkan ke sistem kedai.</p>

          <div>
            <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: var(--ph-text); margin-bottom: 6px;">Nomor Meja</label>
            <input v-model="newTableNumber" type="text" placeholder="Contoh: 08" style="width: 100%; background: var(--ph-bg); border: 1px solid var(--ph-border); border-radius: var(--ph-radius-md); padding: 10px 14px; font-size: 0.875rem; outline: none;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button @click="showAddModal = false" class="ph-btn ph-btn--secondary">Batal</button>
            <button @click="addTable" class="ph-btn ph-btn--primary">Simpan Meja</button>
          </div>
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

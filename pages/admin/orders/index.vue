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
            <p style="font-size: 0.75rem; color: var(--ph-text-secondary);">Kelola Pesanan · Senopati</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav style="display: flex; align-items: center; gap: 8px;">
          <NuxtLink to="/admin" class="menu-tab-btn" style="text-decoration: none;">← Dashboard Admin</NuxtLink>
          <NuxtLink to="/admin/orders" class="menu-tab-btn menu-tab-btn--active" style="text-decoration: none;">Kelola Pesanan</NuxtLink>
        </nav>

        <button @click="fetchOrders" class="ph-btn ph-btn--secondary ph-btn--sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span>Refresh Data</span>
        </button>
      </div>
    </header>

    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      <div>
        <span class="ph-label" style="color: var(--ph-accent);">RIWAYAT &amp; DAFTAR PESANAN</span>
        <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">Kelola Seluruh Pesanan</h2>
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Pantau daftar transaksi pesanan masuk, status pembuatan, dan riwayat pesanan.</p>
      </div>

      <!-- Filter Bar -->
      <div class="ph-card" style="padding: 16px; background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); display: flex; flex-wrap: wrap; items-center; gap: 12px;">
        <span style="font-size: 0.8125rem; font-weight: 700; color: var(--ph-text-secondary); text-transform: uppercase;">Filter Status:</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button v-for="s in statusOptions" :key="s.value" @click="selectedStatus = s.value" class="cat-pill" :class="{ 'cat-pill--active': selectedStatus === s.value }">
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Table Container -->
      <div class="ph-card" style="background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); overflow: hidden; box-shadow: var(--ph-shadow-sm);">
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left;">
            <thead>
              <tr style="background: var(--ph-bg-elevated); border-bottom: 1px solid var(--ph-border); color: var(--ph-text-secondary); font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 14px 16px;">No. Order</th>
                <th style="padding: 14px 16px;">Tipe &amp; Meja</th>
                <th style="padding: 14px 16px;">Customer</th>
                <th style="padding: 14px 16px;">Total</th>
                <th style="padding: 14px 16px;">Status Pesanan</th>
                <th style="padding: 14px 16px;">Waktu</th>
                <th style="padding: 14px 16px; text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id" style="border-bottom: 1px solid var(--ph-border);">
                <td style="padding: 14px 16px; font-weight: 700; color: var(--ph-primary); font-family: var(--ph-font-mono);">#{{ order.order_number }}</td>
                <td style="padding: 14px 16px;">
                  <span class="ph-badge ph-badge--accent">
                    {{ order.order_type === 'DINE_IN' ? `Dine In (Meja ${order.table_number || '-'})` : 'Pickup' }}
                  </span>
                </td>
                <td style="padding: 14px 16px; font-weight: 600; color: var(--ph-text);">{{ order.customer_name }}</td>
                <td style="padding: 14px 16px; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-mono);">{{ formatRp(order.total) }}</td>
                <td style="padding: 14px 16px;">
                  <span class="ph-badge" :class="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td style="padding: 14px 16px; color: var(--ph-text-secondary); font-size: 0.8125rem;">{{ new Date(order.created_at).toLocaleTimeString() }}</td>
                <td style="padding: 14px 16px; text-align: right;">
                  <NuxtLink :to="`/order/${order.order_number}`" style="color: var(--ph-accent); font-weight: 600; text-decoration: none; font-size: 0.8125rem;">
                    Detail Tracking →
                  </NuxtLink>
                </td>
              </tr>
              <tr v-if="filteredOrders.length === 0">
                <td colspan="7" style="padding: 48px 16px; text-align: center; color: var(--ph-text-muted);">
                  Tidak ada pesanan ditemukan
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
.cat-pill {
  padding: 6px 14px;
  border-radius: var(--ph-radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ph-text-secondary);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  cursor: pointer;
  white-space: nowrap;
}
.cat-pill--active {
  background: var(--ph-primary);
  color: #ffffff;
  border-color: var(--ph-primary);
  font-weight: 600;
}
</style>

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
    case 'WAITING_PAYMENT': return 'ph-badge--warning'
    case 'PAID': return 'ph-badge--success'
    case 'PREPARING': return 'ph-badge--info'
    case 'READY': return 'ph-badge--success'
    case 'COMPLETED': return 'ph-badge--secondary'
    default: return 'ph-badge--secondary'
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

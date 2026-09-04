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
            <p style="font-size: 0.75rem; color: var(--ph-text-secondary);">Coffee, Herbs &amp; Spices · Senopati</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav style="display: flex; align-items: center; gap: 8px;">
          <NuxtLink to="/menu" class="menu-tab-btn" style="text-decoration: none;">Menu Pelanggan</NuxtLink>
          <NuxtLink to="/staff/kds" class="menu-tab-btn menu-tab-btn--active" style="text-decoration: none;">Antrean Barista (KDS)</NuxtLink>
          <NuxtLink to="/admin/menu" class="menu-tab-btn" style="text-decoration: none;">Admin Stok &amp; Menu</NuxtLink>
        </nav>

        <!-- Mode Indicator -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--ph-bg-elevated); border: 1px solid var(--ph-border); border-radius: 999px; font-size: 0.8125rem; color: var(--ph-text-secondary);">
            <span class="ph-status-dot ph-status-dot--pulse" style="background: var(--ph-success);"></span>
            <span>Terhubung Realtime</span>
          </div>
          <button @click="fetchOrders" class="ph-btn ph-btn--secondary ph-btn--sm" style="padding: 6px 14px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Sub-header Title -->
    <div style="max-width: 1400px; margin: 0 auto; width: 100%; padding: 24px 24px 8px;">
      <span class="ph-label" style="color: var(--ph-accent);">OPERASIONAL BAR &amp; KASIR</span>
      <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">KDS Barista Station</h2>
      <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Kelola antrean racikan minuman, pesanan makanan, dan status sajian meja secara realtime.</p>
    </div>

    <!-- Main Kanban 3-Column Display -->
    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 16px 24px 32px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start;">
      
      <!-- Column 1: BARU (PAID) -->
      <section class="ph-card" style="padding: 16px; background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); display: flex; flex-direction: column; gap: 16px; min-height: 540px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--ph-border);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--ph-primary); font-size: 0.9375rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--ph-primary); display: inline-block;"></span>
            <span>Pesanan Baru</span>
          </div>
          <span class="ph-badge ph-badge--info" style="padding: 4px 10px; font-size: 0.8125rem;">
            {{ baruOrders.length }} Tiket
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
          <div v-for="order in baruOrders" :key="order.id" class="ph-card ph-animate-in" style="padding: 16px; background: var(--ph-bg-elevated); border: 1.5px solid var(--ph-border); border-radius: var(--ph-radius-lg); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="ph-price" style="font-size: 1.125rem; font-weight: 700; color: var(--ph-primary);">#{{ order.order_number }}</span>
                <p v-if="order.customer_name" style="font-size: 0.8125rem; font-weight: 600; color: var(--ph-text); margin-top: 2px;">{{ order.customer_name }}</p>
              </div>
              <div style="text-align: right;">
                <span class="ph-badge ph-badge--accent">
                  {{ order.order_type === 'DINE_IN' ? `Meja ${order.table_number || '-'}` : 'Pickup' }}
                </span>
                <p style="font-size: 0.75rem; color: var(--ph-text-secondary); margin-top: 4px;">{{ getElapsedTime(order.created_at) }}m lalu</p>
              </div>
            </div>

            <!-- Items -->
            <div style="border-top: 1px solid var(--ph-border); border-bottom: 1px solid var(--ph-border); padding: 10px 0; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="item in order.items" :key="item.id" style="font-size: 0.875rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--ph-text);">
                  <span><strong style="color: var(--ph-primary);">{{ item.quantity }}x</strong> {{ item.product_name }}</span>
                  <span v-if="item.variant_name" style="font-size: 0.75rem; color: var(--ph-text-secondary); font-weight: 400;">{{ item.variant_name }}</span>
                </div>
                <div v-if="item.modifiers && item.modifiers.length > 0" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                  <span v-for="mod in item.modifiers" :key="mod" class="ph-caption" style="background: #ffffff; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--ph-border);">
                    + {{ mod }}
                  </span>
                </div>
                <p v-if="item.notes" style="font-size: 0.75rem; color: var(--ph-accent); font-style: italic; margin-top: 4px;">
                  "{{ item.notes }}"
                </p>
              </div>
            </div>

            <button @click="updateStatus(order.id, 'PREPARING')" class="ph-btn ph-btn--primary ph-btn--full">
              <span>Mulai Buat Tiket Ini</span>
            </button>
          </div>

          <div v-if="baruOrders.length === 0" style="text-align: center; padding: 48px 0; color: var(--ph-text-muted); font-size: 0.875rem;">
            Belum ada pesanan baru
          </div>
        </div>
      </section>

      <!-- Column 2: DIBUAT (PREPARING) -->
      <section class="ph-card" style="padding: 16px; background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); display: flex; flex-direction: column; gap: 16px; min-height: 540px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--ph-border);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--ph-accent); font-size: 0.9375rem;">
            <span class="ph-status-dot ph-status-dot--pulse" style="background: var(--ph-accent);"></span>
            <span>Sedang Dibuat</span>
          </div>
          <span class="ph-badge ph-badge--warning" style="padding: 4px 10px; font-size: 0.8125rem;">
            {{ sedangDibuatOrders.length }} Tiket
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
          <div v-for="order in sedangDibuatOrders" :key="order.id" class="ph-card ph-animate-in" style="padding: 16px; background: var(--ph-bg-elevated); border: 1.5px solid var(--ph-accent); border-radius: var(--ph-radius-lg); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="ph-price" style="font-size: 1.125rem; font-weight: 700; color: var(--ph-accent);">#{{ order.order_number }}</span>
                <p v-if="order.customer_name" style="font-size: 0.8125rem; font-weight: 600; color: var(--ph-text); margin-top: 2px;">{{ order.customer_name }}</p>
              </div>
              <div style="text-align: right;">
                <span class="ph-badge ph-badge--accent">
                  {{ order.order_type === 'DINE_IN' ? `Meja ${order.table_number || '-'}` : 'Pickup' }}
                </span>
                <p style="font-size: 0.75rem; color: var(--ph-accent); font-weight: 600; margin-top: 4px;">{{ getElapsedTime(order.created_at) }}m diproses</p>
              </div>
            </div>

            <!-- Items -->
            <div style="border-top: 1px solid var(--ph-border); border-bottom: 1px solid var(--ph-border); padding: 10px 0; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="item in order.items" :key="item.id" style="font-size: 0.875rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--ph-text);">
                  <span><strong style="color: var(--ph-accent);">{{ item.quantity }}x</strong> {{ item.product_name }}</span>
                  <span v-if="item.variant_name" style="font-size: 0.75rem; color: var(--ph-text-secondary); font-weight: 400;">{{ item.variant_name }}</span>
                </div>
                <div v-if="item.modifiers && item.modifiers.length > 0" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
                  <span v-for="mod in item.modifiers" :key="mod" class="ph-caption" style="background: #ffffff; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--ph-border);">
                    + {{ mod }}
                  </span>
                </div>
                <p v-if="item.notes" style="font-size: 0.75rem; color: var(--ph-accent); font-style: italic; margin-top: 4px;">
                  "{{ item.notes }}"
                </p>
              </div>
            </div>

            <button @click="updateStatus(order.id, 'READY')" class="ph-btn ph-btn--primary ph-btn--full" style="background: var(--ph-accent);">
              <span>Tandai Siap</span>
            </button>
          </div>

          <div v-if="sedangDibuatOrders.length === 0" style="text-align: center; padding: 48px 0; color: var(--ph-text-muted); font-size: 0.875rem;">
            Belum ada pesanan yang sedang dibuat
          </div>
        </div>
      </section>

      <!-- Column 3: SIAP (READY) -->
      <section class="ph-card" style="padding: 16px; background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); display: flex; flex-direction: column; gap: 16px; min-height: 540px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--ph-border);">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--ph-success); font-size: 0.9375rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: var(--ph-success); display: inline-block;"></span>
            <span>Siap Disajikan</span>
          </div>
          <span class="ph-badge ph-badge--success" style="padding: 4px 10px; font-size: 0.8125rem;">
            {{ siapOrders.length }} Tiket
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
          <div v-for="order in siapOrders" :key="order.id" class="ph-card ph-animate-in" style="padding: 16px; background: var(--ph-bg-elevated); border: 1.5px solid var(--ph-success); border-radius: var(--ph-radius-lg); display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="ph-price" style="font-size: 1.125rem; font-weight: 700; color: var(--ph-success);">#{{ order.order_number }}</span>
                <p v-if="order.customer_name" style="font-size: 0.8125rem; font-weight: 600; color: var(--ph-text); margin-top: 2px;">{{ order.customer_name }}</p>
              </div>
              <div style="text-align: right;">
                <span class="ph-badge ph-badge--success">
                  {{ order.order_type === 'DINE_IN' ? `Meja ${order.table_number || '-'}` : 'Pickup' }}
                </span>
                <p style="font-size: 0.75rem; color: var(--ph-success); font-weight: 600; margin-top: 4px;">Siap Diantar</p>
              </div>
            </div>

            <!-- Items -->
            <div style="border-top: 1px solid var(--ph-border); border-bottom: 1px solid var(--ph-border); padding: 10px 0; display: flex; flex-direction: column; gap: 8px;">
              <div v-for="item in order.items" :key="item.id" style="font-size: 0.875rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--ph-text);">
                  <span><strong style="color: var(--ph-success);">{{ item.quantity }}x</strong> {{ item.product_name }}</span>
                </div>
              </div>
            </div>

            <button @click="updateStatus(order.id, 'COMPLETED')" class="ph-btn ph-btn--secondary ph-btn--full">
              <span>Selesaikan Pesanan</span>
            </button>
          </div>

          <div v-if="siapOrders.length === 0" style="text-align: center; padding: 48px 0; color: var(--ph-text-muted); font-size: 0.875rem;">
            Belum ada pesanan yang siap
          </div>
        </div>
      </section>
    </main>

    <!-- Equipment Status Bar at bottom -->
    <footer style="background: #ffffff; border-top: 1px solid var(--ph-border); padding: 12px 24px; font-size: 0.8125rem; color: var(--ph-text-secondary);">
      <div style="max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <span>Espresso Bar 01</span>
          <span>·</span>
          <span>Grinder Mahlkönig EK43s (Dial 2.4)</span>
          <span>·</span>
          <span>Boiler 93.2°C / 9.0 Bar</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="ph-status-dot ph-status-dot--pulse" style="background: var(--ph-success);"></span>
          <span>Sinkronisasi POS &amp; KDS Realtime: Terhubung Aktif</span>
        </div>
      </div>
    </footer>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

const orders = ref<any[]>([])
let pollTimer: any = null
const { getAccessToken } = useAuth()

async function authHeaders(): Promise<Record<string, string> | null> {
  const token = await getAccessToken()
  if (!token) {
    await navigateTo('/staff/login')
    return null
  }
  return { Authorization: `Bearer ${token}` }
}

const baruOrders = computed(() => orders.value.filter(o => o.status === 'PAID'))
const sedangDibuatOrders = computed(() => orders.value.filter(o => o.status === 'PREPARING'))
const siapOrders = computed(() => orders.value.filter(o => o.status === 'READY'))

function getElapsedTime(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime()
  return Math.floor(diff / 60000)
}

async function fetchOrders() {
  try {
    const headers = await authHeaders()
    if (!headers) return
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/staff/orders?status=PAID,PREPARING,READY', { headers })
    orders.value = res.data
  } catch (err) {
    console.error('Fetch KDS error:', err)
  }
}

async function updateStatus(orderId: string, status: string) {
  try {
    const headers = await authHeaders()
    if (!headers) return
    await $fetch(`/api/staff/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
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

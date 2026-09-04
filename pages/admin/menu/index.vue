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
          <NuxtLink to="/staff/kds" class="menu-tab-btn" style="text-decoration: none;">Antrean Barista (KDS)</NuxtLink>
          <NuxtLink to="/admin/menu" class="menu-tab-btn menu-tab-btn--active" style="text-decoration: none;">Admin Stok &amp; Menu</NuxtLink>
        </nav>

        <!-- Action Add -->
        <button @click="showAddModal = true" class="ph-btn ph-btn--primary ph-btn--sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Tambah Menu</span>
        </button>
      </div>
    </header>

    <!-- Content Container -->
    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
      
      <!-- Sub-header Title -->
      <div>
        <span class="ph-label" style="color: var(--ph-accent);">OPERASIONAL BAR &amp; KASIR</span>
        <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">Menu &amp; Ketersediaan Stok</h2>
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Kelola katalog produk, takaran racikan, harga, dan kontrol status ketersediaan meja secara instan.</p>
      </div>

      <!-- Filter Bar -->
      <div class="ph-card" style="padding: 16px; background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); display: flex; flex-wrap: wrap; items-center; justify-content: space-between; gap: 16px;">
        <!-- Search Input -->
        <div style="position: relative; width: 300px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--ph-text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Cari menu atau racikan..." style="width: 100%; padding: 8px 12px 8px 38px; border-radius: var(--ph-radius-md); border: 1px solid var(--ph-border); font-size: 0.875rem; background: var(--ph-bg-elevated); color: var(--ph-text);" />
        </div>

        <!-- Categories -->
        <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto;">
          <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat" class="cat-pill" :class="{ 'cat-pill--active': selectedCategory === cat }">
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        <div v-for="product in filteredProducts" :key="product.id" class="ph-card ph-animate-in" style="background: #ffffff; border-radius: var(--ph-radius-xl); border: 1px solid var(--ph-border); padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: all var(--ph-transition-fast);" :style="{ opacity: product.availability === 'SOLD_OUT' ? 0.75 : 1 }">
          
          <!-- Image / Visual -->
          <div style="width: 100%; height: 160px; border-radius: var(--ph-radius-lg); background: var(--ph-bg-elevated); border: 1px solid var(--ph-border); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
            <img v-if="product.image_url" :src="product.image_url" alt="Produk" style="width: 100%; height: 100%; object-fit: cover;" />
            <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ph-primary);"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>

            <span v-if="product.availability === 'SOLD_OUT'" class="ph-badge ph-badge--danger" style="position: absolute; top: 10px; right: 10px; font-weight: 700;">
              SOLD OUT
            </span>
            <span v-else class="ph-badge ph-badge--success" style="position: absolute; top: 10px; right: 10px; font-weight: 600;">
              TERSEDIA
            </span>
          </div>

          <!-- Description -->
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <span class="ph-caption" style="color: var(--ph-accent); font-weight: 600;">{{ product.category }}</span>
            <h3 style="font-size: 1rem; font-weight: 700; color: var(--ph-text);">{{ product.name }}</h3>
            <span class="ph-price" style="font-size: 1.125rem; color: var(--ph-primary); font-weight: 700; margin-top: 4px;">{{ formatRp(product.base_price) }}</span>
          </div>

          <!-- Status Toggle Action -->
          <div style="border-top: 1px solid var(--ph-border); padding-top: 12px; display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
            <span style="font-size: 0.8125rem; color: var(--ph-text-secondary);">Ketersediaan:</span>
            <button @click="toggleAvailability(product.id)" class="ph-btn ph-btn--sm" :class="product.availability === 'AVAILABLE' ? 'ph-btn--secondary' : 'ph-btn--primary'" style="font-size: 0.75rem;">
              <span>{{ product.availability === 'AVAILABLE' ? 'Tandai Sold Out' : 'Tandai Tersedia' }}</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Add Product -->
    <div v-if="showAddModal" style="position: fixed; inset: 0; z-index: 50; background: rgba(31, 27, 25, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px;">
      <div class="ph-card ph-animate-in" style="width: 100%; max-width: 440px; background: #ffffff; border-radius: var(--ph-radius-2xl); border: 1px solid var(--ph-border); padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--ph-shadow-xl);">
        <h3 class="ph-heading-lg" style="color: var(--ph-text);">Tambah Menu &amp; Racikan</h3>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.875rem;">
          <div>
            <label style="display: block; font-weight: 600; color: var(--ph-text); margin-bottom: 4px;">Nama Menu</label>
            <input v-model="newProduct.name" type="text" placeholder="Contoh: Aren Latte" style="width: 100%; padding: 8px 12px; border-radius: var(--ph-radius-md); border: 1px solid var(--ph-border); background: var(--ph-bg-elevated); color: var(--ph-text);" />
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: var(--ph-text); margin-bottom: 4px;">Kategori</label>
            <select v-model="newProduct.category" style="width: 100%; padding: 8px 12px; border-radius: var(--ph-radius-md); border: 1px solid var(--ph-border); background: var(--ph-bg-elevated); color: var(--ph-text);">
              <option value="Coffee">Coffee</option>
              <option value="Non-Coffee">Non-Coffee</option>
              <option value="Herbs &amp; Spices">Herbs &amp; Spices</option>
              <option value="Food &amp; Pastry">Food &amp; Pastry</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-weight: 600; color: var(--ph-text); margin-bottom: 4px;">Harga Dasar (Rp)</label>
            <input v-model.number="newProduct.base_price" type="number" placeholder="28000" style="width: 100%; padding: 8px 12px; border-radius: var(--ph-radius-md); border: 1px solid var(--ph-border); background: var(--ph-bg-elevated); color: var(--ph-text);" />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
          <button @click="showAddModal = false" class="ph-btn ph-btn--secondary">Batal</button>
          <button @click="addProduct" class="ph-btn ph-btn--primary">Simpan Menu</button>
        </div>
      </div>
    </div>
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
import { ref, computed } from 'vue'
import { formatRp } from '~/utils/currency'

const showAddModal = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('Semua')

const categories = ['Semua', 'Coffee', 'Non-Coffee', 'Pastry', 'Manual Brew']

const products = ref<any[]>([
  { id: '1', name: 'Philanthroffee Signature Espresso', category: 'Coffee', base_price: 28000, availability: 'AVAILABLE', image_url: null },
  { id: '2', name: 'Caramel Macchiato Velvet', category: 'Coffee', base_price: 32000, availability: 'AVAILABLE', image_url: null },
  { id: '3', name: 'Matcha Latte Artisan', category: 'Non-Coffee', base_price: 30000, availability: 'AVAILABLE', image_url: null },
  { id: '4', name: 'Butter Croissant Premium', category: 'Pastry', base_price: 22000, availability: 'SOLD_OUT', image_url: null },
])

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchesCat = selectedCategory.value === 'Semua' || p.category === selectedCategory.value
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCat && matchesSearch
  })
})

function toggleAvailability(id: string) {
  const p = products.value.find(prod => prod.id === id)
  if (p) {
    p.availability = p.availability === 'AVAILABLE' ? 'SOLD_OUT' : 'AVAILABLE'
  }
}

function addProduct() {
  if (!newProduct.value.name || !newProduct.value.base_price) return
  products.value.push({
    id: String(Date.now()),
    name: newProduct.value.name,
    category: newProduct.value.category,
    base_price: newProduct.value.base_price,
    availability: 'AVAILABLE',
    image_url: null,
  })
  showAddModal.value = false
  newProduct.value = { name: '', category: 'Coffee', base_price: 0 }
}

const newProduct = ref({
  name: '',
  category: 'Coffee',
  base_price: 0,
})
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/admin" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mb-1">
          ← Dashboard Admin
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white">Manajemen Menu Cafe</h1>
        <p class="text-xs text-neutral-400 mt-0.5">Atur daftar produk, harga, varian, dan status stok (Sold Out).</p>
      </div>

      <button
        @click="showAddModal = true"
        class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow transition-all"
      >
        + Tambah Menu Baru
      </button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-xs">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama produk..."
          class="w-full sm:w-64 bg-neutral-950 border border-neutral-800 focus:border-amber-500 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none"
        />
      </div>

      <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap font-medium"
          :class="selectedCategory === cat ? 'bg-amber-500 text-neutral-950 border-amber-500 font-bold' : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg hover:border-neutral-700 transition-colors relative"
        :class="{ 'opacity-65': product.availability === 'SOLD_OUT' }"
      >
        <!-- Product Image Placeholder / Visual -->
        <div class="w-full h-36 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-3xl overflow-hidden relative">
          <img v-if="product.image_url" :src="product.image_url" alt="Produk" class="w-full h-full object-cover" />
          <span v-else>☕</span>

          <span
            v-if="product.availability === 'SOLD_OUT'"
            class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow"
          >
            HABIS
          </span>
        </div>

        <!-- Details -->
        <div>
          <div class="text-xs text-amber-400 font-semibold uppercase tracking-wider">{{ product.category }}</div>
          <h3 class="font-bold text-sm text-white line-clamp-1">{{ product.name }}</h3>
          <p class="text-xs text-neutral-400 font-mono font-bold mt-1">{{ formatRp(product.base_price) }}</p>
        </div>

        <!-- Actions & Sold Out Toggle -->
        <div class="border-t border-neutral-800 pt-3 flex items-center justify-between">
          <span class="text-[11px] text-neutral-400 font-medium">Status Stok:</span>
          <button
            @click="toggleAvailability(product.id)"
            class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="product.availability === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
          >
            <span>{{ product.availability === 'AVAILABLE' ? '🟢 Ready' : '🔴 Sold Out' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <h3 class="text-lg font-bold text-white">Tambah Menu Baru</h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-medium text-neutral-300 mb-1">Nama Produk</label>
            <input v-model="newProduct.name" type="text" placeholder="Contoh: Sea Salt Latte" class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white" />
          </div>
          <div>
            <label class="block font-medium text-neutral-300 mb-1">Kategori</label>
            <select v-model="newProduct.category" class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white">
              <option value="Coffee">Coffee</option>
              <option value="Non-Coffee">Non-Coffee</option>
              <option value="Pastry">Pastry</option>
              <option value="Manual Brew">Manual Brew</option>
            </select>
          </div>
          <div>
            <label class="block font-medium text-neutral-300 mb-1">Harga Dasar (Rp)</label>
            <input v-model.number="newProduct.base_price" type="number" placeholder="28000" class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button @click="showAddModal = false" class="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium">Batal</button>
          <button @click="addProduct" class="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs">Simpan Menu</button>
        </div>
      </div>
    </div>
  </div>
</template>

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

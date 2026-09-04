<script setup lang="ts">
/**
 * Menu Page — Philanthroffee F&B Ordering Experience
 * Designed according to Taste Skill & Consumer F&B Principles
 */

import type { CategoryWithProducts, ProductSummary } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { OrderType } from '~/types/order'
import { formatRupiah } from '~/utils/currency'

useHead({ title: 'Catalog Menu — Philanthroffee' })

const { cart, itemCount, total, addItem, updateQuantity } = useCart()
const router = useRouter()

// Search & category filter states
const searchQuery = ref('')
const activeCategory = ref<string>('')

// Fetch menu API
const { data: menuData, pending, error } = await useFetch<{
  success: boolean
  data: { categories: CategoryWithProducts[] }
}>('/api/menu')

const categories = computed(() => menuData.value?.data?.categories || [])

// Set default active category
watch(categories, (cats) => {
  if (cats.length > 0 && !activeCategory.value) {
    activeCategory.value = cats[0]!.slug
  }
}, { immediate: true })

// Filtered products logic
const filteredProducts = computed(() => {
  let products: ProductSummary[] = []
  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    categories.value.forEach(c => {
      c.products.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
          if (!products.some(existing => existing.id === p.id)) {
            products.push(p)
          }
        }
      })
    })
  } else {
    const cat = categories.value.find(c => c.slug === activeCategory.value)
    products = cat?.products || []
  }
  
  return products
})

function selectCategory(slug: string) {
  searchQuery.value = ''
  activeCategory.value = slug
}

function openProduct(product: ProductSummary) {
  if (product.availability === ProductAvailability.SOLD_OUT) return
  router.push(`/product/${product.id}`)
}

function quickAddToCart(e: Event, product: ProductSummary) {
  e.stopPropagation()
  if (product.availability === ProductAvailability.SOLD_OUT) return
  addItem({
    productId: product.id,
    productName: product.name,
    productImage: product.image_url,
    variantId: null,
    variantName: null,
    basePrice: product.base_price,
    variantPrice: 0,
    modifiers: [],
    unitPrice: product.base_price,
    quantity: 1,
    notes: '',
  })
}

function goToCart() {
  router.push('/cart')
}

// Order context label
const orderLabel = computed(() => {
  if (cart.value.orderType === OrderType.DINE_IN) {
    return `Dine In · Meja ${cart.value.tableNumber || '04'}`
  }
  return 'Pickup / Takeaway'
})
</script>

<template>
  <div class="menu-page ph-page">
    
    <div class="ph-container">
      
      <!-- Top Header Area -->
      <header class="menu-header">
        <div class="header-top-bar">
          <div class="header-left">
            <NuxtLink to="/" class="back-btn" aria-label="Beranda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </NuxtLink>
            <h1 class="header-title">Catalog Menu</h1>
          </div>

          <div class="header-right">
            <span class="order-context-pill">
              <span class="pulse-dot"></span>
              {{ orderLabel }}
            </span>
          </div>
        </div>

        <!-- Search Bar & Category Chips -->
        <div class="search-category-stack">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kopi, pastry, atau minuman..."
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
          </div>

          <nav v-if="categories.length > 0" class="category-tabs" aria-label="Kategori menu">
            <button
              v-for="cat in categories"
              :key="cat.slug"
              :class="['category-chip', { 'category-chip--active': activeCategory === cat.slug && !searchQuery }]"
              @click="selectCategory(cat.slug)"
            >
              {{ cat.name }}
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Section: Grid & Order Summary -->
      <main class="menu-main-layout">
        
        <!-- Left: Product Grid Column -->
        <div class="products-column">
          
          <div class="category-header">
            <h2 class="category-title">
              {{ searchQuery ? `Hasil Pencarian ("${searchQuery}")` : (categories.find(c => c.slug === activeCategory)?.name || 'Semua Menu') }}
            </h2>
            <span class="products-count">{{ filteredProducts.length }} pilihan</span>
          </div>

          <!-- Loading Skeleton -->
          <div v-if="pending" class="product-grid">
            <div v-for="i in 6" :key="i" class="product-card skeleton-card">
              <div class="ph-skeleton skeleton-img"></div>
              <div class="skeleton-text-group">
                <div class="ph-skeleton skeleton-line"></div>
                <div class="ph-skeleton skeleton-line short"></div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state-card">
            <p>Gagal memuat catalog menu. Silakan refresh halaman.</p>
          </div>

          <!-- Empty Search State -->
          <div v-else-if="filteredProducts.length === 0" class="empty-search-card">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-accent);">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3>Menu tidak ditemukan</h3>
            <p>Coba gunakan kata kunci pencarian yang lain.</p>
            <button class="ph-btn ph-btn--secondary ph-btn--sm" @click="searchQuery = ''">Lihat Semua Menu</button>
          </div>

          <!-- Product Grid -->
          <div v-else class="product-grid">
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              :class="['product-card', { 'product-card--disabled': product.availability === ProductAvailability.SOLD_OUT }]"
              @click="openProduct(product)"
            >
              <!-- Large Product Cover Image -->
              <div class="product-image-box">
                <img
                  v-if="product.image_url"
                  :src="product.image_url"
                  :alt="product.name"
                  loading="lazy"
                  class="product-img"
                />
                <div v-else class="product-img-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ph-primary-light);">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                </div>

                <span v-if="product.is_featured" class="tag-badge tag-badge--signature">SIGNATURE</span>
                <span v-if="product.availability === ProductAvailability.SOLD_OUT" class="tag-badge tag-badge--soldout">HABIS</span>
              </div>

              <!-- Product Details -->
              <div class="product-info">
                <h3 class="product-title">{{ product.name }}</h3>
                <p v-if="product.description" class="product-description">{{ product.description }}</p>
                
                <div class="product-footer">
                  <span class="product-price ph-price">{{ formatRupiah(product.base_price) }}</span>

                  <button
                    v-if="product.availability !== ProductAvailability.SOLD_OUT"
                    class="add-item-btn"
                    @click="quickAddToCart($event, product)"
                    aria-label="Tambah ke keranjang"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Right: Order Summary Sidebar (Refined & Subtle when Empty) -->
        <aside class="sidebar-column">
          <div class="sidebar-sticky-box">
            
            <div class="summary-card">
              <div class="summary-header">
                <h3 class="summary-title">Pesanan Anda</h3>
                <span v-if="itemCount > 0" class="item-count-badge">{{ itemCount }} item</span>
              </div>

              <!-- Subtle Minimal Empty Cart State -->
              <div v-if="cart.items.length === 0" class="subtle-empty-cart">
                <p class="empty-hint-text">Pilih menu dari katalog di sebelah kiri untuk menambah ke pesanan.</p>
              </div>

              <!-- Active Cart Items List -->
              <div v-else class="active-cart-group">
                <div class="cart-items-scroll">
                  <div v-for="item in cart.items" :key="item.cartItemId" class="cart-row">
                    <div class="cart-row-info">
                      <span class="cart-row-name">{{ item.productName }}</span>
                      <span v-if="item.variantName" class="cart-row-sub">{{ item.variantName }}</span>
                      <div v-if="item.modifiers.length > 0" class="cart-row-mods">
                        <span v-for="m in item.modifiers" :key="m.modifierId" class="mod-dot-tag">{{ m.modifierName }}</span>
                      </div>
                      <span class="cart-row-price ph-price">{{ formatRupiah(item.unitPrice * item.quantity) }}</span>
                    </div>

                    <div class="cart-qty-ctrl">
                      <button class="qty-step-btn" @click="updateQuantity(item.cartItemId, item.quantity - 1)">-</button>
                      <span class="qty-num">{{ item.quantity }}</span>
                      <button class="qty-step-btn" @click="updateQuantity(item.cartItemId, item.quantity + 1)">+</button>
                    </div>
                  </div>
                </div>

                <div class="cart-summary-footer">
                  <div class="subtotal-line">
                    <span class="subtotal-label">Subtotal</span>
                    <span class="subtotal-val ph-price">{{ formatRupiah(total) }}</span>
                  </div>
                  
                  <button class="ph-btn ph-btn--primary ph-btn--full checkout-action-btn" @click="goToCart">
                    <span>Lanjut ke Checkout</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </aside>

      </main>

      <!-- Mobile Floating Cart Bar -->
      <div v-if="itemCount > 0" class="ph-floating-bar mobile-cart-bar">
        <div class="ph-container mobile-cart-inner" @click="goToCart">
          <div class="mobile-cart-info">
            <span class="mobile-cart-count">{{ itemCount }} item</span>
            <span class="mobile-cart-total ph-price">{{ formatRupiah(total) }}</span>
          </div>

          <button class="mobile-checkout-btn">
            <span>Checkout</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.menu-page {
  min-height: 100dvh;
  background: var(--ph-bg);
  padding-bottom: 120px;
}

/* Header Section */
.menu-header {
  padding-top: var(--ph-space-md);
  padding-bottom: var(--ph-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
  border-bottom: 1px solid var(--ph-border-light);
}

.header-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  color: var(--ph-text);
  transition: all var(--ph-transition-fast);
}

.back-btn:hover {
  background: var(--ph-bg-muted);
  border-color: var(--ph-primary);
}

.header-title {
  font-family: var(--ph-font-display);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--ph-text);
  letter-spacing: -0.01em;
}

.order-context-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ph-accent);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ph-accent);
  box-shadow: 0 0 8px var(--ph-accent);
}

/* Search & Category Chips */
.search-category-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--ph-text-muted);
}

.search-input {
  width: 100%;
  padding: 12px 42px 12px 46px;
  border-radius: var(--ph-radius-lg);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text);
  font-family: var(--ph-font-body);
  font-size: 0.9375rem;
  outline: none;
  transition: all var(--ph-transition-fast);
}

.search-input::placeholder {
  color: var(--ph-text-muted);
  opacity: 0.8;
}

.search-input:focus {
  border-color: var(--ph-accent);
  box-shadow: 0 0 0 3px var(--ph-accent-light);
}

.clear-search-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--ph-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-chip {
  padding: 8px 18px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.category-chip:hover {
  border-color: var(--ph-accent);
  color: var(--ph-text);
}

.category-chip--active {
  background: var(--ph-accent);
  border-color: var(--ph-accent);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(217, 130, 76, 0.25);
}

/* Main Layout Grid */
.menu-main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--ph-space-lg);
  padding-top: var(--ph-space-lg);
}

@media (max-width: 900px) {
  .menu-main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-column {
    display: none;
  }
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ph-space-md);
}

.category-title {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
}

.products-count {
  font-size: 0.8125rem;
  color: var(--ph-text-muted);
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--ph-space-md);
}

.product-card {
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border-light);
  border-radius: var(--ph-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform var(--ph-transition), box-shadow var(--ph-transition), border-color var(--ph-transition);
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  border-color: var(--ph-border);
}

.product-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-image-box {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--ph-bg-elevated);
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-img {
  transform: scale(1.04);
}

.product-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: var(--ph-radius-sm);
  backdrop-filter: blur(8px);
}

.tag-badge--signature {
  background: rgba(217, 130, 76, 0.9);
  color: #ffffff;
}

.tag-badge--soldout {
  background: rgba(186, 26, 26, 0.9);
  color: #ffffff;
}

.product-info {
  padding: var(--ph-space-md);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  font-family: var(--ph-font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-text);
  line-height: 1.3;
  margin-bottom: 4px;
}

.product-description {
  font-size: 0.78125rem;
  color: var(--ph-text-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: var(--ph-space-sm);
  flex: 1;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: var(--ph-space-xs);
}

.product-price {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.add-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  color: var(--ph-text);
  font-size: 0.78125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.add-item-btn:hover {
  background: var(--ph-accent);
  border-color: var(--ph-accent);
  color: #ffffff;
}

/* Sidebar Column & Subtle Empty Cart */
.sidebar-sticky-box {
  position: sticky;
  top: 80px;
}

.summary-card {
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-lg);
  padding: var(--ph-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-title {
  font-family: var(--ph-font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ph-text);
}

.item-count-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--ph-accent-light);
  color: var(--ph-accent);
  border-radius: var(--ph-radius-full);
  font-weight: 600;
}

.subtle-empty-cart {
  padding: var(--ph-space-md) 0;
  text-align: center;
}

.empty-hint-text {
  font-size: 0.8125rem;
  color: var(--ph-text-muted);
  line-height: 1.5;
}

/* Active Cart Items */
.active-cart-group {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.cart-items-scroll {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.cart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ph-border-light);
}

.cart-row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
  padding-right: 8px;
}

.cart-row-name {
  font-size: 0.84375rem;
  font-weight: 600;
  color: var(--ph-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-row-sub {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.cart-row-mods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mod-dot-tag {
  font-size: 0.6875rem;
  color: var(--ph-text-muted);
}

.cart-row-price {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ph-accent);
  margin-top: 2px;
}

.cart-qty-ctrl {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ph-bg-elevated);
  border-radius: var(--ph-radius-sm);
  padding: 2px;
}

.qty-step-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ph-bg-card);
  border: none;
  border-radius: 4px;
  color: var(--ph-text);
  font-weight: 700;
  cursor: pointer;
}

.qty-num {
  min-width: 20px;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
}

.cart-summary-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: var(--ph-space-xs);
}

.subtotal-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subtotal-label {
  font-size: 0.875rem;
  color: var(--ph-text-secondary);
}

.subtotal-val {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.checkout-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Skeleton & Empty States */
.skeleton-card {
  height: 260px;
}

.skeleton-img {
  height: 140px;
}

.skeleton-text-group {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60%;
}

.empty-search-card, .error-state-card {
  padding: var(--ph-space-2xl) var(--ph-space-md);
  text-align: center;
  background: var(--ph-bg-card);
  border-radius: var(--ph-radius-lg);
  border: 1px solid var(--ph-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-sm);
}

/* Mobile Floating Bar */
.mobile-cart-bar {
  display: none;
}

@media (max-width: 900px) {
  .mobile-cart-bar {
    display: block;
  }
}

.mobile-cart-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.mobile-cart-info {
  display: flex;
  flex-direction: column;
}

.mobile-cart-count {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.mobile-cart-total {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.mobile-checkout-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--ph-accent);
  color: #ffffff;
  border: none;
  border-radius: var(--ph-radius-md);
  font-weight: 600;
  font-size: 0.875rem;
}
</style>

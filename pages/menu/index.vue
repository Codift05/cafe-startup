<script setup lang="ts">
/**
 * Menu Page — Earthy Botanical Design System
 * Fluid Responsive Architecture (Desktop 2-Column Grid & Mobile 1-Column with Floating Cart)
 */

import type { CategoryWithProducts, ProductSummary } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { OrderType } from '~/types/order'
import { formatRupiah } from '~/utils/currency'

useHead({ title: 'Menu — Philanthroffee' })

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
      
      <!-- Clean Header without Fake Mode Switchers or Outer Pelapis -->
      <header class="clean-menu-header">
        <div class="header-main-row">
          <div class="header-brand-group">
            <NuxtLink to="/" class="back-link-btn" aria-label="Beranda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </NuxtLink>
            <h1 class="catalog-title">Catalog Menu</h1>
            <span class="ph-badge ph-badge--accent">{{ orderLabel }}</span>
          </div>
        </div>

        <!-- Controls: Search & Category Chips -->
        <div class="clean-controls-row">
          <div class="clean-search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kopi, pastry, atau minuman..."
              class="clean-search-input"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
          </div>

          <nav v-if="categories.length > 0" class="clean-category-tabs" aria-label="Kategori menu">
            <button
              v-for="cat in categories"
              :key="cat.slug"
              :class="['clean-tab-chip', { 'clean-tab-chip--active': activeCategory === cat.slug && !searchQuery }]"
              @click="selectCategory(cat.slug)"
            >
              {{ cat.name }}
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="menu-content">
        <div class="menu-layout-grid">

          <!-- Product Catalog Grid -->
          <div class="catalog-primary-col">
            
            <div class="section-title-row">
              <h2 class="section-heading">
                {{ searchQuery ? `Hasil Pencarian ("${searchQuery}")` : (categories.find(c => c.slug === activeCategory)?.name || 'Semua Menu') }}
              </h2>
              <span class="section-count-badge">{{ filteredProducts.length }} Produk</span>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="pending" class="menu-grid">
              <div v-for="i in 6" :key="i" class="product-card product-card--skeleton">
                <div class="ph-skeleton skeleton-img"></div>
                <div class="skeleton-body">
                  <div class="ph-skeleton skeleton-title"></div>
                  <div class="ph-skeleton skeleton-price"></div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="ph-card menu-error">
              <p>Gagal memuat catalog menu. Silakan refresh halaman.</p>
            </div>

            <!-- Empty Search State -->
            <div v-else-if="filteredProducts.length === 0" class="ph-card menu-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-accent);">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 class="ph-heading-md">Menu tidak ditemukan</h3>
              <p class="ph-caption">Coba gunakan kata kunci pencarian yang lain.</p>
              <button class="ph-btn ph-btn--secondary" @click="searchQuery = ''">Lihat Semua Menu</button>
            </div>

            <!-- Product Items Grid -->
            <div v-else class="menu-grid">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                :class="['product-card', { 'product-card--disabled': product.availability === ProductAvailability.SOLD_OUT }]"
                @click="openProduct(product)"
              >
                <div class="product-card__image-container">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    loading="lazy"
                  />
                  <div v-else class="product-card__placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-primary);">
                      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                      <line x1="6" y1="2" x2="6" y2="4" />
                      <line x1="10" y1="2" x2="10" y2="4" />
                      <line x1="14" y1="2" x2="14" y2="4" />
                    </svg>
                  </div>

                  <span v-if="product.is_featured" class="product-badge">SIGNATURE</span>
                  <span v-if="product.availability === ProductAvailability.SOLD_OUT" class="product-badge product-badge--soldout">HABIS</span>
                </div>

                <div class="product-card__body">
                  <h3 class="product-card__name">{{ product.name }}</h3>
                  <p v-if="product.description" class="product-card__desc">{{ product.description }}</p>
                  
                  <div class="product-card__footer">
                    <span class="product-card__price ph-price">{{ formatRupiah(product.base_price) }}</span>
                    <button
                      v-if="product.availability !== ProductAvailability.SOLD_OUT"
                      class="quick-add-btn"
                      @click="(e) => quickAddToCart(e, product)"
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

          <!-- Desktop Sidebar Cart (Hidden automatically on mobile via CSS) -->
          <div class="catalog-sidebar-col">
            <div class="ph-card sidebar-cart-card">
              <div class="sidebar-cart__header">
                <h3 class="sidebar-cart__title">Pesanan Anda</h3>
                <span class="ph-badge ph-badge--accent">{{ itemCount }} item</span>
              </div>

              <div v-if="cart.items.length === 0" class="sidebar-cart__empty">
                <div class="empty-icon-box">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-primary);">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h4 class="empty-title">Keranjang Kosong</h4>
                <p class="empty-desc">Pilih menu favorit Anda dari katalog untuk mulai memesan.</p>
              </div>

              <div v-else class="sidebar-cart__list">
                <div v-for="item in cart.items" :key="item.cartItemId" class="sidebar-cart-item">
                  <div class="cart-item__info">
                    <h4 class="cart-item__name">{{ item.productName }}</h4>
                    <span v-if="item.variantName" class="cart-item__sub">{{ item.variantName }}</span>
                    <div v-if="item.modifiers.length > 0" class="cart-item__mods">
                      <span v-for="m in item.modifiers" :key="m.modifierId" class="mod-tag">{{ m.modifierName }}</span>
                    </div>
                    <span class="cart-item__price ph-price">{{ formatRupiah(item.unitPrice * item.quantity) }}</span>
                  </div>

                  <div class="cart-item__controls">
                    <button class="cart-qty-btn" @click="updateQuantity(item.cartItemId, item.quantity - 1)">-</button>
                    <span class="cart-qty-num">{{ item.quantity }}</span>
                    <button class="cart-qty-btn" @click="updateQuantity(item.cartItemId, item.quantity + 1)">+</button>
                  </div>
                </div>

                <div class="sidebar-cart__footer">
                  <div class="subtotal-row">
                    <span>Subtotal</span>
                    <span class="ph-price">{{ formatRupiah(total) }}</span>
                  </div>
                  <button class="ph-btn ph-btn--primary ph-btn--lg checkout-btn" @click="goToCart">
                    <span>Lanjut ke Checkout</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <!-- Mobile Floating Cart Bar (Visible automatically on mobile screens) -->
      <div v-if="itemCount > 0" class="mobile-floating-cart">
        <div class="floating-cart-content" @click="goToCart">
          <div class="cart-badge-group">
            <span class="cart-count-pill">{{ itemCount }}</span>
            <div class="cart-text-group">
              <span class="cart-label">Pesanan Anda</span>
              <span class="cart-total ph-price">{{ formatRupiah(total) }}</span>
            </div>
          </div>

          <button class="floating-checkout-btn">
            <span>Lihat Keranjang</span>
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
}

/* Header */
.clean-menu-header {
  padding: var(--ph-space-md) 0 var(--ph-space-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-brand-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back-link-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--ph-radius-sm);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  color: var(--ph-text);
}

.catalog-title {
  font-family: var(--ph-font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ph-text);
}

.clean-controls-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clean-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--ph-text-muted);
}

.clean-search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text);
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  transition: border-color 0.15s ease;
}

.clean-search-input:focus {
  outline: none;
  border-color: var(--ph-primary);
}

.clear-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--ph-text-muted);
  cursor: pointer;
}

.clean-category-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.clean-category-tabs::-webkit-scrollbar {
  display: none;
}

.clean-tab-chip {
  padding: 6px 14px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.clean-tab-chip:hover {
  border-color: var(--ph-primary);
}

.clean-tab-chip--active {
  background: var(--ph-primary);
  color: #fff;
  border-color: var(--ph-primary);
}

/* Content Area */
.menu-content {
  padding-top: var(--ph-space-sm);
  padding-bottom: var(--ph-space-xl);
}

/* Responsive Grid Architecture */
.menu-layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ph-space-lg);
}

@media (min-width: 992px) {
  .menu-layout-grid {
    grid-template-columns: 1fr 320px;
  }
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ph-space-sm);
}

.section-heading {
  font-family: var(--ph-font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ph-text);
}

.section-count-badge {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

/* Menu Grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ph-space-md);
}

@media (max-width: 576px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}

.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  border-radius: var(--ph-radius-lg);
  cursor: pointer;
  transition: all var(--ph-transition);
}

.product-card:hover {
  transform: translateY(-2px);
  border-color: var(--ph-primary);
}

.product-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-card__image-container {
  aspect-ratio: 1.35;
  position: relative;
  background: var(--ph-bg-elevated);
  overflow: hidden;
}

.product-card__image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: var(--ph-radius-full);
  font-size: 0.625rem;
  font-weight: 700;
  background: var(--ph-primary);
  color: #fff;
}

.product-badge--soldout {
  background: #dc2626;
}

.product-card__body {
  padding: var(--ph-space-sm) var(--ph-space-md) var(--ph-space-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.product-card__name {
  font-family: var(--ph-font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-text);
}

.product-card__desc {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
}

.product-card__price {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.quick-add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  color: var(--ph-text);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.quick-add-btn:hover {
  background: var(--ph-primary);
  color: #fff;
  border-color: var(--ph-primary);
}

/* Sidebar Cart (Desktop Only) */
.catalog-sidebar-col {
  display: none;
}

@media (min-width: 992px) {
  .catalog-sidebar-col {
    display: block;
  }
}

.sidebar-cart-card {
  padding: var(--ph-space-md);
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
  position: sticky;
  top: 16px;
}

.sidebar-cart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--ph-space-sm);
  border-bottom: 1px solid var(--ph-border);
}

.sidebar-cart__title {
  font-family: var(--ph-font-display);
  font-size: 0.9375rem;
  font-weight: 700;
}

.sidebar-cart__empty {
  text-align: center;
  padding: var(--ph-space-lg) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ph-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 0.875rem;
  font-weight: 700;
}

.empty-desc {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.sidebar-cart__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: var(--ph-space-sm);
}

.sidebar-cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--ph-border);
}

.cart-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item__name {
  font-size: 0.8125rem;
  font-weight: 700;
}

.cart-item__sub, .mod-tag {
  font-size: 0.6875rem;
  color: var(--ph-text-muted);
}

.cart-item__price {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.cart-item__controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--ph-bg-elevated);
  padding: 2px 6px;
  border-radius: var(--ph-radius-sm);
  border: 1px solid var(--ph-border);
}

.cart-qty-btn {
  background: none;
  border: none;
  font-weight: 700;
  cursor: pointer;
  color: var(--ph-text);
}

.cart-qty-num {
  font-size: 0.75rem;
  font-weight: 700;
}

.sidebar-cart__footer {
  padding-top: var(--ph-space-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtotal-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 700;
}

.checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* Mobile Floating Cart (Visible on screens < 992px) */
.mobile-floating-cart {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 50;
}

@media (min-width: 992px) {
  .mobile-floating-cart {
    display: none;
  }
}

.floating-cart-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-radius: var(--ph-radius-full);
  background: var(--ph-primary);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.cart-badge-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-count-pill {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ph-accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-text-group {
  display: flex;
  flex-direction: column;
}

.cart-label {
  font-size: 0.6875rem;
  opacity: 0.85;
}

.cart-total {
  font-size: 0.875rem;
  font-weight: 700;
}

.floating-checkout-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}
</style>

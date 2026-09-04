<script setup lang="ts">
/**
 * Menu Page — Taste Skill Anti-Slop Specification
 * Complete Dual Viewport Architecture: Desktop & Mobile Simulator.
 */

import type { CategoryWithProducts, ProductSummary } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { OrderType } from '~/types/order'
import { formatRupiah } from '~/utils/currency'

useHead({ title: 'Menu — Philanthroffee' })

const { cart, itemCount, total, addItem, updateQuantity, removeItem } = useCart()
const router = useRouter()

// View mode: 'desktop' or 'mobile'
const viewMode = ref<'desktop' | 'mobile'>('desktop')

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
    activeCategory.value = cats[0].slug
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
    unitPrice: product.base_price,
    quantity: 1
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

// Barista recommendations
const recommendedItems = computed(() => {
  const allProds: ProductSummary[] = []
  categories.value.forEach(c => allProds.push(...c.products))
  return allProds.slice(0, 2)
})
</script>

<template>
  <div class="menu-page ph-page">
    
    <!-- Top System Switcher Bar (Always Fixed at Top) -->
    <div class="top-mode-bar">
      <div class="ph-container top-mode-bar__container">
        <div class="top-mode-bar__brand">
          <span class="brand-badge">☕ PHILANTHROFFEE</span>
          <span class="mode-indicator">{{ viewMode === 'desktop' ? 'Mode Desktop (Full Width)' : 'Mode Mobile (Simulasi HP)' }}</span>
        </div>

        <div class="view-switcher-group">
          <button
            :class="['view-switch-btn', { 'view-switch-btn--active': viewMode === 'desktop' }]"
            @click="viewMode = 'desktop'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Desktop</span>
          </button>

          <button
            :class="['view-switch-btn', { 'view-switch-btn--active': viewMode === 'mobile' }]"
            @click="viewMode = 'mobile'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3" />
            </svg>
            <span>Mobile</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Responsive Viewport Shell (Contains Header, Main Content, & Cart) -->
    <div :class="['menu-viewport-wrapper', { 'menu-viewport-wrapper--mobile-frame': viewMode === 'mobile' }]">
      
      <!-- Mobile Phone Notch / Speaker Mockup (Visible only in Mobile Frame Mode) -->
      <div v-if="viewMode === 'mobile'" class="mobile-frame-speaker">
        <div class="speaker-bar"></div>
        <div class="camera-dot"></div>
      </div>

      <!-- Header (Now inside the Viewport Wrapper so it scales with Desktop/Mobile view) -->
      <header :class="['menu-header', { 'menu-header--mobile': viewMode === 'mobile' }]">
        <div class="menu-header__inner">
          <div class="menu-header__top">
            <NuxtLink to="/" class="menu-header__back" aria-label="Kembali">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </NuxtLink>

            <div class="menu-header__title-group">
              <h1 class="menu-header__title">Catalog Menu</h1>
              <span class="ph-badge ph-badge--accent">{{ orderLabel }}</span>
            </div>
          </div>

          <!-- Controls: Search Input & Category Chips -->
          <div class="menu-controls-stack">
            <!-- Search Box -->
            <div class="menu-search-box">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari kopi, pastry, atau minuman..."
                class="menu-search-input"
              />
              <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
            </div>

            <!-- Category Filter Chips -->
            <nav v-if="categories.length > 0" class="menu-tabs" aria-label="Kategori menu">
              <button
                v-for="cat in categories"
                :key="cat.slug"
                :class="['menu-tabs__item', { 'menu-tabs__item--active': activeCategory === cat.slug && !searchQuery }]"
                @click="selectCategory(cat.slug)"
              >
                {{ cat.name }}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="menu-content">
        
        <!-- Banner Hero Card (Desktop Mode Only) -->
        <div v-if="viewMode === 'desktop'" class="menu-hero-banner ph-card">
          <div class="hero-banner__text">
            <span class="ph-badge ph-badge--accent">SPECIALTY ROASTS & PASTRIES</span>
            <h2 class="hero-banner__title">Cita Rasa Kopi & Pastry Autentik</h2>
            <p class="hero-banner__desc">Biji kopi 100% Arabika diseduh segar dengan susu pilihan dan gula aren murni.</p>
          </div>
          <div class="hero-banner__art">☕</div>
        </div>

        <div :class="['menu-layout-grid', { 'menu-layout-grid--desktop': viewMode === 'desktop' }]">

          <!-- Product Catalog Grid -->
          <section class="menu-catalog-section">
            <div class="section-title-row">
              <h3 class="section-heading">
                {{ searchQuery ? `Pencarian ("${searchQuery}")` : (categories.find(c => c.slug === activeCategory)?.name || 'Katalog') }}
              </h3>
              <span class="section-count-badge">{{ filteredProducts.length }} menu</span>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="pending" class="menu-grid ph-stagger">
              <div v-for="i in 6" :key="i" class="product-card-skeleton ph-skeleton" />
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="menu-empty ph-card">
              <p>Gagal memuat data menu.</p>
              <button class="ph-btn ph-btn--secondary ph-btn--sm" @click="$router.go(0)">Coba Lagi</button>
            </div>

            <!-- Products Grid -->
            <div v-else-if="filteredProducts.length > 0" :class="['menu-grid', { 'menu-grid--mobile': viewMode === 'mobile' }]">
              <article
                v-for="product in filteredProducts"
                :key="product.id"
                :class="['product-card ph-card ph-card--interactive', { 'ph-sold-out': product.availability === ProductAvailability.SOLD_OUT }]"
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-primary);">
                      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                      <line x1="6" y1="2" x2="6" y2="4" />
                      <line x1="10" y1="2" x2="10" y2="4" />
                      <line x1="14" y1="2" x2="14" y2="4" />
                    </svg>
                  </div>
                  <span v-if="product.is_featured" class="product-badge">SIGNATURE</span>
                </div>

                <div class="product-card__body">
                  <h4 class="product-card__name">{{ product.name }}</h4>
                  <p v-if="product.description" class="product-card__desc">{{ product.description }}</p>
                  
                  <div class="product-card__footer">
                    <span class="product-card__price ph-price">{{ formatRupiah(product.base_price) }}</span>
                    <button
                      class="quick-add-btn"
                      :disabled="product.availability === ProductAvailability.SOLD_OUT"
                      @click="(e) => quickAddToCart(e, product)"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <!-- Empty Search Results -->
            <div v-else class="menu-empty ph-card">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ph-text-muted);">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>Menu tidak ditemukan</p>
              <button class="ph-btn ph-btn--secondary ph-btn--sm" @click="searchQuery = ''">Reset Filter</button>
            </div>
          </section>

          <!-- Desktop Sidebar Cart (Visible on Desktop Mode) -->
          <aside v-if="viewMode === 'desktop'" class="menu-desktop-sidebar">
            <div class="desktop-cart-card ph-card">
              <div class="desktop-cart-card__header">
                <div>
                  <h3 class="desktop-cart-card__title">Pesanan Saya</h3>
                  <span class="desktop-cart-card__sub">{{ orderLabel }}</span>
                </div>
                <span class="ph-badge ph-badge--accent">{{ itemCount }} Item</span>
              </div>

              <!-- Empty State & Recommendations -->
              <div v-if="cart.items.length === 0" class="desktop-cart-empty">
                <div class="empty-icon-circle">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ph-text-muted);">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <h4 class="empty-title">Keranjang Masih Kosong</h4>
                <p class="empty-desc">Pilih menu favorit Anda di katalog sebelah kiri untuk langsung menambahkan.</p>

                <div v-if="recommendedItems.length > 0" class="recommendation-box">
                  <span class="recommendation-label">Rekomendasi Barista:</span>
                  <div
                    v-for="rec in recommendedItems"
                    :key="rec.id"
                    class="recommendation-item"
                    @click="addItem({ productId: rec.id, productName: rec.name, unitPrice: rec.base_price, quantity: 1 })"
                  >
                    <span>{{ rec.name }}</span>
                    <span class="rec-add-btn">+ {{ formatRupiah(rec.base_price) }}</span>
                  </div>
                </div>
              </div>

              <!-- Filled Cart Items -->
              <div v-else class="desktop-cart-content">
                <div class="desktop-cart-items-list">
                  <div v-for="item in cart.items" :key="item.id" class="desktop-cart-item">
                    <div class="desktop-cart-item__info">
                      <h5 class="desktop-cart-item__name">{{ item.productName }}</h5>
                      <span v-if="item.variantName" class="desktop-cart-item__variant">{{ item.variantName }}</span>
                      <span class="desktop-cart-item__price ph-price">{{ formatRupiah(item.unitPrice * item.quantity) }}</span>
                    </div>

                    <div class="desktop-cart-item__controls">
                      <button class="qty-btn" @click="updateQuantity(item.id, item.quantity - 1)">-</button>
                      <span class="qty-val">{{ item.quantity }}</span>
                      <button class="qty-btn" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
                    </div>
                  </div>
                </div>

                <div class="desktop-cart-breakdown">
                  <div class="breakdown-row">
                    <span>Subtotal Menu</span>
                    <span>{{ formatRupiah(total) }}</span>
                  </div>
                  <div class="breakdown-row breakdown-row--total">
                    <span>Total Pembayaran</span>
                    <span class="ph-price">{{ formatRupiah(total) }}</span>
                  </div>

                  <button class="ph-btn ph-btn--primary ph-btn--full ph-btn--lg checkout-cta-btn" @click="goToCart">
                    <span>Lanjut ke Pembayaran</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>

      <!-- Floating Cart Bar for Mobile View (Anchored inside the Mobile Frame) -->
      <div v-if="itemCount > 0 && viewMode === 'mobile'" class="mobile-frame-cart-bar">
        <button class="cart-bar ph-btn ph-btn--primary ph-btn--full ph-btn--lg" @click="goToCart">
          <span class="cart-bar__count">{{ itemCount }}</span>
          <span class="cart-bar__label">Lihat Keranjang</span>
          <span class="cart-bar__price ph-price">{{ formatRupiah(total) }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Top System Mode Bar */
.top-mode-bar {
  background: var(--ph-bg-card);
  border-bottom: 1px solid var(--ph-border);
  padding: 8px 0;
}

.top-mode-bar__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-mode-bar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  font-family: var(--ph-font-display);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ph-primary);
  letter-spacing: 0.05em;
}

.mode-indicator {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.view-switcher-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ph-bg-elevated);
  padding: 3px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
}

.view-switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: none;
  border-radius: var(--ph-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ph-text-secondary);
  background: transparent;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.view-switch-btn--active {
  background: var(--ph-primary);
  color: #fff;
}

/* Viewport Shell */
.menu-viewport-wrapper {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* Mobile Frame Simulator Specs */
.menu-viewport-wrapper--mobile-frame {
  max-width: 414px;
  margin: 1.5rem auto;
  border: 3px solid var(--ph-border);
  border-radius: 36px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  background: var(--ph-bg);
  overflow: hidden;
  position: relative;
  min-height: 800px;
}

.mobile-frame-speaker {
  height: 24px;
  background: var(--ph-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid var(--ph-border-light);
}

.speaker-bar {
  width: 44px;
  height: 4px;
  background: var(--ph-border);
  border-radius: 2px;
}

.camera-dot {
  width: 6px;
  height: 6px;
  background: var(--ph-border);
  border-radius: 50%;
}

/* Header Inside Viewport Wrapper */
.menu-header {
  background: var(--ph-bg-card);
  border-bottom: 1px solid var(--ph-border);
  padding: var(--ph-space-md);
}

.menu-header__inner {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
}

.menu-header__top {
  display: flex;
  align-items: center;
  gap: var(--ph-space-sm);
}

.menu-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--ph-radius-md);
  color: var(--ph-text);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
}

.menu-header__title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-header__title {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
}

.menu-controls-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
}

.menu-search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ph-text-muted);
}

.menu-search-input {
  width: 100%;
  padding: 8px 32px 8px 36px;
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-full);
  background: var(--ph-bg);
  color: var(--ph-text);
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--ph-text-muted);
  cursor: pointer;
}

/* Category Chips */
.menu-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.menu-tabs::-webkit-scrollbar { display: none; }

.menu-tabs__item {
  flex-shrink: 0;
  padding: 6px 14px;
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ph-text-secondary);
  background: var(--ph-bg);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-full);
  cursor: pointer;
  white-space: nowrap;
}

.menu-tabs__item--active {
  background: var(--ph-primary);
  color: #fff;
  border-color: var(--ph-primary);
}

/* Content Area */
.menu-content {
  padding: var(--ph-space-md);
}

.menu-hero-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ph-space-lg);
  margin-bottom: var(--ph-space-lg);
  background: linear-gradient(135deg, var(--ph-bg-card) 0%, var(--ph-bg-elevated) 100%);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
}

.hero-banner__title {
  font-family: var(--ph-font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ph-text);
}

.hero-banner__desc {
  font-size: 0.8125rem;
  color: var(--ph-text-secondary);
}

.hero-banner__art {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ph-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}

/* Layout Grid */
.menu-layout-grid--desktop {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--ph-space-lg);
  align-items: start;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ph-space-sm);
}

.section-heading {
  font-family: var(--ph-font-display);
  font-size: 1.1rem;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--ph-space-md);
}

.menu-grid--mobile {
  grid-template-columns: 1fr;
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

.product-card__image-container {
  aspect-ratio: 1.3;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__footer {
  margin-top: auto;
  padding-top: var(--ph-space-xs);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-card__price {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.quick-add-btn {
  padding: 4px 12px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  color: var(--ph-primary);
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
}

.quick-add-btn:hover {
  background: var(--ph-primary);
  color: #fff;
  border-color: var(--ph-primary);
}

/* Desktop Cart Sidebar */
.desktop-cart-card {
  padding: var(--ph-space-md);
  position: sticky;
  top: 80px;
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-lg);
  background: var(--ph-bg-card);
}

.desktop-cart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--ph-space-sm);
  border-bottom: 1px solid var(--ph-border);
}

.desktop-cart-card__title {
  font-family: var(--ph-font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ph-text);
}

.desktop-cart-card__sub {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.desktop-cart-empty {
  text-align: center;
  padding: var(--ph-space-lg) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.empty-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--ph-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.empty-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ph-text);
}

.empty-desc {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.recommendation-box {
  margin-top: var(--ph-space-sm);
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: var(--ph-space-sm);
  border-top: 1px dashed var(--ph-border);
}

.recommendation-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--ph-text-secondary);
}

.recommendation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.rec-add-btn {
  font-size: 0.6875rem;
  color: var(--ph-accent);
}

.desktop-cart-content {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
  margin-top: var(--ph-space-sm);
}

.desktop-cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}

.desktop-cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
}

.desktop-cart-item__info {
  display: flex;
  flex-direction: column;
}

.desktop-cart-item__name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ph-text);
}

.desktop-cart-item__price {
  font-size: 0.75rem;
  color: var(--ph-accent);
  font-weight: 700;
}

.desktop-cart-item__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 22px;
  height: 22px;
  border-radius: var(--ph-radius-sm);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text);
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-val {
  font-size: 0.8125rem;
  font-weight: 700;
  min-width: 16px;
  text-align: center;
}

.desktop-cart-breakdown {
  padding-top: var(--ph-space-sm);
  border-top: 1px dashed var(--ph-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  color: var(--ph-text-secondary);
}

.breakdown-row--total {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-text);
}

.checkout-cta-btn {
  margin-top: var(--ph-space-sm);
}

/* Mobile Frame Floating Cart Bar */
.mobile-frame-cart-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: var(--ph-bg-card);
  border-top: 1px solid var(--ph-border);
}

.cart-bar {
  display: flex;
  align-items: center;
  gap: var(--ph-space-sm);
}

.cart-bar__count {
  background: rgba(255, 255, 255, 0.25);
  padding: 2px 8px;
  border-radius: var(--ph-radius-full);
  font-size: 0.8125rem;
  font-weight: 700;
}

.cart-bar__label {
  flex: 1;
  text-align: left;
}

.cart-bar__price {
  font-size: 0.9375rem;
}

.product-card-skeleton {
  aspect-ratio: 0.75;
  border-radius: var(--ph-radius-lg);
}

.menu-empty {
  text-align: center;
  padding: var(--ph-space-xl) var(--ph-space-md);
  color: var(--ph-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-sm);
}
</style>

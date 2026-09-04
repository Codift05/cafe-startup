<script setup lang="ts">
/**
 * Menu Page — Browse products by category.
 */

import type { CategoryWithProducts, ProductSummary } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { OrderType } from '~/types/order'
import { formatRupiah } from '~/utils/currency'

useHead({ title: 'Menu — Philanthroffee' })

const { cart, itemCount, total } = useCart()
const router = useRouter()

// Fetch menu
const { data: menuData, pending, error } = await useFetch<{
  success: boolean
  data: { categories: CategoryWithProducts[] }
}>('/api/menu')

const categories = computed(() => menuData.value?.data?.categories || [])
const activeCategory = ref<string>('')

// Set first category as active on load
watch(categories, (cats) => {
  if (cats.length > 0 && !activeCategory.value) {
    activeCategory.value = cats[0].slug
  }
}, { immediate: true })

const filteredProducts = computed(() => {
  const cat = categories.value.find(c => c.slug === activeCategory.value)
  return cat?.products || []
})

function selectCategory(slug: string) {
  activeCategory.value = slug
}

function openProduct(product: ProductSummary) {
  if (product.availability === ProductAvailability.SOLD_OUT) return
  router.push(`/product/${product.id}`)
}

function goToCart() {
  router.push('/cart')
}

// Context header
const orderLabel = computed(() => {
  if (cart.value.orderType === OrderType.DINE_IN) {
    return `Dine In · Meja ${cart.value.tableNumber}`
  }
  return 'Pickup'
})
</script>

<template>
  <div class="menu-page ph-page">
    <!-- Header -->
    <header class="menu-header">
      <div class="ph-container">
        <div class="menu-header__top">
          <NuxtLink to="/" class="menu-header__back" aria-label="Kembali">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </NuxtLink>
          <div class="menu-header__info">
            <h1 class="menu-header__title">Menu</h1>
            <span class="menu-header__context ph-badge ph-badge--accent">{{ orderLabel }}</span>
          </div>
        </div>

        <!-- Category Tabs -->
        <nav v-if="categories.length > 0" class="menu-tabs" aria-label="Kategori menu">
          <button
            v-for="cat in categories"
            :key="cat.slug"
            :class="['menu-tabs__item', { 'menu-tabs__item--active': activeCategory === cat.slug }]"
            @click="selectCategory(cat.slug)"
          >
            {{ cat.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- Content -->
    <main class="ph-container menu-content">
      <!-- Loading -->
      <div v-if="pending" class="menu-grid ph-stagger">
        <div v-for="i in 6" :key="i" class="product-card-skeleton ph-skeleton" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="menu-empty">
        <p>😔 Gagal memuat menu</p>
        <button class="ph-btn ph-btn--secondary ph-btn--sm" @click="$router.go(0)">Coba Lagi</button>
      </div>

      <!-- Products -->
      <div v-else class="menu-grid ph-stagger">
        <button
          v-for="product in filteredProducts"
          :key="product.id"
          :class="['product-card ph-card ph-card--interactive', { 'ph-sold-out': product.availability === ProductAvailability.SOLD_OUT }]"
          :disabled="product.availability === ProductAvailability.SOLD_OUT"
          @click="openProduct(product)"
        >
          <div class="product-card__image">
            <img
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              loading="lazy"
            />
            <div v-else class="product-card__placeholder">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: var(--ph-primary);">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
          </div>
          <div class="product-card__body">
            <h3 class="product-card__name">{{ product.name }}</h3>
            <p v-if="product.description" class="product-card__desc">{{ product.description }}</p>
            <p class="product-card__price ph-price">{{ formatRupiah(product.base_price) }}</p>
          </div>
        </button>
      </div>

      <!-- Empty category -->
      <div v-if="!pending && filteredProducts.length === 0 && !error" class="menu-empty">
        <p>Belum ada menu di kategori ini</p>
      </div>
    </main>

    <!-- Floating Cart Bar -->
    <Transition name="slide-up">
      <div v-if="itemCount > 0" class="ph-floating-bar">
        <div class="ph-floating-bar__content">
          <button
            id="btn-view-cart"
            class="cart-bar ph-btn ph-btn--primary ph-btn--full ph-btn--lg"
            @click="goToCart"
          >
            <span class="cart-bar__count">{{ itemCount }}</span>
            <span class="cart-bar__label">Lihat Keranjang</span>
            <span class="cart-bar__price ph-price">{{ formatRupiah(total) }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.menu-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--ph-bg);
  border-bottom: 1px solid var(--ph-border-light);
  padding-top: var(--ph-space-md);
}

.menu-header__top {
  display: flex;
  align-items: center;
  gap: var(--ph-space-md);
  margin-bottom: var(--ph-space-md);
}

.menu-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ph-radius-sm);
  color: var(--ph-text);
  transition: background var(--ph-transition-fast);
}

.menu-header__back:hover {
  background: var(--ph-bg-muted);
}

.menu-header__info {
  display: flex;
  align-items: center;
  gap: var(--ph-space-sm);
}

.menu-header__title {
  font-family: var(--ph-font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

/* Category Tabs */
.menu-tabs {
  display: flex;
  gap: var(--ph-space-xs);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: var(--ph-space-md);
}

.menu-tabs::-webkit-scrollbar {
  display: none;
}

.menu-tabs__item {
  flex-shrink: 0;
  padding: 8px 16px;
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ph-text-secondary);
  background: transparent;
  border: 1.5px solid var(--ph-border);
  border-radius: var(--ph-radius-full);
  cursor: pointer;
  transition: all var(--ph-transition-fast);
  white-space: nowrap;
}

.menu-tabs__item:hover {
  border-color: var(--ph-text-muted);
}

.menu-tabs__item--active {
  background: var(--ph-primary);
  color: var(--ph-text-inverse);
  border-color: var(--ph-primary);
}

/* Menu Grid */
.menu-content {
  padding-top: var(--ph-space-lg);
  padding-bottom: var(--ph-space-2xl);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ph-space-md);
}

@media (min-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: none;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  width: 100%;
}

.product-card__image {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--ph-radius-md) var(--ph-radius-md) 0 0;
  background: var(--ph-bg-muted);
}

.product-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--ph-transition);
}

.product-card:hover .product-card__image img {
  transform: scale(1.05);
}

.product-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: var(--ph-bg-muted);
}

.product-card__body {
  padding: var(--ph-space-sm) var(--ph-space-sm) var(--ph-space-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.product-card__name {
  font-family: var(--ph-font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ph-text);
  line-height: 1.3;
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

.product-card__price {
  margin-top: auto;
  padding-top: var(--ph-space-xs);
  font-size: 0.875rem;
  color: var(--ph-accent);
}

/* Skeleton */
.product-card-skeleton {
  aspect-ratio: 0.75;
  border-radius: var(--ph-radius-md);
}

/* Empty state */
.menu-empty {
  text-align: center;
  padding: var(--ph-space-2xl) var(--ph-space-md);
  color: var(--ph-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-md);
}

/* Cart bar */
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

/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

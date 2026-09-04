<script setup lang="ts">
/**
 * Product Detail Page — Taste Skill Anti-Slop Specification
 * Clean Modern Layout (No heavy outer background wrappers / pelapis)
 */

import type { Product, ProductVariant, Modifier } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { formatRupiah } from '~/utils/currency'

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string
const { addItem, calculateUnitPrice } = useCart()

useHead({ title: 'Detail Produk — Philanthroffee' })

// View mode switcher: 'desktop' or 'mobile'
const viewMode = ref<'desktop' | 'mobile'>('desktop')

// Fetch product details
const { data: productData, pending, error } = await useFetch<{ success: boolean; data: Product }>(`/api/menu/${productId}`)
const product = computed(() => productData.value?.data)

const selectedVariant = ref<ProductVariant | null>(null)
const selectedModifiers = ref<Map<string, string[]>>(new Map())
const notes = ref('')
const quantity = ref(1)

// Initialize default variant and required modifiers
watch(product, (p) => {
  if (!p) return
  selectedVariant.value = p.variants[0] ?? null
  const modMap = new Map<string, string[]>()
  for (const group of p.modifier_groups) {
    if (group.is_required && group.modifiers.length > 0) {
      modMap.set(group.id, [group.modifiers[0]!.id])
    } else {
      modMap.set(group.id, [])
    }
  }
  selectedModifiers.value = modMap
}, { immediate: true })

const allSelectedModifiers = computed((): Modifier[] => {
  if (!product.value) return []
  const mods: Modifier[] = []
  for (const group of product.value.modifier_groups) {
    const ids = selectedModifiers.value.get(group.id) || []
    for (const mod of group.modifiers) {
      if (ids.includes(mod.id)) mods.push(mod)
    }
  }
  return mods
})

const unitPrice = computed(() => {
  if (!product.value) return 0
  return calculateUnitPrice(product.value.base_price, selectedVariant.value, allSelectedModifiers.value)
})

const totalPrice = computed(() => unitPrice.value * quantity.value)

function selectSingle(gid: string, mid: string) {
  const newMap = new Map(selectedModifiers.value)
  newMap.set(gid, [mid])
  selectedModifiers.value = newMap
}

function toggleMulti(gid: string, mid: string) {
  const newMap = new Map(selectedModifiers.value)
  const cur = newMap.get(gid) || []
  if (cur.includes(mid)) {
    newMap.set(gid, cur.filter(i => i !== mid))
  } else {
    newMap.set(gid, [...cur, mid])
  }
  selectedModifiers.value = newMap
}

function isSelected(gid: string, mid: string) {
  return (selectedModifiers.value.get(gid) || []).includes(mid)
}

function incQty() { if (quantity.value < 10) quantity.value++ }
function decQty() { if (quantity.value > 1) quantity.value-- }

const isValid = computed(() => {
  if (!product.value) return false
  return product.value.modifier_groups.every(g => {
    if (!g.is_required) return true
    return (selectedModifiers.value.get(g.id) || []).length >= Math.max(1, g.min_selections)
  })
})

function handleAdd() {
  if (!product.value || !isValid.value) return
  const mods = allSelectedModifiers.value.map(mod => {
    const group = product.value!.modifier_groups.find(g => g.modifiers.some(m => m.id === mod.id))
    return {
      modifierId: mod.id,
      modifierName: mod.name,
      groupName: group?.name || '',
      priceAdjustment: mod.price_adjustment
    }
  })
  addItem({
    productId: product.value.id,
    productName: product.value.name,
    productImage: product.value.image_url,
    variantId: selectedVariant.value?.id || null,
    variantName: selectedVariant.value?.name || null,
    basePrice: product.value.base_price,
    variantPrice: selectedVariant.value?.price_adjustment || 0,
    modifiers: mods,
    quantity: quantity.value,
    unitPrice: unitPrice.value,
    notes: notes.value.trim(),
  })
  router.push('/menu')
}
</script>

<template>
  <div class="product-page ph-page">
    
    <!-- Responsive Viewport Shell -->
    <div :class="['product-viewport-wrapper', { 'product-viewport-wrapper--mobile-frame': viewMode === 'mobile' }]">
      
      <!-- Mobile Phone Notch / Speaker Mockup (Mobile Mode Only) -->
      <div v-if="viewMode === 'mobile'" class="mobile-frame-speaker">
        <div class="speaker-bar"></div>
        <div class="camera-dot"></div>
      </div>

      <!-- Clean Header Control Row -->
      <header class="clean-product-header">
        <div class="header-brand-group">
          <button class="back-link-btn" @click="router.back()" aria-label="Kembali">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="product-header-label">Detail Produk</span>
        </div>

        <div class="view-mode-pills">
          <button
            :class="['mode-pill-btn', { 'mode-pill-btn--active': viewMode === 'desktop' }]"
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
            :class="['mode-pill-btn', { 'mode-pill-btn--active': viewMode === 'mobile' }]"
            @click="viewMode = 'mobile'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3" />
            </svg>
            <span>Mobile</span>
          </button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="pending" class="product-content product-content--skeleton">
        <div class="ph-skeleton skeleton-img"></div>
        <div class="skeleton-info">
          <div class="ph-skeleton skeleton-line short"></div>
          <div class="ph-skeleton skeleton-line title"></div>
          <div class="ph-skeleton skeleton-line text"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !product" class="product-content product-empty ph-card">
        <div class="empty-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--ph-accent);">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 class="ph-heading-md">Produk Tidak Ditemukan</h2>
        <p class="ph-caption">Menu yang Anda cari mungkin sudah tidak tersedia.</p>
        <NuxtLink to="/menu" class="ph-btn ph-btn--primary">Kembali ke Menu</NuxtLink>
      </div>

      <!-- Main Product Detail Content -->
      <div v-else :class="['product-main-layout', { 'product-main-layout--desktop': viewMode === 'desktop' }]">
        
        <!-- Left Column: Product Visual Card -->
        <div class="product-visual-col">
          <div class="product-hero-card">
            <div class="hero-image-wrapper">
              <img
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="hero-img"
              />
              <div v-else class="hero-placeholder">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="color: var(--ph-primary);">
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" y1="2" x2="6" y2="4" />
                  <line x1="10" y1="2" x2="10" y2="4" />
                  <line x1="14" y1="2" x2="14" y2="4" />
                </svg>
              </div>

              <span v-if="product.is_featured" class="hero-signature-badge">SIGNATURE ROAST</span>
            </div>

            <!-- Quality Badges -->
            <div v-if="viewMode === 'desktop'" class="quality-badges-row">
              <div class="quality-item">
                <span class="q-icon">🌱</span>
                <span>100% Arabika Organik</span>
              </div>
              <div class="quality-item">
                <span class="q-icon">🥛</span>
                <span>Susu Murni Fresh</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Details & Customizations -->
        <div class="product-details-col ph-card">
          
          <div class="details-header">
            <span class="ph-badge ph-badge--accent">{{ product.category?.name || 'SPECIALTY' }}</span>
            <h1 class="product-title">{{ product.name }}</h1>
            <p v-if="product.description" class="product-desc">{{ product.description }}</p>
            <div class="product-base-price ph-price">{{ formatRupiah(product.base_price) }}</div>
          </div>

          <!-- Sold Out Warning Banner -->
          <div v-if="product.availability === ProductAvailability.SOLD_OUT" class="sold-out-banner">
            <span class="ph-badge ph-badge--error">Stok Habis</span>
            <p>Produk ini sedang tidak tersedia hari ini.</p>
          </div>

          <!-- Customization Groups -->
          <div v-else class="customizations-stack">
            
            <!-- Variants Selection -->
            <div v-if="product.variants.length > 0" class="custom-group">
              <h3 class="group-title">Pilih Ukuran</h3>
              <div class="option-chips-grid">
                <button
                  v-for="v in product.variants"
                  :key="v.id"
                  :class="['option-chip', { 'option-chip--selected': selectedVariant?.id === v.id }]"
                  @click="selectedVariant = v"
                >
                  <span>{{ v.name }}</span>
                  <span v-if="v.price_adjustment > 0" class="chip-price">+{{ formatRupiah(v.price_adjustment) }}</span>
                </button>
              </div>
            </div>

            <!-- Modifier Groups -->
            <div v-for="group in product.modifier_groups" :key="group.id" class="custom-group">
              <div class="group-title-row">
                <h3 class="group-title">{{ group.name }}</h3>
                <span v-if="group.is_required" class="required-badge">Wajib</span>
              </div>

              <div class="option-chips-grid">
                <button
                  v-for="mod in group.modifiers"
                  :key="mod.id"
                  :class="['option-chip', { 'option-chip--selected': isSelected(group.id, mod.id) }]"
                  @click="group.selection_type === 'SINGLE' ? selectSingle(group.id, mod.id) : toggleMulti(group.id, mod.id)"
                >
                  <span>{{ mod.name }}</span>
                  <span v-if="mod.price_adjustment > 0" class="chip-price">+{{ formatRupiah(mod.price_adjustment) }}</span>
                </button>
              </div>
            </div>

            <!-- Notes for Barista -->
            <div class="custom-group">
              <h3 class="group-title">Catatan untuk Barista</h3>
              <textarea
                v-model="notes"
                placeholder="Contoh: Sedikit es, tanpa whipped cream..."
                class="notes-textarea ph-input"
                rows="2"
                maxlength="150"
              ></textarea>
            </div>

          </div>

          <!-- Floating Action Control -->
          <div v-if="product.availability !== ProductAvailability.SOLD_OUT" class="product-action-bar">
            <div class="qty-stepper">
              <button class="qty-btn" :disabled="quantity <= 1" @click="decQty" aria-label="Kurangi">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span class="qty-num">{{ quantity }}</span>
              <button class="qty-btn" :disabled="quantity >= 10" @click="incQty" aria-label="Tambah">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <button
              class="ph-btn ph-btn--primary ph-btn--lg add-cart-btn"
              :disabled="!isValid"
              @click="handleAdd"
            >
              <span>+ Tambah ke Keranjang</span>
              <span class="ph-price">{{ formatRupiah(totalPrice) }}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.product-page {
  min-height: 100dvh;
  background: var(--ph-bg);
}

.product-viewport-wrapper {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 var(--ph-space-md) var(--ph-space-xl);
  transition: all 0.3s ease;
}

.product-viewport-wrapper--mobile-frame {
  max-width: 414px;
  margin: 1rem auto;
  padding: 0;
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

.clean-product-header {
  padding: var(--ph-space-md) 0 var(--ph-space-xs);
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
  cursor: pointer;
}

.product-header-label {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
}

.view-mode-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ph-bg-elevated);
  padding: 3px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
}

.mode-pill-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: var(--ph-radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ph-text-secondary);
  background: transparent;
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.mode-pill-btn--active {
  background: var(--ph-primary);
  color: #fff;
}

.product-main-layout--desktop {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: var(--ph-space-lg);
  align-items: start;
  margin-top: var(--ph-space-xs);
}

.product-hero-card {
  position: relative;
  padding: var(--ph-space-md);
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
  overflow: hidden;
}

.hero-image-wrapper {
  width: 100%;
  aspect-ratio: 1.1;
  border-radius: var(--ph-radius-lg);
  background: var(--ph-bg-elevated);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.hero-signature-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: var(--ph-radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  background: var(--ph-primary);
  color: #fff;
  letter-spacing: 0.04em;
}

.quality-badges-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: var(--ph-space-md);
  padding-top: var(--ph-space-sm);
  border-top: 1px dashed var(--ph-border);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ph-text-secondary);
}

.quality-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-details-col {
  padding: var(--ph-space-lg);
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.details-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.product-title {
  font-family: var(--ph-font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ph-text);
  letter-spacing: -0.02em;
}

.product-desc {
  font-size: 0.875rem;
  color: var(--ph-text-secondary);
  line-height: 1.5;
}

.product-base-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ph-accent);
  margin-top: 2px;
}

.sold-out-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--ph-space-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--ph-radius-md);
  color: #991b1b;
  font-size: 0.8125rem;
}

.customizations-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
  padding-top: var(--ph-space-sm);
  border-top: 1px solid var(--ph-border);
}

.custom-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.group-title {
  font-family: var(--ph-font-display);
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ph-text);
}

.required-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--ph-accent);
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  padding: 2px 8px;
  border-radius: var(--ph-radius-full);
}

.option-chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--ph-radius-full);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg);
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ph-text);
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.option-chip:hover {
  border-color: var(--ph-primary);
}

.option-chip--selected {
  background: var(--ph-primary);
  color: #fff;
  border-color: var(--ph-primary);
}

.chip-price {
  font-size: 0.75rem;
  opacity: 0.85;
}

.notes-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg);
  color: var(--ph-text);
  font-family: var(--ph-font-body);
  font-size: 0.8125rem;
  resize: vertical;
}

.product-action-bar {
  display: flex;
  align-items: center;
  gap: var(--ph-space-md);
  padding-top: var(--ph-space-md);
  border-top: 1px dashed var(--ph-border);
}

.qty-stepper {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ph-bg-elevated);
  padding: 4px;
  border-radius: var(--ph-radius-md);
  border: 1px solid var(--ph-border);
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--ph-radius-sm);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-card);
  color: var(--ph-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-num {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.add-cart-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-content--skeleton {
  padding: var(--ph-space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1.2;
  border-radius: var(--ph-radius-lg);
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  border-radius: 4px;
}

.skeleton-line.short { width: 30%; }
.skeleton-line.title { width: 70%; height: 28px; }
.skeleton-line.text { width: 90%; }

.product-empty {
  text-align: center;
  padding: var(--ph-space-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-sm);
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ph-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

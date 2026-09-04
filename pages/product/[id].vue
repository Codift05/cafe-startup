<script setup lang="ts">
import type { Product, ProductVariant, Modifier } from '~/types/product'
import { ProductAvailability } from '~/types/product'
import { formatRupiah } from '~/utils/currency'

const route = useRoute()
const router = useRouter()
const productId = route.params.id as string
const { addItem, calculateUnitPrice } = useCart()

useHead({ title: 'Produk — Philanthroffee' })

const { data: productData, pending, error } = await useFetch<{ success: boolean; data: Product }>(`/api/menu/${productId}`)
const product = computed(() => productData.value?.data)

const selectedVariant = ref<ProductVariant | null>(null)
const selectedModifiers = ref<Map<string, string[]>>(new Map())
const notes = ref('')
const quantity = ref(1)

watch(product, (p) => {
  if (!p) return
  if (p.variants.length > 0) selectedVariant.value = p.variants[0]
  for (const group of p.modifier_groups) {
    if (group.is_required && group.modifiers.length > 0) {
      selectedModifiers.value.set(group.id, [group.modifiers[0].id])
    } else {
      selectedModifiers.value.set(group.id, [])
    }
  }
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

function selectSingle(gid: string, mid: string) { selectedModifiers.value.set(gid, [mid]) }
function toggleMulti(gid: string, mid: string) {
  const cur = selectedModifiers.value.get(gid) || []
  selectedModifiers.value.set(gid, cur.includes(mid) ? cur.filter(i => i !== mid) : [...cur, mid])
}
function isSelected(gid: string, mid: string) { return (selectedModifiers.value.get(gid) || []).includes(mid) }
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
    return { modifierId: mod.id, modifierName: mod.name, groupName: group?.name || '', priceAdjustment: mod.price_adjustment }
  })
  addItem({
    productId: product.value.id, productName: product.value.name, productImage: product.value.image_url,
    variantId: selectedVariant.value?.id || null, variantName: selectedVariant.value?.name || null,
    basePrice: product.value.base_price, variantPrice: selectedVariant.value?.price_adjustment || 0,
    modifiers: mods, quantity: quantity.value, unitPrice: unitPrice.value, notes: notes.value.trim(),
  })
  router.back()
}
</script>

<template>
  <div class="product-page ph-page">
    <div v-if="pending" class="ph-container" style="padding-top:16px;">
      <div class="ph-skeleton" style="width:100%;aspect-ratio:1;" />
      <div style="padding:16px 0;display:flex;flex-direction:column;gap:12px;">
        <div class="ph-skeleton" style="height:28px;width:60%;" />
        <div class="ph-skeleton" style="height:24px;width:30%;" />
      </div>
    </div>

    <div v-else-if="error || !product" class="ph-container" style="min-height:60dvh;display:flex;align-items:center;justify-content:center;text-align:center;">
      <div class="ph-animate-in" style="display:flex;flex-direction:column;align-items:center;gap:12px;">
        <p style="font-size:2.5rem;">😔</p>
        <h2 class="ph-heading-md">Produk tidak ditemukan</h2>
        <NuxtLink to="/menu" class="ph-btn ph-btn--secondary">Kembali ke Menu</NuxtLink>
      </div>
    </div>

    <div v-else>
      <div class="product-hero">
        <button class="product-hero__back" @click="router.back()" aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" style="width:100%;height:100%;object-fit:cover;" />
        <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;background:var(--ph-bg-muted);">☕</div>
      </div>

      <div class="ph-container ph-animate-in" style="padding-top:var(--ph-space-lg);padding-bottom:120px;">
        <div style="display:flex;flex-direction:column;gap:var(--ph-space-sm);margin-bottom:var(--ph-space-lg);">
          <span class="ph-badge ph-badge--accent">{{ product.category?.name }}</span>
          <h1 style="font-family:var(--ph-font-display);font-size:1.5rem;font-weight:700;letter-spacing:-0.02em;">{{ product.name }}</h1>
          <p v-if="product.description" style="color:var(--ph-text-secondary);font-size:0.9375rem;line-height:1.5;">{{ product.description }}</p>
          <p class="ph-price" style="font-size:1.25rem;color:var(--ph-accent);">{{ formatRupiah(product.base_price) }}</p>
        </div>

        <div v-if="product.availability === ProductAvailability.SOLD_OUT" style="display:flex;align-items:center;gap:8px;padding:16px;background:var(--ph-error-light);border-radius:var(--ph-radius-md);margin-bottom:24px;color:var(--ph-error);font-size:0.875rem;">
          <span class="ph-badge ph-badge--error">Habis</span>
          <p>Produk ini sedang tidak tersedia</p>
        </div>

        <!-- Variants -->
        <div v-if="product.variants.length > 0" style="margin-bottom:var(--ph-space-lg);">
          <h3 class="section-title">Ukuran</h3>
          <div class="option-group">
            <button v-for="v in product.variants" :key="v.id" :class="['option-chip', { 'option-chip--sel': selectedVariant?.id === v.id }]" @click="selectedVariant = v">
              <span>{{ v.name }}</span>
              <span v-if="v.price_adjustment > 0" style="font-size:0.75rem;opacity:0.7;">{{ formatRupiah(v.price_adjustment, true) }}</span>
            </button>
          </div>
        </div>

        <!-- Modifiers -->
        <div v-for="group in product.modifier_groups" :key="group.id" style="margin-bottom:var(--ph-space-lg);">
          <h3 class="section-title">
            {{ group.name }}
            <span v-if="group.is_required" class="req-badge">Wajib</span>
          </h3>
          <div class="option-group">
            <button v-for="mod in group.modifiers" :key="mod.id" :class="['option-chip', { 'option-chip--sel': isSelected(group.id, mod.id) }]"
              @click="group.selection_type === 'SINGLE' ? selectSingle(group.id, mod.id) : toggleMulti(group.id, mod.id)">
              <span>{{ mod.name }}</span>
              <span v-if="mod.price_adjustment > 0" style="font-size:0.75rem;opacity:0.7;">{{ formatRupiah(mod.price_adjustment, true) }}</span>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div style="margin-bottom:var(--ph-space-lg);">
          <h3 class="section-title">Catatan untuk Barista</h3>
          <textarea v-model="notes" class="notes-input" placeholder="Contoh: Extra hot, tanpa whipped cream..." rows="2" maxlength="200" />
        </div>
      </div>

      <!-- Bottom Bar -->
      <div v-if="product.availability !== ProductAvailability.SOLD_OUT" class="ph-floating-bar">
        <div class="ph-floating-bar__content" style="display:flex;align-items:center;gap:var(--ph-space-md);">
          <div class="qty-ctrl">
            <button class="qty-btn" :disabled="quantity <= 1" @click="decQty"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            <span style="min-width:28px;text-align:center;font-weight:600;">{{ quantity }}</span>
            <button class="qty-btn" :disabled="quantity >= 10" @click="incQty"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          <button id="btn-add-to-cart" class="ph-btn ph-btn--primary ph-btn--lg" style="flex:1;" :disabled="!isValid" @click="handleAdd">
            <span>Tambah</span>
            <span class="ph-price">{{ formatRupiah(totalPrice) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-hero { position:relative;width:100%;max-width:480px;margin:0 auto;aspect-ratio:1;background:var(--ph-bg-muted);overflow:hidden; }
.product-hero__back { position:absolute;top:16px;left:16px;z-index:10;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);border:none;border-radius:50%;cursor:pointer;color:var(--ph-text);box-shadow:var(--ph-shadow-sm);transition:all 150ms ease; }
.product-hero__back:hover { background:#fff;box-shadow:var(--ph-shadow-md); }
.section-title { font-family:var(--ph-font-display);font-size:0.9375rem;font-weight:600;margin-bottom:8px;display:flex;align-items:center;gap:8px; }
.req-badge { font-size:0.6875rem;font-weight:600;color:var(--ph-accent);background:var(--ph-accent-light);padding:2px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:0.04em; }
.option-group { display:flex;flex-wrap:wrap;gap:8px; }
.option-chip { display:inline-flex;align-items:center;gap:6px;padding:10px 16px;font-family:var(--ph-font-body);font-size:0.875rem;font-weight:500;color:var(--ph-text);background:var(--ph-bg-card);border:1.5px solid var(--ph-border);border-radius:999px;cursor:pointer;transition:all 150ms ease; }
.option-chip:hover { border-color:var(--ph-text-muted); }
.option-chip--sel { background:var(--ph-primary);color:var(--ph-text-inverse);border-color:var(--ph-primary); }
.notes-input { width:100%;padding:12px 16px;font-family:var(--ph-font-body);font-size:0.875rem;color:var(--ph-text);background:var(--ph-bg-card);border:1.5px solid var(--ph-border);border-radius:var(--ph-radius-md);resize:vertical;transition:border-color 150ms ease; }
.notes-input:focus { outline:none;border-color:var(--ph-accent); }
.notes-input::placeholder { color:var(--ph-text-muted); }
.qty-ctrl { display:flex;align-items:center;gap:8px;background:var(--ph-bg-muted);border-radius:var(--ph-radius-md);padding:4px; }
.qty-btn { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;background:var(--ph-bg-card);border-radius:var(--ph-radius-sm);cursor:pointer;color:var(--ph-text);transition:all 150ms ease; }
.qty-btn:hover:not(:disabled) { background:var(--ph-border); }
.qty-btn:disabled { opacity:0.3;cursor:not-allowed; }
</style>

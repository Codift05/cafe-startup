<script setup lang="ts">
import { formatRupiah } from '~/utils/currency'
import { OrderType } from '~/types/order'

useHead({ title: 'Keranjang — Philanthroffee' })

const router = useRouter()
const { cart, itemCount, total, isEmpty, removeItem, updateQuantity } = useCart()

const orderLabel = computed(() => {
  if (cart.value.orderType === OrderType.DINE_IN) return `Dine In · Meja ${cart.value.tableNumber}`
  return 'Pickup'
})

function goCheckout() { router.push('/checkout') }
</script>

<template>
  <div class="cart-page ph-page">
    <header style="position:sticky;top:0;z-index:40;background:var(--ph-bg);border-bottom:1px solid var(--ph-border-light);padding:var(--ph-space-md) 0;">
      <div class="ph-container" style="display:flex;align-items:center;gap:var(--ph-space-md);">
        <button style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--ph-radius-sm);border:none;background:none;cursor:pointer;color:var(--ph-text);" @click="router.back()" aria-label="Kembali">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 style="font-family:var(--ph-font-display);font-size:1.25rem;font-weight:700;">Keranjang</h1>
          <span class="ph-caption">{{ orderLabel }} · {{ itemCount }} item</span>
        </div>
      </div>
    </header>

    <main class="ph-container" style="padding-top:var(--ph-space-lg);padding-bottom:120px;">
      <!-- Empty -->
      <div v-if="isEmpty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:40dvh;text-align:center;gap:var(--ph-space-md);">
        <p style="font-size:3rem;">🛒</p>
        <h2 class="ph-heading-md">Keranjang Kosong</h2>
        <p class="ph-caption">Belum ada item. Yuk pilih menu!</p>
        <NuxtLink to="/menu" class="ph-btn ph-btn--primary">Lihat Menu</NuxtLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="ph-stagger" style="display:flex;flex-direction:column;gap:var(--ph-space-md);">
        <div v-for="item in cart.items" :key="item.cartItemId" class="cart-item ph-card" style="padding:var(--ph-space-md);">
          <div style="display:flex;gap:var(--ph-space-md);">
            <!-- Image -->
            <div style="width:64px;height:64px;border-radius:var(--ph-radius-sm);overflow:hidden;background:var(--ph-bg-muted);flex-shrink:0;">
              <img v-if="item.productImage" :src="item.productImage" :alt="item.productName" style="width:100%;height:100%;object-fit:cover;" />
              <div v-else style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">☕</div>
            </div>
            <!-- Info -->
            <div style="flex:1;min-width:0;">
              <h3 style="font-family:var(--ph-font-display);font-size:0.9375rem;font-weight:600;">{{ item.productName }}</h3>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
                <span v-if="item.variantName" class="ph-caption" style="background:var(--ph-bg-muted);padding:2px 8px;border-radius:999px;">{{ item.variantName }}</span>
                <span v-for="mod in item.modifiers" :key="mod.modifierId" class="ph-caption" style="background:var(--ph-bg-muted);padding:2px 8px;border-radius:999px;">{{ mod.modifierName }}</span>
              </div>
              <p v-if="item.notes" class="ph-caption" style="margin-top:4px;font-style:italic;">📝 {{ item.notes }}</p>
              <p class="ph-price" style="margin-top:8px;color:var(--ph-accent);font-size:0.9375rem;">{{ formatRupiah(item.unitPrice * item.quantity) }}</p>
            </div>
          </div>

          <!-- Quantity + Remove -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--ph-space-sm);padding-top:var(--ph-space-sm);border-top:1px solid var(--ph-border-light);">
            <button style="font-size:0.8125rem;color:var(--ph-error);background:none;border:none;cursor:pointer;padding:4px 8px;" @click="removeItem(item.cartItemId)">Hapus</button>
            <div class="qty-ctrl">
              <button class="qty-btn" :disabled="item.quantity <= 1" @click="updateQuantity(item.cartItemId, item.quantity - 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span style="min-width:24px;text-align:center;font-weight:600;font-size:0.875rem;">{{ item.quantity }}</span>
              <button class="qty-btn" :disabled="item.quantity >= 10" @click="updateQuantity(item.cartItemId, item.quantity + 1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Checkout Bar -->
    <Transition name="slide-up">
      <div v-if="!isEmpty" class="ph-floating-bar">
        <div class="ph-floating-bar__content" style="display:flex;flex-direction:column;gap:var(--ph-space-sm);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:0.875rem;color:var(--ph-text-secondary);">Total</span>
            <span class="ph-price" style="font-size:1.125rem;">{{ formatRupiah(total) }}</span>
          </div>
          <button id="btn-checkout" class="ph-btn ph-btn--primary ph-btn--full ph-btn--lg" @click="goCheckout">
            Checkout
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.qty-ctrl { display:flex;align-items:center;gap:6px;background:var(--ph-bg-muted);border-radius:var(--ph-radius-sm);padding:2px; }
.qty-btn { display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;background:var(--ph-bg-card);border-radius:4px;cursor:pointer;color:var(--ph-text);transition:all 150ms ease; }
.qty-btn:hover:not(:disabled) { background:var(--ph-border); }
.qty-btn:disabled { opacity:0.3;cursor:not-allowed; }
.slide-up-enter-active,.slide-up-leave-active { transition:all 0.3s ease; }
.slide-up-enter-from,.slide-up-leave-to { transform:translateY(100%);opacity:0; }
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'
import { formatRupiah } from '~/utils/currency'
import { OrderType } from '~/types/order'

useHead({ title: 'Checkout — Philanthroffee' })

const router = useRouter()
const { cart, itemCount, total, clearCart } = useCart()

const customerName = ref('')
const customerPhone = ref('')
const selectedPaymentMethod = ref<'QRIS' | 'PAY_AT_CASHIER'>('QRIS')
const isSubmitting = ref(false)
const nameError = ref(false)
const errorMessage = ref('')

async function submitOrder() {
  errorMessage.value = ''
  nameError.value = false

  if (!customerName.value.trim()) {
    nameError.value = true
    return
  }

  isSubmitting.value = true

  try {
    // Generate client idempotency key
    const idempotencyKey = crypto.randomUUID()

    // Step 1: Create Order
    const orderPayload = {
      order_type: cart.value.orderType,
      table_id: cart.value.tableId,
      customer_name: customerName.value.trim(),
      customer_phone: customerPhone.value.trim() || undefined,
      idempotency_key: idempotencyKey,
      items: cart.value.items.map(item => ({
        product_id: item.productId,
        variant_id: item.variantId || null,
        modifier_ids: item.modifiers.map(m => m.modifierId),
        quantity: item.quantity,
        notes: item.notes || null,
      })),
    }

    const orderRes = await $fetch<{ success: boolean; data: any }>('/api/orders', {
      method: 'POST',
      body: orderPayload,
    })

    const orderNumber = orderRes.data.order_number

    // Step 2: Initialize Payment
    await $fetch<{ success: boolean; data: any }>('/api/payments', {
      method: 'POST',
      body: {
        order_number: orderNumber,
        payment_method: selectedPaymentMethod.value,
      },
    })

    // Step 3: Clear cart & navigate to payment page
    clearCart()
    router.push(`/payment/${orderNumber}`)
  } catch (err: any) {
    if (err.data && err.data.message) {
      errorMessage.value = err.data.message
    } else {
      errorMessage.value = 'Terjadi kesalahan sistem saat membuat pesanan. Silakan coba lagi.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="checkout-page ph-page">
    
    <!-- Sticky Header -->
    <header class="checkout-header">
      <div class="ph-container checkout-header__inner">
        <button class="back-btn" @click="router.back()" aria-label="Kembali">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 class="checkout-title">Checkout Pesanan</h1>
        <span class="ph-badge ph-badge--accent">{{ cart.orderType === OrderType.DINE_IN ? 'Dine In' : 'Pickup' }}</span>
      </div>
    </header>

    <main class="ph-container checkout-content">
      
      <!-- Empty Cart Guard -->
      <div v-if="cart.items.length === 0" class="ph-card checkout-empty">
        <div class="empty-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--ph-primary);">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 class="ph-heading-md">Keranjang Anda Kosong</h2>
        <p class="ph-caption">Silakan pilih menu favorit Anda terlebih dahulu sebelum melakukan checkout.</p>
        <button class="ph-btn ph-btn--primary" @click="router.push('/menu')">Lihat Menu</button>
      </div>

      <div v-else class="checkout-form-stack">

        <!-- Order Type Banner -->
        <div class="ph-card order-type-card">
          <div class="order-type-card__icon">
            <svg v-if="cart.orderType === OrderType.DINE_IN" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div class="order-type-card__info">
            <span class="order-type-label">Tipe Pesanan</span>
            <h2 class="order-type-title">
              {{ cart.orderType === OrderType.DINE_IN ? `Dine In · Meja ${cart.tableNumber || '-'}` : 'Pickup / Takeaway' }}
            </h2>
          </div>
          <span class="ph-badge ph-badge--accent">{{ cart.orderType === OrderType.DINE_IN ? 'Meja' : 'Pickup' }}</span>
        </div>

        <!-- Customer Detail Form -->
        <div class="ph-card checkout-section">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Informasi Pemesan</span>
          </h3>

          <div class="form-group-stack">
            <div class="form-field">
              <label class="form-label">
                Nama Pemesan <span class="required-star">*</span>
              </label>
              <input
                v-model="customerName"
                type="text"
                placeholder="Contoh: Budi Prasetyo"
                class="ph-input"
                required
              />
              <p v-if="nameError" class="form-error-msg">Nama pemesan wajib diisi.</p>
            </div>

            <div class="form-field">
              <label class="form-label">
                Nomor WhatsApp / HP <span class="optional-tag">(Opsional)</span>
              </label>
              <input
                v-model="customerPhone"
                type="tel"
                placeholder="Contoh: 081234567890"
                class="ph-input"
              />
            </div>
          </div>
        </div>

        <!-- Cart Summary Card -->
        <div class="ph-card checkout-section">
          <div class="section-header-row">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
              <span>Ringkasan Pesanan ({{ itemCount }} item)</span>
            </h3>
            <button class="edit-cart-link" @click="router.push('/cart')">Ubah Keranjang</button>
          </div>

          <div class="checkout-items-list">
            <div v-for="item in cart.items" :key="item.cartItemId" class="checkout-item-row">
              <div class="checkout-item-details">
                <span class="item-name">
                  <strong class="item-qty">{{ item.quantity }}x</strong>
                  {{ item.productName }}
                </span>
                <span v-if="item.variantName" class="item-variant">Variant: {{ item.variantName }}</span>
                <div v-if="item.modifiers.length > 0" class="item-modifiers">
                  <span v-for="mod in item.modifiers" :key="mod.modifierId" class="mod-pill">
                    {{ mod.modifierName }}
                  </span>
                </div>
                <p v-if="item.notes" class="item-notes">"{{ item.notes }}"</p>
              </div>
              <span class="item-price ph-price">{{ formatRupiah(item.unitPrice * item.quantity) }}</span>
            </div>
          </div>

          <!-- Total Breakdown -->
          <div class="checkout-breakdown">
            <div class="breakdown-row">
              <span>Subtotal Menu</span>
              <span>{{ formatRupiah(total) }}</span>
            </div>
            <div class="breakdown-row breakdown-row--total">
              <span>Total Pembayaran</span>
              <span class="ph-price">{{ formatRupiah(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="ph-card checkout-section">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Metode Pembayaran</span>
          </h3>

          <div class="payment-methods-grid">
            <!-- QRIS / E-Wallet -->
            <label :class="['payment-method-card', { 'payment-method-card--selected': selectedPaymentMethod === 'QRIS' }]">
              <input type="radio" v-model="selectedPaymentMethod" value="QRIS" class="radio-input" />
              <div class="payment-method-info">
                <span class="payment-title">QRIS / Instant Payment</span>
                <span class="payment-desc">GoPay, OVO, ShopeePay, BCA, Mandiri QRIS</span>
              </div>
              <span class="ph-badge ph-badge--accent">Otomatis</span>
            </label>

            <!-- Pay at Cashier -->
            <label :class="['payment-method-card', { 'payment-method-card--selected': selectedPaymentMethod === 'PAY_AT_CASHIER' }]">
              <input type="radio" v-model="selectedPaymentMethod" value="PAY_AT_CASHIER" class="radio-input" />
              <div class="payment-method-info">
                <span class="payment-title">Bayar di Kasir (Cash / Tunai)</span>
                <span class="payment-desc">Tunjukkan nomor pesanan ke kasir untuk bayar</span>
              </div>
              <span class="ph-badge">Kasir</span>
            </label>
          </div>
        </div>

        <!-- Error Notification -->
        <div v-if="errorMessage" class="error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <h4 class="error-title">Gagal Memproses Pesanan</h4>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

      </div>
    </main>

    <!-- Bottom Sticky Submit Bar -->
    <div v-if="cart.items.length > 0" class="ph-floating-bar">
      <div class="ph-container submit-bar__inner">
        <div>
          <span class="submit-total-label">Total Pembayaran</span>
          <div class="submit-total-price ph-price">{{ formatRupiah(total) }}</div>
        </div>

        <button
          class="ph-btn ph-btn--primary ph-btn--lg submit-btn"
          :disabled="isSubmitting"
          @click="submitOrder"
        >
          <span v-if="isSubmitting">Memproses...</span>
          <span v-else>Buat Pesanan Sekarang</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.checkout-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--ph-bg-card);
  border-bottom: 1px solid var(--ph-border);
  padding: var(--ph-space-md) 0;
}

.checkout-header__inner {
  display: flex;
  align-items: center;
  gap: var(--ph-space-md);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ph-radius-md);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  color: var(--ph-text);
  cursor: pointer;
}

.checkout-title {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
  flex: 1;
}

.checkout-content {
  padding-top: var(--ph-space-lg);
  padding-bottom: 120px;
}

.checkout-empty {
  text-align: center;
  padding: var(--ph-space-xl) var(--ph-space-md);
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

.checkout-form-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.order-type-card {
  display: flex;
  align-items: center;
  gap: var(--ph-space-md);
  padding: var(--ph-space-md);
}

.order-type-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--ph-radius-md);
  background: var(--ph-bg-elevated);
  color: var(--ph-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ph-border);
}

.order-type-card__info {
  flex: 1;
}

.order-type-label {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.order-type-title {
  font-family: var(--ph-font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-text);
}

.checkout-section {
  padding: var(--ph-space-md);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
}

.section-title {
  font-family: var(--ph-font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.edit-cart-link {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--ph-accent);
  background: none;
  border: none;
  cursor: pointer;
}

.form-group-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ph-text);
}

.required-star {
  color: var(--ph-accent);
}

.optional-tag {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.form-error-msg {
  font-size: 0.75rem;
  color: #dc2626;
}

.checkout-items-list {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-xs);
  padding-top: var(--ph-space-xs);
  border-top: 1px solid var(--ph-border);
}

.checkout-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 6px 0;
}

.checkout-item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-size: 0.875rem;
  color: var(--ph-text);
}

.item-qty {
  color: var(--ph-primary);
}

.item-variant, .item-notes {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.item-modifiers {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mod-pill {
  font-size: 0.6875rem;
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  padding: 1px 6px;
  border-radius: var(--ph-radius-sm);
  color: var(--ph-text-secondary);
}

.item-price {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.checkout-breakdown {
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

.payment-methods-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-method-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ph-space-sm) var(--ph-space-md);
  border-radius: var(--ph-radius-md);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.payment-method-card--selected {
  border-color: var(--ph-primary);
  background: var(--ph-bg-card);
  box-shadow: 0 0 0 1px var(--ph-primary);
}

.radio-input {
  accent-color: var(--ph-primary);
  margin-right: 10px;
}

.payment-method-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.payment-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ph-text);
}

.payment-desc {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--ph-space-md);
  border-radius: var(--ph-radius-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.error-title {
  font-size: 0.875rem;
  font-weight: 700;
}

.submit-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ph-space-md);
}

.submit-total-label {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.submit-total-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.submit-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>

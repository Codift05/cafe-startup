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
    const idempotencyKey = crypto.randomUUID()

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

    await $fetch<{ success: boolean; data: any }>('/api/payments', {
      method: 'POST',
      body: {
        order_number: orderNumber,
        payment_method: selectedPaymentMethod.value,
      },
    })

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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="checkout-header__title-box">
          <h1 class="checkout-title">Checkout Pesanan</h1>
          <p class="checkout-subtitle">Konfirmasi data & metode pembayaran</p>
        </div>
        <span class="ph-badge ph-badge--accent header-type-badge">
          {{ cart.orderType === OrderType.DINE_IN ? 'Dine In' : 'Pickup' }}
        </span>
      </div>
    </header>

    <main class="ph-container checkout-content">
      
      <!-- Empty Cart Guard -->
      <div v-if="cart.items.length === 0" class="ph-card checkout-empty">
        <div class="empty-icon-circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color: var(--ph-primary);">
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

        <!-- Order Type Card -->
        <div class="ph-card order-type-card">
          <div class="order-type-card__icon">
            <svg v-if="cart.orderType === OrderType.DINE_IN" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <span class="ph-badge ph-badge--accent">{{ cart.orderType === OrderType.DINE_IN ? 'Dine In' : 'Pickup' }}</span>
        </div>

        <!-- Customer Detail Form -->
        <div class="ph-card checkout-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Informasi Pemesan</span>
            </h3>
          </div>

          <div class="form-group-stack">
            
            <div class="form-field">
              <label class="form-label" for="customer-name">
                Nama Pemesan <span class="required-star">*</span>
              </label>
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="customer-name"
                  v-model="customerName"
                  type="text"
                  placeholder="Contoh: Budi Prasetyo"
                  :class="['ph-input', 'input-field', { 'ph-input--error': nameError }]"
                  required
                />
              </div>
              <p v-if="nameError" class="form-error-msg">Nama pemesan wajib diisi.</p>
            </div>

            <div class="form-field">
              <label class="form-label" for="customer-phone">
                Nomor WhatsApp / HP <span class="optional-tag">(Opsional)</span>
              </label>
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="customer-phone"
                  v-model="customerPhone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  class="ph-input input-field"
                />
              </div>
            </div>

          </div>
        </div>

        <!-- Cart Summary Card -->
        <div class="ph-card checkout-section">
          <div class="section-header-row">
            <h3 class="section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <span v-if="item.variantName" class="item-variant">Varian: {{ item.variantName }}</span>
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
              <span class="ph-price breakdown-total-price">{{ formatRupiah(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="ph-card checkout-section">
          <h3 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <div class="payment-title-row">
                  <span class="payment-title">QRIS / Instant Payment</span>
                  <span class="ph-badge ph-badge--accent">Otomatis</span>
                </div>
                <span class="payment-desc">GoPay, OVO, ShopeePay, BCA, Mandiri QRIS</span>
              </div>
            </label>

            <!-- Pay at Cashier -->
            <label :class="['payment-method-card', { 'payment-method-card--selected': selectedPaymentMethod === 'PAY_AT_CASHIER' }]">
              <input type="radio" v-model="selectedPaymentMethod" value="PAY_AT_CASHIER" class="radio-input" />
              <div class="payment-method-info">
                <div class="payment-title-row">
                  <span class="payment-title">Bayar di Kasir (Cash / Tunai)</span>
                  <span class="ph-badge">Kasir</span>
                </div>
                <span class="payment-desc">Tunjukkan nomor pesanan ke kasir untuk bayar</span>
              </div>
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
        <div class="submit-price-box">
          <span class="submit-total-label">Total Pembayaran</span>
          <div class="submit-total-price ph-price">{{ formatRupiah(total) }}</div>
        </div>

        <button
          class="ph-btn ph-btn--primary ph-btn--lg submit-btn"
          :disabled="isSubmitting"
          @click="submitOrder"
        >
          <svg v-if="isSubmitting" class="spinner-icon animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
          </svg>
          <span v-if="isSubmitting">Memproses...</span>
          <span v-else>Buat Pesanan Sekarang</span>
          <svg v-if="!isSubmitting" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
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
  width: 38px;
  height: 38px;
  border-radius: var(--ph-radius-md);
  border: 1px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  color: var(--ph-text);
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.back-btn:hover {
  background: var(--ph-bg-muted);
  border-color: var(--ph-primary);
}

.checkout-header__title-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.checkout-title {
  font-family: var(--ph-font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ph-text);
  line-height: 1.2;
}

.checkout-subtitle {
  font-size: 0.75rem;
  color: var(--ph-text-muted);
}

.header-type-badge {
  font-size: 0.75rem;
}

.checkout-content {
  padding-top: var(--ph-space-lg);
  padding-bottom: 130px;
}

.checkout-empty {
  text-align: center;
  padding: var(--ph-space-2xl) var(--ph-space-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ph-space-md);
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
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
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-lg);
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
  padding: var(--ph-space-lg);
  background: var(--ph-bg-card);
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.section-title {
  font-family: var(--ph-font-display);
  font-size: 1rem;
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
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--ph-accent);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--ph-transition-fast);
}

.edit-cart-link:hover {
  text-decoration: underline;
  color: var(--ph-accent-hover);
}

.form-group-stack {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-weight: normal;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--ph-text-muted);
  pointer-events: none;
}

.input-field {
  padding-left: 42px;
}

.form-error-msg {
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 500;
  margin-top: 2px;
}

.checkout-items-list {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
  padding-top: var(--ph-space-xs);
  border-top: 1px solid var(--ph-border);
}

.checkout-item-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 0;
}

.checkout-item-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 0.9375rem;
  color: var(--ph-text);
  font-weight: 500;
}

.item-qty {
  color: var(--ph-accent);
  margin-right: 4px;
}

.item-variant, .item-notes {
  font-size: 0.78125rem;
  color: var(--ph-text-muted);
}

.item-modifiers {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.mod-pill {
  font-size: 0.6875rem;
  background: var(--ph-bg-elevated);
  border: 1px solid var(--ph-border);
  padding: 2px 8px;
  border-radius: var(--ph-radius-sm);
  color: var(--ph-text-secondary);
}

.item-price {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ph-accent);
}

.checkout-breakdown {
  padding-top: var(--ph-space-md);
  border-top: 1px dashed var(--ph-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--ph-text-secondary);
}

.breakdown-row--total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ph-text);
  padding-top: 4px;
}

.breakdown-total-price {
  color: var(--ph-accent);
}

.payment-methods-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--ph-space-md);
  border-radius: var(--ph-radius-md);
  border: 1.5px solid var(--ph-border);
  background: var(--ph-bg-elevated);
  cursor: pointer;
  transition: all var(--ph-transition-fast);
}

.payment-method-card:hover {
  border-color: var(--ph-primary);
}

.payment-method-card--selected {
  border-color: var(--ph-accent);
  background: var(--ph-bg-card);
  box-shadow: 0 0 0 1px var(--ph-accent);
}

.radio-input {
  accent-color: var(--ph-accent);
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.payment-method-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.payment-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  max-width: 600px;
  margin: 0 auto;
}

.submit-price-box {
  display: flex;
  flex-direction: column;
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
  max-width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

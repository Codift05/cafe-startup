<script setup lang="ts">
/**
 * Landing Page — Choose Dine In or Pickup.
 * If customer arrives via QR, they go to /t/[tableNumber] instead.
 */

import { OrderType } from '~/types/order'

useHead({ title: 'Philanthroffee — Pesan Sekarang' })

const { setOrderContext } = useCart()
const router = useRouter()

function selectPickup() {
  setOrderContext(OrderType.PICKUP)
  router.push('/menu')
}
</script>

<template>
  <div class="landing-page">
    <!-- Background gradient -->
    <div class="landing-page__bg" />

    <div class="ph-container landing-page__content">
      <!-- Brand -->
      <div class="landing-page__brand ph-animate-in">
        <div class="landing-page__logo">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="landing-page__logo-svg">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </div>
        <h1 class="landing-page__title">Philanthroffee</h1>
        <p class="landing-page__tagline">Pesan kopi favoritmu dengan mudah</p>
      </div>

      <!-- Options -->
      <div class="landing-page__options ph-animate-slide">
        <!-- Dine In -->
        <div class="landing-page__option-card ph-card">
          <div class="landing-page__option-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
              <path d="M3 11v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" />
              <line x1="6" y1="18" x2="6" y2="21" />
              <line x1="18" y1="18" x2="18" y2="21" />
            </svg>
          </div>
          <h2 class="landing-page__option-title">Dine In</h2>
          <p class="landing-page__option-desc">
            Scan QR code di mejamu untuk langsung memesan
          </p>
          <div class="landing-page__qr-hint">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="3" height="3" />
              <line x1="21" y1="14" x2="21" y2="21" />
              <line x1="14" y1="21" x2="21" y2="21" />
            </svg>
            <span>Scan QR di mejamu</span>
          </div>
        </div>

        <!-- Pickup -->
        <button
          id="btn-pickup"
          class="landing-page__option-card landing-page__option-card--action ph-card ph-card--interactive"
          @click="selectPickup"
        >
          <div class="landing-page__option-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 11v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8" />
              <path d="M6 7h12l-1 4H7L6 7z" />
              <line x1="12" y1="2" x2="12" y2="7" />
            </svg>
          </div>
          <h2 class="landing-page__option-title">Pickup</h2>
          <p class="landing-page__option-desc">
            Pesan dulu, ambil saat siap
          </p>
          <div class="landing-page__action-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </button>
      </div>

      <!-- Footer -->
      <p class="landing-page__footer ph-caption">
        Tidak perlu login atau buat akun
      </p>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.landing-page__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(226, 114, 91, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 100%, rgba(201, 169, 110, 0.06) 0%, transparent 60%),
    var(--ph-bg);
  z-index: -1;
}

.landing-page__content {
  text-align: center;
  padding: var(--ph-space-2xl) var(--ph-space-md);
}

.landing-page__brand {
  margin-bottom: var(--ph-space-2xl);
}

.landing-page__logo {
  font-size: 3.5rem;
  margin-bottom: var(--ph-space-md);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.landing-page__title {
  font-family: var(--ph-font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--ph-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--ph-space-sm);
}

.landing-page__tagline {
  color: var(--ph-text-secondary);
  font-size: 0.9375rem;
}

.landing-page__options {
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-md);
  max-width: 360px;
  margin: 0 auto;
}

.landing-page__option-card {
  position: relative;
  padding: var(--ph-space-lg);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: var(--ph-space-sm);
  border: none;
  background: var(--ph-bg-card);
  width: 100%;
  font-family: inherit;
  cursor: default;
}

.landing-page__option-card--action {
  cursor: pointer;
  border: 2px solid var(--ph-accent);
}

.landing-page__option-card--action:hover {
  border-color: var(--ph-accent-hover);
  background: var(--ph-accent-light);
}

.landing-page__option-icon {
  font-size: 2rem;
}

.landing-page__option-title {
  font-family: var(--ph-font-display);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ph-text);
}

.landing-page__option-desc {
  font-size: 0.875rem;
  color: var(--ph-text-secondary);
  line-height: 1.5;
}

.landing-page__qr-hint {
  display: flex;
  align-items: center;
  gap: var(--ph-space-sm);
  margin-top: var(--ph-space-sm);
  padding: 10px 14px;
  background: var(--ph-bg-muted);
  border-radius: var(--ph-radius-sm);
  color: var(--ph-text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
}

.landing-page__action-arrow {
  position: absolute;
  right: var(--ph-space-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--ph-accent);
  transition: transform var(--ph-transition-fast);
}

.landing-page__option-card--action:hover .landing-page__action-arrow {
  transform: translateY(-50%) translateX(4px);
}

.landing-page__footer {
  margin-top: var(--ph-space-2xl);
  text-align: center;
}
</style>

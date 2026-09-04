<template>
  <div class="ph-page" style="background: var(--ph-bg); min-height: 100dvh; display: flex; flex-direction: column;">
    <!-- Top Header Bar -->
    <header style="background: #ffffff; border-bottom: 1px solid var(--ph-border); padding: 12px 24px; position: sticky; top: 0; z-index: 30; box-shadow: var(--ph-shadow-sm);">
      <div style="max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        
        <!-- Brand -->
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--ph-radius-md); background: var(--ph-primary); color: #ffffff; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
          </div>
          <div>
            <h1 style="font-family: var(--ph-font-display); font-size: 1.125rem; font-weight: 700; color: var(--ph-text); line-height: 1.2;">Philanthroffee</h1>
            <p style="font-size: 0.75rem; color: var(--ph-text-secondary);">Admin Control Center · Senopati</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav style="display: flex; align-items: center; gap: 8px;">
          <NuxtLink to="/menu" class="admin-tab-btn" style="text-decoration: none;">Menu Pelanggan</NuxtLink>
          <NuxtLink to="/staff/kds" class="admin-tab-btn" style="text-decoration: none;">Antrean Barista (KDS)</NuxtLink>
          <NuxtLink to="/admin" class="admin-tab-btn admin-tab-btn--active" style="text-decoration: none;">Admin Control</NuxtLink>
        </nav>

        <!-- KDS Action -->
        <NuxtLink to="/staff/kds" class="ph-btn ph-btn--primary ph-btn--sm" style="text-decoration: none;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
          <span>Buka Barista KDS</span>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content Grid -->
    <main style="max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; padding: 32px 24px; display: flex; flex-direction: column; gap: 28px;">
      
      <!-- Banner Title -->
      <div>
        <span class="ph-label" style="color: var(--ph-accent);">MANAJEMEN OPERASIONAL KEDAI</span>
        <h2 class="ph-heading-xl" style="color: var(--ph-text); font-family: var(--ph-font-display); margin-top: 2px;">Dashboard Kontrol Admin</h2>
        <p style="font-size: 0.875rem; color: var(--ph-text-secondary); margin-top: 4px;">Kelola pesanan, katalog menu, ketersediaan meja, pembayaran, dan pengaturan operasional cafe.</p>
      </div>

      <!-- Grid Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        
        <!-- Card 1: Admin Menu -->
        <NuxtLink to="/admin/menu" class="admin-card ph-animate-in" style="text-decoration: none;">
          <div class="admin-icon-box" style="background: rgba(39, 61, 46, 0.08); color: var(--ph-primary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Menu &amp; Stok Products</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 4px; line-height: 1.4;">Atur daftar produk, harga racikan, varian, dan status Sold Out.</p>
          </div>
        </NuxtLink>

        <!-- Card 2: Orders -->
        <NuxtLink to="/admin/orders" class="admin-card ph-animate-in" style="text-decoration: none;">
          <div class="admin-icon-box" style="background: rgba(196, 123, 73, 0.1); color: var(--ph-accent);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Order Management</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 4px; line-height: 1.4;">Pantau riwayat seluruh status pesanan customer &amp; histori transaksi.</p>
          </div>
        </NuxtLink>

        <!-- Card 3: Payments -->
        <NuxtLink to="/admin/payments" class="admin-card ph-animate-in" style="text-decoration: none;">
          <div class="admin-icon-box" style="background: rgba(46, 125, 50, 0.1); color: var(--ph-success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Pembayaran &amp; Kasir</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 4px; line-height: 1.4;">Konfirmasi tunai kasir &amp; rekonsiliasi pembayaran digital Midtrans.</p>
          </div>
        </NuxtLink>

        <!-- Card 4: Tables & QR -->
        <NuxtLink to="/admin/tables" class="admin-card ph-animate-in" style="text-decoration: none;">
          <div class="admin-icon-box" style="background: rgba(2, 136, 209, 0.1); color: #0288d1;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Meja &amp; QR Table</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 4px; line-height: 1.4;">Kelola nomor meja, generate kode unik QR meja, dan cetak sticker.</p>
          </div>
        </NuxtLink>

        <!-- Card 5: Operational Settings -->
        <NuxtLink to="/admin/settings" class="admin-card ph-animate-in" style="text-decoration: none;">
          <div class="admin-icon-box" style="background: rgba(123, 31, 162, 0.1); color: #7b1fa2;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: var(--ph-text); font-family: var(--ph-font-display);">Pengaturan Operasional</h3>
            <p style="font-size: 0.8125rem; color: var(--ph-text-secondary); margin-top: 4px; line-height: 1.4;">Pause pesanan sementara, jam operasional, dan mode dine-in/pickup.</p>
          </div>
        </NuxtLink>

      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-tab-btn {
  padding: 6px 14px;
  border-radius: var(--ph-radius-full);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--ph-text-secondary);
  border: 1px solid transparent;
  transition: all var(--ph-transition-fast);
}
.admin-tab-btn:hover {
  background: var(--ph-bg-elevated);
  color: var(--ph-text);
}
.admin-tab-btn--active {
  background: var(--ph-primary);
  color: #ffffff !important;
  font-weight: 600;
}
.admin-card {
  background: #ffffff;
  border: 1px solid var(--ph-border);
  border-radius: var(--ph-radius-xl);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--ph-shadow-sm);
  transition: all var(--ph-transition-normal);
}
.admin-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ph-shadow-md);
  border-color: var(--ph-primary);
}
.admin-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--ph-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

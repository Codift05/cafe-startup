# 🚀 Philanthroffee Production Deployment Guide

Dokumen ini berisi panduan rilis dan konfigurasi lingkungan produksi (*Production Environment*) untuk sistem pemesanan **Philanthroffee**.

---

## 📋 Pre-Deployment Checklist

Sebelum melakukan rotasi kunci ke lingkungan produksi, pastikan seluruh tes dan pemeriksaan build berikut telah berhasil di-run:

```bash
# 1. Typecheck strict TypeScript
npm run typecheck

# 2. Baseline unit tests
npm run test

# 3. Production bundle build
npm run build
```

---

## 🔑 1. Environment Variables (`.env`)

Konfigurasikan variabel lingkungan berikut di dashboard platform hosting Anda (**Vercel / Railway / VPS Environment**):

```env
# ============================================================
# SUPABASE CONFIGURATION
# ============================================================
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# MIDTRANS PAYMENT GATEWAY
# ============================================================
# Gunakan Kunci Produksi untuk Live Transaction (atau SB-xxx untuk Sandbox)
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SNAP_URL=https://app.midtrans.com/snap/snap.js

# ============================================================
# APPLICATION CONFIGURATION
# ============================================================
APP_URL=https://philanthroffee.com
```

> ⚠️ **IMPORTANT**: Jangan pernah menyebarkan `SUPABASE_SERVICE_KEY` atau `MIDTRANS_SERVER_KEY` ke bundle client-side. Keduanya hanya diakses oleh server Nuxt 4 (`server/`).

---

## 🗄️ 2. Supabase Production Database Setup

1. **Eksekusi Schema SQL**:
   - Buka **Supabase Dashboard $\rightarrow$ SQL Editor**.
   - Jalankan seluruh isi `DATABASE-SCHEMA.md` atau `schema.sql` untuk membuat tabel, fungsi atomic (`next_order_number`), trigger validasi state transition, dan RLS policies.

2. **Aktifkan Supabase Realtime**:
   - Navigasi ke **Database $\rightarrow$ Publications**.
   - Pastikan tabel `orders` dan `products` diaktifkan untuk fitur Realtime subscription KDS Barista & Live Sold-Out Status.

3. **Konfigurasi Auth Staff**:
   - Buat akun staff di **Authentication $\rightarrow$ Users**.
   - Tambahkan record role di tabel `users` (contoh role: `BARISTA`, `ADMIN`, `OWNER`).

---

## 💳 3. Konfigurasi Midtrans Webhook URL

1. Buka **Midtrans MAP Dashboard** (`https://dashboard.midtrans.com` atau Sandbox `https://dashboard.sandbox.midtrans.com`).
2. Masuk ke **Settings $\rightarrow$ Configuration**.
3. Set **Payment Notification URL** ke:
   ```text
   https://philanthroffee.com/api/payments/midtrans/webhook
   ```
4. Set **Finish Redirect URL** ke:
   ```text
   https://philanthroffee.com/order/{order_id}
   ```
5. Simpan perubahan.

---

## 🌐 4. Opsi Deployment Hosting

### Option A: Deployment di Vercel (Rekomendasi)
1. Import repositori GitHub `Codift05/cafe-startup` ke Vercel.
2. Framework Preset: **Nuxt.js**.
3. Masukkan seluruh **Environment Variables** dari Bagian 1.
4. Klik **Deploy**.

### Option B: Deployment di VPS (Node.js / PM2)
1. Clone repositori & install dependensi:
   ```bash
   git clone https://github.com/Codift05/cafe-startup.git
   cd cafe-startup
   npm install
   ```
2. Build aplikasi:
   ```bash
   NUXT_TELEMETRY_DISABLED=1 npm run build
   ```
3. Jalankan server Nitro dengan PM2:
   ```bash
   pm2 start .output/server/index.mjs --name "philanthroffee-app"
   ```

---

## 🧪 5. Verifikasi Post-Deployment (Smoke Test)

Setelah deployment berhasil:
1. Access URL domain aplikasi (`https://philanthroffee.com`).
2. Uji alur QR Meja: kunjungi `/t/04?token=VALID_TOKEN`.
3. Uji alur Checkout & simulasi pembayaran.
4. Login ke portal staff (`/staff/login`) dan pastikan status pesanan masuk di KDS (`/staff/kds`).

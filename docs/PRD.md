# Product Requirements Document

## Philanthroffee Ordering System

> Master source of truth for the Philanthroffee project.
> See `TECH-SPEC.md` for the engineering technical specification.

### 1. Product Overview

Philanthroffee Ordering System adalah sistem pemesanan cafe berbasis web yang dirancang untuk mempercepat proses pemesanan pelanggan secara langsung, sederhana, dan minim distraksi.

Sistem ini mengadopsi prinsip:

```text
SCAN / OPEN
→ ORDER
→ PAY
→ TRACK
→ DONE
```

Fokus utama bukan membuat aplikasi lifestyle atau loyalty platform, tetapi membangun sistem pemesanan yang cepat, praktis, dan dapat digunakan langsung di operasional cafe.

Sistem mendukung dua metode pemesanan utama:

* Dine In melalui QR unik per meja
* Pickup melalui web ordering

Customer tidak diwajibkan membuat akun.

---

## 2. Product Goals

1. Mengurangi antrean pemesanan di kasir.
2. Mempercepat proses order pelanggan.
3. Mengurangi kesalahan komunikasi antara customer dan barista.
4. Memungkinkan customer melakukan customization minuman secara terstruktur.
5. Menghubungkan pesanan customer langsung ke barista.
6. Menyediakan status order secara realtime.
7. Mendukung pembayaran digital yang aman.
8. Memastikan status pembayaran dapat dipulihkan jika terjadi error.
9. Mempermudah admin mengelola menu dan availability.
10. Menyediakan sistem QR table yang praktis dan scalable.

---

## 3. Product Principles

### 3.1 Direct Ordering

Customer tidak perlu melewati onboarding atau landing page panjang.

Jika scan QR meja: `Scan QR → Menu`

Jika buka website langsung: `Open Website → Choose Dine In / Pickup → Menu`

### 3.2 Minimal Interaction

Sistem meminimalkan: typing, login, navigasi, pop-up, langkah yang tidak diperlukan.

### 3.3 Payment Safety

Payment merupakan critical system. Sistem harus:
- menyimpan order sebelum payment
- menggunakan payment provider sebagai source of truth
- mendukung webhook
- mendukung reconciliation
- mencegah duplicate order
- mencegah duplicate payment processing

### 3.4 Operational Simplicity

Barista dan admin harus dapat menggunakan sistem tanpa pengetahuan teknis.

---

## 4. Target Users

### 4.1 Customer
- melihat menu, memilih menu, customize minuman
- melakukan dine-in / pickup order
- checkout, pembayaran, memantau status order
- Tidak wajib login

### 4.2 Barista (KDS)
- melihat order baru, membaca customization & catatan
- memulai order, menandai order siap, menyelesaikan order

### 4.3 Cashier
- melihat semua order & payment
- menerima pembayaran tunai
- membantu customer jika terjadi masalah transaksi

### 4.4 Admin
- mengelola menu, kategori, harga, availability
- mengelola table QR
- melihat seluruh order & transaksi
- payment reconciliation
- operational settings

### 4.5 Owner
- Full access: seluruh admin feature + payment monitoring + branch settings

---

## 5-87. Full Specification

> Dokumen lengkap tersedia di file PRD asli.
> Referensi engineering detail ada di `TECH-SPEC.md`.

---

### MVP Scope

**Customer:** QR table, pickup, menu, customization, cart, checkout, QRIS, payment status, realtime order status

**Barista:** new queue, preparing, ready, complete, order detail, notes

**Admin:** menu CRUD, sold out, categories, order history, payment history, reconciliation, table QR, operational settings

### Out of Scope MVP
- loyalty, points, rewards, membership
- delivery, table reservation
- inventory forecasting, AI recommendation
- advanced analytics, multi-branch UI
- native Android/iOS app

### Technology Stack
- **Frontend:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS, Nuxt UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Payment:** Midtrans
- **Deployment:** Vercel + Supabase + Midtrans

# 🧪 Philanthroffee End-to-End (E2E) Testing Runbook

Dokumen ini berisi panduan pengujian alur pemesanan *End-to-End (E2E)* untuk memvalidasi kesiapan produksi sistem pemesanan **Philanthroffee**.

---

## 🎯 Skenario 1: Alur Pemesanan Dine-In via QR Meja

### Langkah Pengujian:
1. **Verifikasi QR Meja**:
   - Buka URL: `http://localhost:3000/t/04?token=VALID_TOKEN`
   - **Ekspektasi**: Terjadi verifikasi token meja via `POST /api/tables/verify`. Pengguna melihat badge *Dine In · Meja 04* dan diarahkan otomatis ke halaman `/menu`.
2. **Pilih Menu & Detail Customization**:
   - Klik produk signature, misal: *Philanthroffee Gula Aren*.
   - Pilih Ukuran: *Large*, Opsi Susu: *Oat Milk*, Catatan: *"Sedikit es"*.
   - Klik **+ Tambah ke Keranjang**.
3. **Checkout**:
   - Buka keranjang `/cart` atau klik **Lihat Keranjang** di *floating cart bar*.
   - Klik **Checkout**.
   - Masukkan Nama Pelanggan: `Budi`, Nomor HP: `08123456789`.
   - Pilih Metode Pembayaran: **QRIS / E-Wallet (Midtrans)**.
   - Klik **Bayar Sekarang**.
4. **Simulasi Midtrans Snap**:
   - Popup Midtrans Snap terbuka.
   - Gunakan Simulator Sandbox Midtrans untuk menyelesaikan pembayaran QRIS.
5. **KDS Barista Update Status**:
   - Login ke portal staff di `/staff/login` dengan akun Barista.
   - Buka Kanban KDS `/staff/kds`.
   - Pesanan `PH0001` (Budi - Meja 04) muncul di kolom **BARU**.
   - Klik **Mulai Buat** $\rightarrow$ Pesanan pindah ke **DIBUAT**.
   - Klik **Tandai Siap** $\rightarrow$ Pesanan pindah ke **SIAP**.
   - Klik **Selesaikan** $\rightarrow$ Pesanan berpindah ke status **COMPLETED**.
6. **Live Customer Order Tracking**:
   - Di tab pelanggan `/order/PH0001`, timeline status ter-update secara realtime menjadi **SIAP DIAMBIL / DIANTAR**.

---

## 🛍️ Skenario 2: Alur Pemesanan Pickup (Bayar di Kasir)

### Langkah Pengujian:
1. Buka landing page `/` $\rightarrow$ Pilih **Pickup**.
2. Pilih menu pastry (misal: *Artisan Croissant*).
3. Di halaman `/checkout`, pilih metode pembayaran **Bayar di Kasir**.
4. Submit pesanan. Pelanggan menerima nomor pesanan `PH0002` dan instruksi ke kasir.
5. Kasir membuka `/admin/payments` atau `/staff/kds`, mengonfirmasi pembayaran tunai.
6. Status pesanan otomatis berubah dari `WAITING_PAYMENT` menjadi `PAID` $\rightarrow$ Masuk antrean KDS.

---

## 🔒 Skenario 3: Pengujian Keamanan & Edge Cases

| Skenario Uji | Tindakan | Ekspektasi | Status |
| --- | --- | --- | --- |
| **Rate Limiter API** | Lakukan >10 request `POST /api/orders` dalam 1 menit dari IP yang sama | Server mengembalikan HTTP `429 Too Many Requests` dengan header `Retry-After` | ✅ Pass |
| **Invalid QR Token** | Akses `/t/04?token=TOKEN_PALSU` | Menampilkan pesan error QR tidak valid / kedaluwarsa, akses menu diblokir | ✅ Pass |
| **Midtrans Webhook Invalid Signature** | Kirim POST request buatan ke `/api/payments/midtrans/webhook` tanpa signature resmi | Webhook menolak request dengan HTTP `400 / 403` tanpa mengubah status order | ✅ Pass |
| **Duplicate Order Submit** | Klik tombol *Bayar* berkali-kali secara simultan | Tombol ter-disable, header `x-idempotency-key` mencegah pembuatan order ganda | ✅ Pass |

---

## ⚡ 4. Perintah Eksekusi Verification Test Automated Suite

Jalankan skrip tes dan pemeriksaan tipe otomatis kapan saja dengan perintah:

```bash
# Typecheck TypeScript
npm run typecheck

# Baseline Test Suite Execution
npm run test

# Production Build Bundle Verification
NUXT_TELEMETRY_DISABLED=1 npm run build
```

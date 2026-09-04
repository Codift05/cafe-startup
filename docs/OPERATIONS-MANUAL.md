# 📖 Philanthroffee Operations & Maintenance Manual

Dokumen ini merupakan panduan operasional harian dan pemeliharaan sistem (*Operations & Maintenance*) untuk tim manajer outlet, kasir, barista, dan administrator sistem **Philanthroffee**.

---

## 🌅 1. Prosedur Pembukaan Toko (Opening Checklist)

Sebelum toko mulai menerima pesanan setiap harinya:

1. **Login Portal Staff**:
   - Barista/Kasir login melalui `/staff/login`.
   - Buka tampilan **Barista KDS** di `/staff/kds` pada perangkat tablet/layar dapur.
2. **Cek Ketersediaan Stok Menu (Admin)**:
   - Akses Dashboard Admin di `/admin/menu`.
   - Pastikan menu yang kehabisan bahan ditandai sebagai **Sold Out** (toggle otomatis memblokir pemesanan di sisi pelanggan secara realtime).
3. **Verifikasi QR Meja**:
   - Pastikan QR Code di meja 01–20 dapat dipindai dengan baik dan mengarah ke URL `/t/[nomor_meja]?token=...`.

---

## ☕ 2. Alur Operasional Harian Barista & KDS

- **Status BARU (Terbayar/PAID)**:
  - Pesanan baru yang telah berhasil dibayar (QRIS/E-Wallet) atau dikonfirmasi kasir akan masuk otomatis di kolom **BARU** di `/staff/kds` dengan bunyi notifikasi audio.
- **Status DIBUAT (PREPARING)**:
  - Barista menekan tombol **Mulai Buat**. Pesanan berpindah ke kolom **DIBUAT** dan timer waktu pembuatan mulai berjalan.
- **Status SIAP (READY)**:
  - Setelah minuman/makanan selesai dibuat, tekan **Tandai Siap**. Pelanggan menerima notifikasi realtime pada layar tracking (`/order/[order_number]`).
- **Status SELESAI (COMPLETED)**:
  - Tekan **Selesaikan** setelah pesanan diserahkan kepada pelanggan atau diantar ke meja.

---

## 💵 3. Rekonsiliasi Pembayaran Tunai & Midtrans (Closing Checklist)

Di akhir jam operasional:

1. **Rekonsiliasi Kasir**:
   - Akses `/admin/payments`.
   - Bandingkan total transaksi *Pay at Cashier* yang berstatus `PAID` dengan jumlah uang fisik di kasir.
2. **Auto-Reconciliation Midtrans**:
   - Sistem secara otomatis menjalankan pemulihan transaksi gantung (*Pending Recovery Task*) setiap 5 menit untuk menyinkronkan status Midtrans dengan Supabase.
   - Jika ada ketidaksesuaian status, manajer dapat menekan tombol **Trigger Reconcile** di dashboard admin.

---

## 🛠️ 4. Maintenance & Trouble Shooting Protocol

### A. Restart Server Aplikasi (VPS / Node.js Environment)
Jika aplikasi memerlukan pembaruan atau restart layanan:
```bash
# Cek status proses PM2
pm2 status

# Restart layanan Philanthroffee
pm2 restart philanthroffee-app

# Cek log aplikasi
pm2 logs philanthroffee-app --lines 50
```

### B. Pemulihan Koneksi Database (Supabase)
- Jika terjadi gangguan koneksi database, pastikan *Connection Pooler* Supabase aktif.
- Aplikasi dilengkapi dengan *automatic refresh fallback* sehingga antrean KDS tetap memperbarui data meskipun koneksi Realtime WebSocket terputus sejenak.

---

## 📞 5. Kontak Eskalasi & Support

| Peran | Tanggung Jawab | kontak |
| --- | --- | --- |
| **Store Manager** | Operasional outlet, stok menu, & pembatalan transaksi | manager@philanthroffee.com |
| **System Admin / Tech Lead** | Server maintenance, Supabase, & Midtrans gateway | tech@philanthroffee.com |

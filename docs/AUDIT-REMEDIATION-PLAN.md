# Audit & Remediation Plan

Dokumen ini adalah sumber status teknis aktual Philanthroffee. PRD menjelaskan kebutuhan produk, `TECH-SPEC.md` menjelaskan desain tujuan, sedangkan dokumen ini mencatat apa yang sudah terbukti berjalan dan apa yang masih harus diperbaiki.

## Status Saat Ini

**Kesimpulan:** aplikasi sudah dapat di-build dan alur UI utama tersedia, tetapi masih berstatus **prototype terintegrasi**, belum production-ready.

Yang sudah terverifikasi:

- Production build berhasil dengan `bun run build`.
- Tidak ditemukan import cycle pada graph repository.
- Struktur database, tipe dasar, cart, customer pages, KDS pages, dan sebagian API tersedia.

Yang belum terverifikasi:

- End-to-end flow dengan Supabase serta Midtrans sandbox.
- Keamanan endpoint staff/admin, rate limiting, dan isolasi branch.
- Konsistensi transaksi order/payment ketika terjadi kegagalan parsial.

## Definisi Status

| Status | Arti |
| --- | --- |
| `TODO` | Belum dikerjakan |
| `IN PROGRESS` | Sedang dikerjakan, belum memenuhi acceptance criteria |
| `BLOCKED` | Memerlukan keputusan, kredensial, atau layanan eksternal |
| `VERIFIED` | Implementasi dan pemeriksaan otomatis/manual sudah lulus |

Sebuah fitur tidak boleh disebut selesai hanya karena halaman atau endpoint-nya sudah ada.

## Prioritas Audit dan Perbaikan

### P0 — Keamanan dan integritas data

- [x] Lindungi endpoint KDS `/api/staff/orders/**` dengan autentikasi, RBAC, dan isolasi branch. Endpoint admin ditambahkan bersama implementasi API admin.
- [x] Kirim access token Supabase dari KDS ke API staff. Integrasi admin mengikuti implementasi API admin.
- [x] Tolak webhook Midtrans ketika server key atau signature tidak tersedia/valid.
- [x] Cocokkan payload pemanggil dengan kontrak `createSnapTransaction` dan hapus fallback mock dari production.
- [x] Jadikan pembuatan order, item, modifier, history, dan idempotency record satu transaksi database.
- [x] Validasi bahwa variant milik product dan modifier memang terhubung dengan product.
- [x] Validasi table aktif dan berada pada branch yang sama sebelum membuat order dine-in.
- [x] Cegah race condition pada pembuatan payment dan pemrosesan webhook berulang.

Acceptance criteria P0:

- Request staff tanpa bearer token mendapat `401`; role yang salah mendapat `403`.
- Webhook invalid/tanpa signature tidak mengubah payment maupun order.
- Kegagalan satu insert membatalkan seluruh pembuatan order.
- Tidak mungkin memakai variant/modifier dari produk lain.
- Satu order tidak menghasilkan pembayaran aktif ganda.

### P1 — Alur bisnis utama

- [ ] Perbaiki `useAuth` agar memakai `supabaseAnonKey` yang benar dan mempertahankan session.
- [ ] Pastikan idempotency order aman untuk request bersamaan dan mempunyai expiry.
- [ ] Terapkan state transition yang sama pada aplikasi dan constraint database.
- [ ] Implementasikan konfirmasi pembayaran kasir sesuai API contract.
- [ ] Tangani status Midtrans `capture` berdasarkan `fraud_status`.
- [ ] Implementasikan recovery/reconciliation untuk payment yang tertahan.
- [ ] Pisahkan mock data sebagai mode development eksplisit; error database production harus terlihat sebagai error.
- [x] Validasi batas panjang nama, telepon, catatan, jumlah item, quantity, dan aturan modifier di server.

Acceptance criteria P1:

- Flow QRIS sandbox, e-wallet sandbox, dan bayar di kasir dapat diselesaikan sampai `COMPLETED`.
- Retry order/payment tidak membuat record duplikat.
- Refresh atau koneksi terputus tidak membuat pelanggan membayar ulang.
- Status order dan payment selalu konsisten setelah webhook/reconciliation.

### P2 — Kelengkapan fitur dan operasional

- [ ] Implementasikan API admin untuk menu, kategori, order, payment, meja, dan settings.
- [ ] Hubungkan halaman admin ke API; hilangkan state statis/demo.
- [ ] Implementasikan pause ordering, operating hours, dan enable/disable dine-in/pickup.
- [ ] Implementasikan audit log untuk perubahan penting.
- [ ] Pilih Supabase Realtime atau pertahankan polling sebagai keputusan eksplisit.
- [ ] Tambahkan rate limiting pada endpoint sensitif dan publik berbiaya tinggi.
- [ ] Terapkan filtering `branch_id` pada seluruh query staff/admin.

Acceptance criteria P2:

- Perubahan admin tersimpan dan terlihat pada customer/KDS.
- Staff hanya melihat dan mengubah data branch miliknya.
- Gangguan Realtime tetap ditangani oleh fallback refresh yang terukur.

### P3 — Kualitas, UX, dan deployment

- [x] Tambahkan type checker dan script `typecheck`.
- [ ] Tambahkan pemeriksaan minimum untuk price calculation, state transition, auth/RBAC, idempotency, dan webhook.
- [ ] Uji loading, empty, offline, expired QR, sold-out, duplicate submit, dan payment failure states.
- [ ] Audit aksesibilitas keyboard, label form, focus state, contrast, dan reduced motion.
- [ ] Audit environment production: secrets, URL callback, CORS, logging, backup, dan monitoring.
- [ ] Ukur target performa yang tercantum di TECH-SPEC.

Acceptance criteria P3:

- `build`, `typecheck`, dan test minimum lulus di CI.
- Tidak ada secret server yang masuk client bundle atau repository.
- Smoke test production mencakup customer, payment, KDS, dan admin.

## Matriks Area Audit

| Area | Yang diperiksa | Bukti kelulusan |
| --- | --- | --- |
| Dokumentasi | PRD, API, schema, dan implementasi konsisten | Endpoint inventory dan traceability matrix aktual |
| Security | Auth, RBAC, webhook, secrets, rate limit | Negative tests untuk `401`, `403`, signature invalid |
| Database | FK, constraint, transaction, race condition | Migration bersih dan rollback test |
| Customer flow | QR, menu, cart, checkout, payment, tracking | E2E happy path dan failure path |
| Staff/KDS | Session, queue, transition, branch isolation | Role matrix dan transition tests |
| Admin | CRUD, settings, reconciliation, audit logs | Perubahan tersimpan dan tercatat |
| Reliability | Retry, idempotency, offline, reconciliation | Duplicate/recovery tests |
| Frontend | Responsive, accessibility, error states | Manual checklist dan browser smoke test |
| Operations | Deploy, monitoring, backup, incident recovery | Runbook dan restore drill |

## Urutan Implementasi

1. **Baseline:** pasang type-check dan test minimum agar perubahan berikutnya terukur.
2. **Secure:** selesaikan seluruh P0 tanpa menambah fitur baru.
3. **Complete core flow:** selesaikan P1 dengan Supabase dan Midtrans sandbox nyata.
4. **Operationalize:** hubungkan admin, branch isolation, audit log, dan settings dari P2.
5. **Harden:** selesaikan P3, staging smoke test, lalu production readiness review.

## Definition of Done

Setiap item hanya boleh diberi status `VERIFIED` jika:

1. Implementasi memenuhi acceptance criteria dan API contract aktual.
2. Ada satu pemeriksaan otomatis minimum untuk logika non-trivial.
3. Build dan type-check lulus.
4. Error path diuji; tidak hanya happy path.
5. Dokumentasi terkait diperbarui dalam perubahan yang sama.
6. Perubahan keamanan/payment telah diuji di staging atau sandbox.

## Aturan Sinkronisasi Dokumentasi

- `PRD.md`: kebutuhan dan batas produk.
- `TECH-SPEC.md`: desain teknis tujuan.
- `DATABASE-SCHEMA.md` dan `schema.sql`: harus identik secara semantik; `schema.sql` menjadi file eksekusi.
- `API-CONTRACT.md`: hanya endpoint yang disepakati; tandai yang belum tersedia.
- `TASK-BREAKDOWN.md`: backlog implementasi.
- `CROSSCHECK-PRD-DESIGN.md`: laporan audit historis, bukan bukti production readiness.
- Dokumen ini: status audit dan urutan remediation terkini.

## Perintah Verifikasi Minimum

```bash
bun run build
bun run typecheck
bun run test
```

Script `typecheck` dan `test` sudah tersedia dengan smoke test baseline. Test integrasi bisnis masih mengikuti pekerjaan P0–P3.

# API

## Tujuan

Dokumen ini mendefinisikan rancangan awal API dan kontrak integrasi Vinari tanpa membuat implementasi backend.

## Latar Belakang

Vinari akan menggunakan Supabase sebagai backend. API perlu dirancang agar aman, konsisten, dan dapat berkembang untuk kebutuhan PWA, mobile, billing, AI, dan integrasi masa depan.

## Prinsip API

- Semua API privat harus membutuhkan autentikasi.
- Authorization tidak boleh hanya bergantung pada client.
- Setiap operasi workspace harus memvalidasi membership dan role.
- Error message harus aman dan mudah dipahami.
- API harus konsisten dalam naming, response, dan validasi.

## Resource Awal

- Auth.
- Workspace.
- Account.
- Category.
- Transaction.
- Budget.
- Debt.
- Goal.
- Insight.
- Subscription.

## Pola Operasi

- List.
- Detail.
- Create.
- Update.
- Archive.
- Delete jika diizinkan.
- Export untuk fitur tertentu.

## Aturan Bisnis

- API tidak boleh mengembalikan data workspace yang tidak dimiliki pengguna.
- API transaksi harus memvalidasi amount, date, account, dan type.
- API premium harus memeriksa entitlement.
- API AI harus membatasi data yang dikirim ke model.

## Catatan Teknis

- Implementasi dapat menggunakan Supabase client, RPC, Edge Functions, dan webhook.
- Edge Functions dipertimbangkan untuk billing, AI, export, dan operasi sensitif.
- OpenAPI dapat dibuat jika custom API semakin kompleks.

## Pengembangan Masa Depan

- Membuat API contract detail.
- Membuat error code standard.
- Membuat webhook specification.
- Membuat rate limit policy.
- Membuat API versioning strategy.

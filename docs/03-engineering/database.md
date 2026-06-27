# Database

## Tujuan

Dokumen ini mendefinisikan blueprint awal database Vinari tanpa membuat schema final atau migration.

## Latar Belakang

Vinari akan menyimpan data finansial sensitif. Struktur database harus dirancang dengan prinsip ownership, security, auditability, dan scalability sejak awal.

## Prinsip Database

- Semua data harus memiliki ownership yang jelas.
- Workspace menjadi konteks utama data finansial.
- RLS wajib dipertimbangkan sebelum implementasi.
- Amount harus disimpan dengan presisi aman.
- Data historis tidak boleh rusak karena perubahan kategori atau akun.

## Entitas Awal

- User.
- Workspace.
- Workspace Member.
- Account.
- Category.
- Transaction.
- Budget.
- Budget Item.
- Debt.
- Goal.
- Subscription.
- Entitlement.

## Ruang Lingkup

Dokumen ini hanya blueprint. Tidak ada schema final, SQL, migration, atau tabel Supabase yang dibuat pada tahap ini.

## Aturan Bisnis

- Setiap record finansial harus terkait workspace.
- User hanya boleh mengakses workspace yang dimiliki atau diikuti.
- Role harus menentukan hak akses pada family workspace.
- Transaksi harus dapat ditelusuri ke akun dan kategori.
- Data billing harus dipisahkan dari data transaksi finansial.

## Catatan Teknis

- Database direncanakan menggunakan PostgreSQL melalui Supabase.
- Row Level Security akan menjadi bagian wajib dari desain.
- Perlu strategi soft delete, archive, dan audit log.

## Pengembangan Masa Depan

- Membuat schema draft.
- Membuat migration plan.
- Membuat indexing strategy.
- Membuat RLS policy.
- Membuat backup dan restore strategy.

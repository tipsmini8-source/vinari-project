# Information Architecture

## Tujuan

Dokumen ini mendefinisikan struktur informasi, area navigasi, dan objek utama dalam Vinari.

## Latar Belakang

Vinari akan memiliki banyak domain finansial seperti transaksi, budget, hutang, target, insight, dan family workspace. Information architecture diperlukan agar pengalaman pengguna tetap jelas saat produk bertambah kompleks.

## Area Navigasi Utama

- Dashboard.
- Transaksi.
- Akun.
- Budget.
- Hutang.
- Target.
- Insight.
- Simulasi.
- Family Workspace.
- Settings.

## Objek Informasi Utama

### User

Identitas pengguna yang terautentikasi.

### Workspace

Ruang kerja finansial, dapat berupa personal, family, atau future business.

### Account

Tempat uang atau kewajiban dicatat, seperti cash, bank, e-wallet, kartu kredit, dan hutang.

### Transaction

Aktivitas finansial berupa pemasukan, pengeluaran, atau transfer.

### Budget

Rencana alokasi uang berdasarkan periode dan kategori.

### Debt

Kewajiban finansial yang memiliki saldo, pembayaran, dan strategi pelunasan.

### Goal

Target finansial seperti dana darurat, pendidikan, liburan, atau pembelian besar.

## Prinsip Utama

- Navigasi harus mengikuti cara pengguna berpikir tentang uang.
- Data personal dan keluarga harus terlihat berbeda secara konteks.
- Fitur premium tidak boleh membingungkan pengguna free.
- Insight harus terhubung dengan data sumber.

## Aturan Bisnis

- Pengguna selalu harus tahu workspace aktif yang sedang digunakan.
- Objek yang diarsipkan tidak boleh merusak laporan historis.
- Akses ke family workspace harus mengikuti role.
- Struktur informasi harus mendukung PWA dan mobile-first behavior.

## Catatan Teknis

- Information architecture ini belum mendefinisikan UI final.
- Struktur ini akan memengaruhi routing, layout, permission, dan data query.

## Pengembangan Masa Depan

- Menambahkan sitemap detail.
- Menambahkan role-based navigation.
- Menambahkan struktur empty state.
- Menambahkan global search dan filter strategy.

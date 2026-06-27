# Financial Core Engine

## Status Dokumen

| Atribut       | Keterangan                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Nama Dokumen  | Financial Core Engine Specification                                                                                      |
| Produk        | Vinari Project                                                                                                           |
| Bahasa        | Indonesia                                                                                                                |
| Status        | Draft Foundation                                                                                                         |
| Pemilik       | Product & Engineering Team                                                                                               |
| Pembaca Utama | Software Architect, Backend Developer, Frontend Developer, Data Engineer, AI Engineer, QA, Product Manager, dan AI Agent |
| Fungsi Utama  | Acuan utama seluruh perhitungan dan perubahan kondisi finansial Vinari                                                   |

## Prinsip Penggunaan Dokumen

Dokumen ini menjelaskan aturan utama Financial Core Engine Vinari. Semua modul yang berhubungan dengan data finansial wajib mengikuti aturan dalam dokumen ini, termasuk Transaction Engine, Wallet Engine, Budget Engine, Debt Engine, Goal Engine, Report Engine, Decision Engine, AI Engine, dan Dashboard.

Financial Core Engine bukan UI, bukan database, dan bukan API. Financial Core Engine adalah lapisan aturan bisnis dan perhitungan finansial yang menentukan bagaimana kondisi finansial dihitung, diubah, diaudit, dan disajikan.

# 1. Tujuan Financial Core Engine

Financial Core Engine adalah jantung sistem Vinari. Engine ini bertanggung jawab memastikan seluruh angka finansial yang ditampilkan kepada pengguna berasal dari data yang benar, dapat ditelusuri, dan konsisten di semua modul.

Vinari bukan sekadar aplikasi pencatatan transaksi. Vinari adalah Personal & Family Financial Operating System. Karena itu, Vinari membutuhkan pusat aturan finansial yang menjadi sumber kebenaran untuk:

- Saldo wallet.
- Cashflow bulanan.
- Net worth.
- Budget usage.
- Progress goal.
- Progress debt.
- Financial Health Score.
- Report.
- Dashboard.
- AI Financial Insight.
- Decision simulation.

Tanpa Financial Core Engine, setiap modul berisiko menghitung angka dengan cara berbeda. Hal ini dapat menyebabkan dashboard tidak cocok dengan report, AI membaca data yang salah, budget tidak sinkron dengan transaction, atau debt progress tidak sesuai dengan pembayaran.

Tujuan utama Financial Core Engine:

- Menjadi pusat kebenaran perhitungan finansial.
- Menentukan aturan perubahan financial state.
- Menjamin semua angka dapat diaudit ke sumber data.
- Menjaga konsistensi antara database, API, dashboard, AI, dan report.
- Menjadi fondasi untuk fitur premium dan future financial intelligence.

# 2. Prinsip Utama

## 2.1 Transaction is Source of Truth

Transaction adalah sumber utama seluruh data finansial aktual. Semua perhitungan finansial harus dapat ditelusuri kembali ke transaksi sumber atau financial event yang sah.

Implikasi:

- Wallet balance dihitung dari initial balance dan transaction.
- Budget actual dihitung dari transaction.
- Monthly income dan expense dihitung dari transaction.
- Report membaca transaction.
- AI membaca hasil perhitungan yang berasal dari transaction.

## 2.2 Dashboard Hanya Membaca Data

Dashboard adalah read model. Dashboard tidak boleh menjadi sumber data finansial.

Dashboard boleh:

- Membaca financial summary.
- Membaca snapshot.
- Membaca report.
- Membaca financial score.
- Menampilkan insight.

Dashboard tidak boleh:

- Menyimpan angka sebagai sumber kebenaran.
- Mengubah transaction.
- Mengubah wallet balance secara langsung.
- Mengubah score secara manual.

## 2.3 AI Tidak Boleh Mengubah Transaksi

AI hanya boleh membaca data yang diizinkan dan memberikan rekomendasi, insight, klasifikasi yang menunggu persetujuan, atau penjelasan.

AI tidak boleh:

- Membuat transaction tanpa konfirmasi pengguna.
- Mengubah transaction.
- Menghapus transaction.
- Mengubah wallet balance.
- Mengubah financial score secara manual.
- Mengarang data yang tidak ada.

## 2.4 Financial Score Dihitung, Bukan Diinput Manual

Financial Health Score adalah hasil kalkulasi. Score tidak boleh diinput manual oleh user, admin, AI, atau dashboard.

Financial Score harus memiliki:

- Formula atau model yang terdokumentasi.
- Data sumber yang jelas.
- Versi perhitungan.
- Waktu perhitungan.
- Faktor utama yang memengaruhi skor.

## 2.5 Saldo Wallet Berasal dari Transaction dan Initial Balance

Wallet balance harus berasal dari:

```text
initial_balance + total_income + total_transfer_in + total_adjustment_in
- total_expense - total_transfer_out - total_adjustment_out
```

Saldo wallet tidak boleh diubah langsung tanpa financial event yang dapat diaudit.

## 2.6 Semua Perhitungan Harus Bisa Diaudit

Semua angka yang ditampilkan Vinari harus dapat dijelaskan:

- Angka berasal dari domain apa.
- Menggunakan data periode apa.
- Menggunakan formula apa.
- Dipengaruhi transaksi apa saja.
- Kapan angka dihitung.
- Apakah angka real-time, cached, atau snapshot.

# 3. Domain yang Terlibat

## 3.1 Ringkasan Domain

| Domain                | Hubungan dengan Financial Core Engine                                  |
| --------------------- | ---------------------------------------------------------------------- |
| Workspace             | Boundary utama seluruh data dan perhitungan finansial                  |
| User                  | Aktor yang membuat, mengubah, atau membaca data                        |
| Wallet                | Tempat saldo dihitung dan transaksi terjadi                            |
| Transaction           | Source of truth utama data finansial aktual                            |
| Category              | Klasifikasi transaksi untuk budget, report, dan insight                |
| Budget                | Rencana yang membaca realisasi dari transaction                        |
| Debt                  | Kewajiban finansial yang memengaruhi health dan net worth              |
| Debt Payment          | Pembayaran hutang yang harus terkait transaction                       |
| Goal                  | Target finansial yang progresnya dihitung dari kontribusi atau alokasi |
| Subscription          | Pengatur akses fitur basic dan premium                                 |
| Recurring Transaction | Template atau jadwal transaksi yang dapat menghasilkan transaction     |
| Report                | Ringkasan yang diturunkan dari data finansial                          |
| Financial Score       | Hasil kalkulasi kesehatan finansial                                    |
| Financial Insight     | Penjelasan dari data dan hasil perhitungan                             |
| Decision Engine       | Simulasi keputusan berdasarkan data finansial                          |
| AI Engine             | Membaca data dan memberi rekomendasi atau insight                      |
| Dashboard             | Menampilkan hasil perhitungan dan ringkasan                            |

## 3.2 Hubungan Konseptual

```text
Workspace
  |
  +--> Wallet
  |      |
  |      v
  |   Transaction ----> Category
  |      |
  |      +--> Budget Actual
  |      +--> Debt Payment
  |      +--> Goal Contribution
  |      +--> Report
  |      +--> Financial Score
  |      +--> Financial Insight
  |
  +--> Recurring Transaction
  +--> Debt
  +--> Goal
  +--> Subscription
  +--> Financial Snapshot
  +--> Dashboard
```

# 4. Konsep Financial State

Financial State adalah kondisi finansial terkini sebuah Workspace pada waktu tertentu. Financial State bukan data tunggal yang diinput manual, tetapi hasil perhitungan dari transaction, wallet, debt, budget, goal, dan snapshot.

Financial State menjawab pertanyaan:

- Berapa uang yang tersedia saat ini?
- Berapa total hutang?
- Berapa kekayaan bersih?
- Bagaimana arus kas bulan ini?
- Berapa budget yang masih tersedia?
- Seberapa aman kondisi dana darurat?
- Bagaimana kesehatan finansial secara keseluruhan?

## 4.1 Komponen Financial State

| Komponen                | Definisi                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| Total Cash              | Total saldo wallet yang termasuk cash-equivalent                        |
| Total Wallet Balance    | Total saldo semua wallet aktif dalam workspace                          |
| Total Asset             | Total aset finansial yang dicatat dan dihitung                          |
| Total Debt              | Total kewajiban atau hutang aktif                                       |
| Net Worth               | Total asset dikurangi total debt                                        |
| Monthly Income          | Total pemasukan dalam periode bulan tertentu                            |
| Monthly Expense         | Total pengeluaran dalam periode bulan tertentu                          |
| Monthly Cashflow        | Monthly income dikurangi monthly expense                                |
| Available Budget        | Sisa budget yang masih tersedia pada periode berjalan                   |
| Emergency Fund Coverage | Perkiraan berapa bulan kebutuhan hidup dapat ditutup oleh dana tersedia |
| Financial Health Score  | Skor kesehatan finansial yang dihitung dari beberapa indikator          |

## 4.2 Real-Time vs Snapshot

Financial State dapat dihitung dengan dua pendekatan:

- Real-time calculation: dihitung langsung dari data sumber saat diminta.
- Snapshot calculation: dibaca dari hasil perhitungan yang disimpan untuk histori dan performa.

Real-time calculation cocok untuk data terkini. Snapshot cocok untuk trend, histori, performa dashboard, dan report periodik.

# 5. Rumus Perhitungan

## 5.1 Wallet Balance

```text
Wallet Balance =
Initial Balance
+ Total Income pada Wallet
+ Total Transfer In pada Wallet
+ Total Adjustment In pada Wallet
- Total Expense pada Wallet
- Total Transfer Out pada Wallet
- Total Adjustment Out pada Wallet
```

Catatan:

- Semua komponen harus berada dalam workspace yang sama.
- Perhitungan multi-currency belum masuk V1 dan harus memiliki aturan konversi tersendiri di masa depan.

## 5.2 Total Cash

```text
Total Cash =
Sum(Wallet Balance)
untuk semua wallet aktif dengan tipe cash-equivalent
```

Cash-equivalent dapat mencakup cash, bank account, e-wallet, dan akun likuid lain sesuai definisi produk.

## 5.3 Total Wallet Balance

```text
Total Wallet Balance =
Sum(Wallet Balance)
untuk semua wallet aktif dalam workspace
```

## 5.4 Total Asset

```text
Total Asset =
Total Cash
+ Total Asset Wallet
+ Total Investment Value future
+ Total Asset Management Value future
```

Pada V1, Total Asset dapat dibatasi pada wallet aktif yang dikategorikan sebagai asset atau cash-equivalent.

## 5.5 Total Debt

```text
Total Debt =
Sum(Current Debt Balance)
untuk semua debt aktif dalam workspace
```

Debt balance harus berasal dari principal, payment, interest rule, atau adjustment yang diaudit.

## 5.6 Net Worth

```text
Net Worth =
Total Asset - Total Debt
```

Net Worth harus dijelaskan sebagai estimasi berdasarkan data yang dicatat pengguna.

## 5.7 Monthly Income

```text
Monthly Income =
Sum(Transaction Amount)
untuk transaction bertipe income
dalam periode bulan terkait
```

## 5.8 Monthly Expense

```text
Monthly Expense =
Sum(Transaction Amount)
untuk transaction bertipe expense
dalam periode bulan terkait
```

Transfer tidak dihitung sebagai income atau expense, kecuali terdapat fee terpisah yang dicatat sebagai expense.

## 5.9 Monthly Cashflow

```text
Monthly Cashflow =
Monthly Income - Monthly Expense
```

## 5.10 Budget Usage

```text
Budget Usage Percentage =
(Actual Expense / Planned Budget) * 100
```

```text
Available Budget =
Planned Budget - Actual Expense
```

Actual Expense harus berasal dari transaction expense yang sesuai category dan period budget.

## 5.11 Goal Progress

```text
Goal Progress Percentage =
(Current Goal Progress / Target Amount) * 100
```

Current Goal Progress harus berasal dari mekanisme yang jelas, misalnya contribution transaction, linked wallet allocation, atau manual progress adjustment yang diaudit.

## 5.12 Debt Progress

```text
Debt Progress Percentage =
((Original Debt Amount - Current Debt Balance) / Original Debt Amount) * 100
```

Jika debt memiliki bunga, formula harus menjelaskan apakah progress dihitung dari principal saja atau total outstanding balance.

## 5.13 Emergency Fund Coverage

```text
Emergency Fund Coverage =
Emergency Fund Available / Average Monthly Essential Expense
```

Hasil dinyatakan dalam jumlah bulan.

Contoh:

```text
Emergency Fund Available = Rp30.000.000
Average Monthly Essential Expense = Rp5.000.000
Emergency Fund Coverage = 6 bulan
```

# 6. Event Finansial

Financial Event adalah kejadian yang dapat mengubah kondisi finansial atau memicu perhitungan ulang. Tidak semua event mengubah saldo, tetapi semua event penting harus dapat diaudit.

## 6.1 Daftar Event Utama

- Transaction Created.
- Transaction Updated.
- Transaction Deleted.
- Transfer Created.
- Debt Created.
- Debt Payment Created.
- Budget Created.
- Goal Contribution Created.
- Recurring Transaction Executed.
- Subscription Payment Recorded.
- Wallet Adjustment Created.

## 6.2 Prinsip Event

- Event harus memiliki timestamp.
- Event harus memiliki actor jika dipicu oleh user.
- Event harus memiliki workspace_id.
- Event harus dapat ditelusuri ke domain terkait.
- Event penting harus masuk audit log.
- Event yang mengubah angka finansial harus memicu recalculation atau invalidasi cache.

# 7. Dampak Event

| Event                          | Domain Terdampak                                   | Perubahan yang Terjadi                                  | Recalculation yang Diperlukan                                                |
| ------------------------------ | -------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Transaction Created            | Wallet, Budget, Report, Financial Score, Dashboard | Saldo, cashflow, budget actual, dan report berubah      | Wallet balance, monthly cashflow, budget usage, score, snapshot jika relevan |
| Transaction Updated            | Wallet, Budget, Report, Financial Score, Dashboard | Nilai lama harus dikoreksi dan nilai baru diterapkan    | Recalculate domain terdampak pada periode lama dan baru                      |
| Transaction Deleted            | Wallet, Budget, Report, Financial Score, Dashboard | Dampak transaksi harus dibalik                          | Recalculate wallet, budget, report, score, snapshot                          |
| Transfer Created               | Wallet sumber, Wallet tujuan, Report, Dashboard    | Wallet sumber berkurang dan wallet tujuan bertambah     | Wallet balance kedua wallet, total wallet balance                            |
| Debt Created                   | Debt, Financial Score, Report, Dashboard           | Total debt bertambah                                    | Total debt, net worth, score                                                 |
| Debt Payment Created           | Debt, Wallet, Transaction, Report, Dashboard       | Debt berkurang dan wallet pembayaran berkurang          | Debt balance, wallet balance, net worth, score                               |
| Budget Created                 | Budget, Dashboard, Report                          | Rencana budget baru tersedia                            | Budget summary dan available budget                                          |
| Goal Contribution Created      | Goal, Wallet, Transaction, Dashboard               | Progress goal bertambah jika kontribusi valid           | Goal progress, wallet balance jika melalui transaction                       |
| Recurring Transaction Executed | Transaction, Wallet, Budget, Report                | Transaction aktual dibuat dari recurring rule           | Semua perhitungan seperti Transaction Created                                |
| Subscription Payment Recorded  | Transaction, Subscription, Wallet, Report          | Pembayaran subscription tercatat dan plan dapat berubah | Wallet balance, subscription status, report                                  |
| Wallet Adjustment Created      | Wallet, Transaction atau Adjustment, Audit Log     | Saldo wallet dikoreksi dengan alasan                    | Wallet balance, report, audit trail                                          |

# 8. Business Rules

## 8.1 Aturan Umum

- Semua transaksi wajib memiliki `workspace_id`.
- Semua transaksi wajib memiliki `wallet_id`, kecuali tipe konseptual tertentu yang belum menjadi transaksi aktual seperti draft approval atau simulation.
- Semua financial event yang mengubah angka harus dapat diaudit.
- Semua perhitungan harus scoped ke workspace.
- Semua akses data harus mengikuti permission workspace.

## 8.2 Aturan Wallet dan Transaction

- Expense mengurangi wallet balance.
- Income menambah wallet balance.
- Transfer mengurangi wallet sumber dan menambah wallet tujuan.
- Transfer tidak boleh menggunakan wallet sumber dan wallet tujuan yang sama.
- Wallet balance tidak boleh diedit langsung tanpa adjustment yang diaudit.
- Adjustment harus memiliki alasan.
- Transaction amount harus lebih besar dari nol.
- Transaction date wajib ada.
- Transaction backdate harus memicu recalculation periode terkait.

## 8.3 Aturan Debt

- Debt Payment harus terkait dengan debt.
- Debt Payment harus menghasilkan transaction atau terhubung dengan transaction.
- Debt Payment harus mengurangi debt balance sesuai aturan yang berlaku.
- Hutang yang lunas penuh harus memiliki status paid atau closed.
- Debt adjustment harus diaudit.

## 8.4 Aturan Goal

- Goal contribution tidak boleh mengurangi saldo tanpa transaction.
- Goal tidak boleh dianggap sebagai wallet.
- Goal progress harus memiliki sumber data yang jelas.
- Goal dapat menjadi planning target, bukan data kas aktual.

## 8.5 Aturan Budget

- Budget tidak mengubah saldo wallet.
- Budget actual harus dihitung dari transaction.
- Budget harus memiliki periode.
- Budget usage tidak boleh dihitung dari input manual tanpa transaction sumber.

## 8.6 Aturan Financial Score dan Dashboard

- Financial Score tidak boleh diedit manual.
- Financial Score harus dihitung dari data finansial dan formula yang terdokumentasi.
- Dashboard tidak menyimpan angka permanen kecuali snapshot.
- Snapshot hanya untuk histori dan performa.
- Dashboard hanya membaca data.

## 8.7 Aturan AI

- AI hanya membaca dan memberi rekomendasi.
- AI tidak boleh mengubah transaction.
- AI tidak boleh mengubah wallet balance.
- AI tidak boleh membuat financial score manual.
- AI tidak boleh mengarang data.
- AI harus menyebutkan keterbatasan jika data tidak lengkap.

## 8.8 Aturan Subscription

- Subscription payment yang dicatat sebagai pengeluaran harus menjadi transaction.
- Status premium tidak boleh mengubah data finansial historis.
- Downgrade tidak boleh menghapus financial data.
- Premium hanya membuka fitur lanjutan, bukan mengubah kebenaran perhitungan.

# 9. Auditability

Auditability adalah kemampuan Vinari untuk menjelaskan asal-usul setiap angka yang ditampilkan.

Setiap angka penting harus dapat menjawab:

- Data apa yang digunakan?
- Transaction mana saja yang terlibat?
- Periode apa yang dihitung?
- Formula apa yang digunakan?
- Kapan perhitungan dilakukan?
- Siapa yang membuat atau mengubah data sumber?
- Apakah data berasal dari real-time calculation atau snapshot?

## 9.1 Prinsip Audit

- Transaction harus menyimpan metadata pembuat dan waktu perubahan.
- Update dan delete transaksi harus memiliki audit trail atau strategi historis.
- Adjustment harus memiliki alasan.
- Snapshot harus menyimpan waktu generate.
- Report harus dapat ditelusuri ke periode dan sumber data.
- Financial Score harus memiliki calculation version.

## 9.2 Contoh Audit Trail

```text
Dashboard Net Worth: Rp45.000.000
  |
  +-- Total Asset: Rp60.000.000
  |     +-- Wallet BCA: Rp30.000.000
  |     +-- Wallet Cash: Rp5.000.000
  |     +-- Wallet Dana Darurat: Rp25.000.000
  |
  +-- Total Debt: Rp15.000.000
        +-- Debt Kartu Kredit: Rp5.000.000
        +-- Debt Motor: Rp10.000.000
```

# 10. Snapshot Finansial

Financial Snapshot adalah hasil perhitungan financial state yang disimpan pada titik waktu tertentu. Snapshot bukan sumber kebenaran utama, tetapi berguna untuk histori, performa, trend, dan report periodik.

## 10.1 Jenis Snapshot

| Jenis Snapshot | Waktu Pembuatan                           | Kegunaan                                                  |
| -------------- | ----------------------------------------- | --------------------------------------------------------- |
| Harian         | Akhir hari atau saat aktivitas signifikan | Trend saldo, cashflow harian, audit performa              |
| Bulanan        | Akhir bulan atau saat monthly review      | Laporan bulanan, budget review, score history             |
| Tahunan        | Akhir tahun                               | Laporan tahunan, trend net worth, evaluasi jangka panjang |

## 10.2 Data Snapshot Potensial

- Workspace ID.
- Snapshot date.
- Total cash.
- Total wallet balance.
- Total asset.
- Total debt.
- Net worth.
- Monthly income.
- Monthly expense.
- Monthly cashflow.
- Budget usage summary.
- Goal progress summary.
- Debt progress summary.
- Financial health score.
- Calculation version.

## 10.3 Aturan Snapshot

- Snapshot tidak menggantikan transaction.
- Snapshot harus dapat dihitung ulang jika data historis berubah.
- Snapshot boleh digunakan untuk performa dashboard.
- Snapshot harus menyimpan calculation version.
- Snapshot hanya valid untuk periode dan waktu generate tertentu.

# 11. Edge Cases

## 11.1 Transaksi Dihapus

Jika transaksi dihapus, dampaknya harus dibalik dari wallet, budget actual, report, financial score, dan snapshot terkait. Vinari perlu menentukan apakah delete bersifat soft delete atau hard delete. Untuk data finansial, soft delete lebih aman karena mendukung auditability.

## 11.2 Transaksi Diedit Setelah Laporan Dibuat

Jika transaksi diedit setelah report atau snapshot dibuat, sistem harus menandai report atau snapshot terkait sebagai stale atau melakukan recalculation. Perubahan backdate dapat memengaruhi periode lampau.

## 11.3 Transfer Antar Dompet

Transfer harus memperbarui dua wallet:

- Wallet sumber berkurang.
- Wallet tujuan bertambah.

Transfer tidak boleh dihitung sebagai income atau expense reguler. Fee transfer harus dicatat sebagai expense terpisah jika relevan.

## 11.4 Hutang Dilunasi Sebagian

Debt Payment sebagian mengurangi debt balance sesuai amount yang berlaku. Jika terdapat bunga, perlu dibedakan principal dan interest.

## 11.5 Hutang Dilunasi Penuh

Jika debt balance mencapai nol, debt dapat berubah status menjadi paid atau closed. Status ini tidak boleh menghapus histori debt payment.

## 11.6 Wallet Diarsipkan

Wallet archived tidak boleh digunakan untuk transaksi baru. Namun histori transaksi wallet tersebut tetap harus tersedia untuk report dan audit.

## 11.7 Category Dihapus atau Diarsipkan

Category yang sudah digunakan transaksi sebaiknya diarsipkan, bukan dihapus permanen. Transaksi historis harus tetap memiliki konteks category.

## 11.8 Transaksi Backdate

Transaksi backdate dapat memengaruhi report, budget, score, cashflow, dan snapshot periode lampau. Sistem harus melakukan recalculation atau menandai data terkait untuk diperbarui.

## 11.9 Zona Waktu

Transaction date harus konsisten dengan timezone workspace atau user. Report harian, bulanan, dan tahunan harus menggunakan timezone yang ditentukan.

## 11.10 Multi-Currency Future

Multi-currency belum menjadi cakupan utama V1. Jika didukung, semua perhitungan agregat harus memiliki:

- Currency asal.
- Currency target.
- Exchange rate.
- Waktu rate.
- Sumber rate.

## 11.11 User Keluar dari Workspace

Jika user keluar dari workspace:

- Data yang dibuat user tidak otomatis dihapus.
- Audit history tetap menyimpan actor.
- Akses user ke workspace harus dicabut.
- Ownership harus tetap jelas.

# 12. Integrasi dengan AI dan Decision Engine

AI Engine dan Decision Engine hanya boleh membaca data finansial, hasil perhitungan, snapshot, dan report yang diizinkan. Keduanya tidak boleh langsung mengubah data utama.

## 12.1 AI Engine

AI Engine boleh:

- Membaca transaction summary.
- Membaca budget usage.
- Membaca debt progress.
- Membaca financial score.
- Membaca snapshot.
- Memberi insight dan rekomendasi.
- Menyarankan kategori atau tindakan.

AI Engine tidak boleh:

- Mengubah transaction.
- Mengubah wallet balance.
- Menghapus data.
- Mengubah score.
- Menjalankan approval otomatis tanpa aturan.

## 12.2 Decision Engine

Decision Engine boleh:

- Membuat simulasi pembelian.
- Membuat simulasi debt payoff.
- Membuat simulasi cashflow.
- Membuat scenario comparison.
- Membaca financial state.

Decision Engine tidak boleh:

- Mengubah saldo.
- Membuat transaksi aktual tanpa konfirmasi pengguna.
- Menandai goal tercapai tanpa data sumber.
- Menganggap simulasi sebagai data aktual.

# 13. Integrasi dengan Premium System

Financial Core Engine harus mendukung perbedaan fitur free dan premium tanpa mengubah kebenaran perhitungan dasar.

## 13.1 Free

Fitur free dapat mencakup:

- Financial summary dasar.
- Monthly cashflow dasar.
- Wallet balance.
- Transaction summary.
- Budget usage dasar.
- Goal progress dasar.

## 13.2 Premium

Fitur premium dapat mencakup:

- Financial Health Score.
- Cashflow prediction.
- Decision simulation.
- Advanced insight.
- Historical snapshot analysis.
- Advanced report.
- AI Financial Insight.

## 13.3 Aturan Premium

- Premium tidak boleh mengubah angka dasar.
- Premium hanya membuka analisis, histori, otomatisasi, dan insight lanjutan.
- Jika user downgrade, data historis tidak boleh dihapus.
- Entitlement harus dicek di backend dan frontend.

# 14. Kebutuhan Database Masa Depan

Dokumen ini tidak membuat schema SQL final. Bagian ini hanya menjelaskan tabel konseptual yang kemungkinan dibutuhkan.

| Tabel Konseptual      | Fungsi                                     |
| --------------------- | ------------------------------------------ |
| `transactions`        | Menyimpan transaksi finansial aktual       |
| `wallets`             | Menyimpan wallet atau akun finansial       |
| `budgets`             | Menyimpan rencana budget                   |
| `debts`               | Menyimpan data hutang                      |
| `debt_payments`       | Menyimpan pembayaran hutang                |
| `goals`               | Menyimpan target finansial                 |
| `financial_snapshots` | Menyimpan hasil perhitungan periodik       |
| `financial_events`    | Menyimpan event finansial penting          |
| `audit_logs`          | Menyimpan jejak perubahan dan aksi penting |

## 14.1 Prinsip Database Future

- Semua tabel financial utama harus memiliki `workspace_id`.
- Semua tabel penting harus memiliki `created_at` dan `updated_at`.
- Relasi harus menggunakan foreign key.
- RLS wajib diterapkan.
- Audit log harus tersedia untuk perubahan sensitif.

# 15. Kebutuhan API Masa Depan

Dokumen ini tidak membuat API final. Bagian ini hanya menjelaskan endpoint konseptual.

| Endpoint Konseptual                  | Fungsi                                           |
| ------------------------------------ | ------------------------------------------------ |
| `getFinancialSummary`                | Mengambil ringkasan kondisi finansial workspace  |
| `recalculateWorkspaceFinancialState` | Memicu perhitungan ulang financial state         |
| `getCashflow`                        | Mengambil cashflow berdasarkan periode           |
| `getNetWorth`                        | Mengambil total asset, total debt, dan net worth |
| `getFinancialScore`                  | Mengambil Financial Health Score                 |
| `getFinancialSnapshots`              | Mengambil histori snapshot finansial             |

## 15.1 Prinsip API Future

- Semua endpoint privat harus membutuhkan autentikasi.
- Semua endpoint workspace harus memvalidasi membership.
- Endpoint recalculation harus dilindungi permission.
- Response harus menjelaskan periode dan sumber data.
- Endpoint premium harus memeriksa entitlement.

# 16. Kebutuhan Testing

Testing Financial Core Engine wajib memastikan perhitungan benar, konsisten, dan aman.

## 16.1 Test Scenario Utama

| Scenario                              | Ekspektasi                                                 |
| ------------------------------------- | ---------------------------------------------------------- |
| Membuat income transaction            | Wallet balance bertambah                                   |
| Membuat expense transaction           | Wallet balance berkurang                                   |
| Membuat transfer                      | Wallet sumber berkurang dan wallet tujuan bertambah        |
| Mengedit amount transaction           | Semua perhitungan terkait berubah                          |
| Menghapus transaction                 | Dampak transaksi dibalik                                   |
| Membuat budget                        | Budget summary tersedia                                    |
| Expense masuk kategori budget         | Budget usage bertambah                                     |
| Membuat debt                          | Total debt bertambah                                       |
| Membuat debt payment                  | Debt balance berkurang dan wallet balance berkurang        |
| Goal contribution melalui transaction | Goal progress bertambah dan saldo berubah sesuai transaksi |
| Goal progress tanpa transaction valid | Sistem menolak atau meminta adjustment yang diaudit        |
| Recurring transaction executed        | Transaction aktual dibuat dan perhitungan berubah          |
| Backdate transaction                  | Periode lampau dihitung ulang                              |
| Wallet archived                       | Wallet tidak bisa dipakai transaksi baru                   |
| Category archived                     | Transaksi historis tetap terbaca                           |
| Financial Score requested             | Score dihitung, bukan diedit manual                        |
| Dashboard loaded                      | Dashboard hanya membaca data                               |
| AI insight generated                  | AI membaca data tanpa mengubah transaksi                   |

## 16.2 Test Scenario Security dan Permission

- User tidak dapat membaca financial summary workspace lain.
- User non-member tidak dapat menjalankan recalculation workspace.
- Member dengan role terbatas tidak dapat membuat adjustment.
- AI tidak dapat membaca data di luar workspace.
- Premium endpoint menolak user tanpa entitlement.

## 16.3 Test Scenario Edge Case

- Transfer dengan wallet yang sama harus ditolak.
- Transaction amount nol atau negatif harus ditolak.
- Debt payment tanpa debt harus ditolak.
- Adjustment tanpa alasan harus ditolak.
- Snapshot lama ditandai stale jika data historis berubah.

# 17. Future Development

## 17.1 Multi-Currency

Multi-currency akan membutuhkan exchange rate, base currency, rate source, dan aturan revaluation.

## 17.2 Investment

Investment akan menambahkan nilai aset yang berubah berdasarkan market value dan membutuhkan aturan valuasi.

## 17.3 Asset Management

Asset management akan mencatat aset non-cash seperti properti, kendaraan, atau barang bernilai.

## 17.4 Insurance

Insurance akan mengelola polis, premi, manfaat, dan jadwal pembayaran.

## 17.5 Tax

Tax akan mendukung ringkasan pajak dan laporan tertentu sesuai kebutuhan regional.

## 17.6 Payroll Personal

Payroll personal akan membantu pengguna memahami gaji, potongan, bonus, dan benefit.

## 17.7 Bank Sync

Bank sync akan membutuhkan reconciliation, duplicate detection, dan keamanan integrasi yang kuat.

## 17.8 Advanced AI Simulation

Advanced AI simulation akan membantu pengguna memahami skenario finansial kompleks, tetapi tetap tidak boleh mengubah data aktual tanpa konfirmasi pengguna.

# 18. Kesimpulan

Financial Core Engine adalah pusat kebenaran perhitungan finansial Vinari.

Semua modul yang membaca, menampilkan, menganalisis, atau mensimulasikan kondisi finansial harus mengikuti aturan dalam dokumen ini. Transaction tetap menjadi source of truth utama. Wallet balance harus berasal dari initial balance dan transaction. Budget, report, dashboard, financial score, AI, dan decision engine harus membaca data, menghitung secara konsisten, dan tidak menciptakan kebenaran finansial sendiri.

Dengan Financial Core Engine yang jelas, Vinari dapat berkembang sebagai Personal & Family Financial Operating System yang aman, akurat, scalable, dan siap untuk fitur lanjutan seperti premium insight, family collaboration, AI advisor, decision simulation, dan future financial domains.

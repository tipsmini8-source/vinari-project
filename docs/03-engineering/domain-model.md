# Domain Model Vinari

## Status Dokumen

| Atribut       | Keterangan                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Nama Dokumen  | Domain Model Vinari                                                                                                      |
| Produk        | Vinari Project                                                                                                           |
| Bahasa        | Indonesia                                                                                                                |
| Status        | Draft Foundation                                                                                                         |
| Pemilik       | Product & Engineering Team                                                                                               |
| Pembaca Utama | Product Manager, Software Architect, Backend Developer, Frontend Developer, Data Engineer, AI Engineer, QA, dan AI Agent |
| Fungsi Utama  | Acuan utama pemodelan domain sebelum database, ERD, API, backend, frontend, AI, dan dashboard dibangun                   |

## Prinsip Utama

Database harus mengikuti Domain Model, bukan sebaliknya.

Domain Model ini menjelaskan konsep bisnis Vinari dalam bahasa produk dan bisnis terlebih dahulu. Struktur database, endpoint API, komponen UI, dashboard, dan AI harus diturunkan dari model domain ini agar seluruh sistem tetap konsisten.

# BAB 1. Pengantar Domain Model

## 1.1 Apa Itu Domain Model

Domain Model adalah representasi konseptual dari dunia bisnis yang ingin diselesaikan oleh sebuah produk. Dalam konteks Vinari, Domain Model menjelaskan objek utama, aturan bisnis, hubungan antar konsep, dan tanggung jawab masing-masing bagian dalam sistem finansial pribadi dan keluarga.

Domain Model bukan tabel database. Domain Model juga bukan diagram UI. Domain Model adalah bahasa bersama antara product, engineering, design, QA, AI, dan bisnis.

Domain Model menjawab pertanyaan:

- Konsep bisnis apa saja yang ada di Vinari?
- Apa tanggung jawab setiap konsep?
- Data apa yang penting untuk konsep tersebut?
- Domain mana yang menjadi sumber kebenaran?
- Domain mana yang hanya membaca atau menurunkan data?
- Aturan bisnis apa yang tidak boleh dilanggar?

## 1.2 Mengapa Vinari Menggunakan Domain Driven Design

Vinari adalah produk finansial jangka panjang. Produk ini tidak hanya mencatat transaksi, tetapi juga mengelola budget, hutang, target, keluarga, insight, AI, keputusan finansial, dan premium SaaS. Kompleksitas ini membutuhkan pendekatan yang lebih disiplin daripada sekadar membuat tabel dan halaman.

Domain Driven Design membantu Vinari:

- Menjaga bahasa produk dan bahasa teknis tetap selaras.
- Menghindari database yang dibangun berdasarkan asumsi UI sementara.
- Memisahkan tanggung jawab antar domain.
- Membuat aturan bisnis lebih eksplisit.
- Mengurangi risiko refactor besar saat fitur berkembang.
- Menyiapkan fondasi untuk family workspace, AI, premium, dan future domain.

## 1.3 Mengapa Domain Model Lebih Penting daripada Database

Database menyimpan data. Domain Model menjelaskan makna data.

Jika database dibuat lebih dulu tanpa pemahaman domain, sistem mudah terjebak pada struktur teknis yang tidak mencerminkan bisnis. Akibatnya, aturan finansial sulit diterapkan, relasi menjadi membingungkan, dan fitur masa depan membutuhkan perubahan besar.

Contoh:

- `Transaction` bukan hanya baris data. Transaction adalah peristiwa finansial yang memengaruhi Wallet, Budget, Debt, Report, Financial Score, dan Dashboard.
- `Dashboard` bukan sumber data. Dashboard hanya membaca dan merangkum domain lain.
- `AI` bukan pemilik data finansial. AI hanya membaca data yang diizinkan dan menghasilkan insight atau rekomendasi yang dapat dijelaskan.
- `Goal` tidak boleh mengurangi saldo secara langsung karena Goal adalah rencana, bukan transaksi aktual.

Dengan Domain Model, Vinari memastikan bahwa database, API, backend, frontend, dashboard, dan AI mengikuti logika bisnis yang sama.

# BAB 2. Daftar Domain Utama Vinari

## 2.1 Ringkasan Domain

| Domain                | Deskripsi Singkat                            | Kategori         |
| --------------------- | -------------------------------------------- | ---------------- |
| Workspace             | Boundary utama data finansial                | Core             |
| User                  | Identitas pengguna yang terautentikasi       | Core             |
| Wallet                | Tempat uang atau akun finansial dicatat      | Core Finance     |
| Transaction           | Peristiwa finansial aktual                   | Core Finance     |
| Category              | Klasifikasi transaksi                        | Core Finance     |
| Budget                | Rencana alokasi uang                         | Planning         |
| Debt                  | Kewajiban finansial                          | Planning         |
| Debt Payment          | Pembayaran hutang                            | Core Finance     |
| Goal                  | Target finansial                             | Planning         |
| Subscription          | Status plan berbayar pengguna atau workspace | SaaS             |
| Recurring Transaction | Pola transaksi berulang                      | Automation       |
| Reminder              | Pengingat tindakan finansial                 | Engagement       |
| Notification          | Pesan sistem kepada pengguna                 | Engagement       |
| Report                | Ringkasan dan laporan finansial              | Analytics        |
| Financial Score       | Indikator kesehatan finansial                | Analytics        |
| Financial Insight     | Penjelasan dan temuan dari data finansial    | Analytics & AI   |
| Financial Decision    | Keputusan atau simulasi finansial            | Decision Support |
| Family                | Konteks keluarga dalam workspace             | Collaboration    |
| Member                | Anggota workspace atau keluarga              | Collaboration    |
| Approval              | Persetujuan tindakan tertentu                | Collaboration    |
| Settings              | Preferensi dan konfigurasi                   | Configuration    |
| AI                    | Mesin bantuan finansial berbasis data        | Intelligence     |

## 2.2 Struktur Konseptual Tingkat Tinggi

```text
User
  |
  v
Workspace
  |
  +--> Member / Family / Settings
  |
  +--> Wallet
  |      |
  |      v
  |   Transaction
  |      |
  |      +--> Category
  |      +--> Debt Payment
  |      +--> Recurring Transaction
  |
  +--> Budget
  +--> Debt
  +--> Goal
  |
  +--> Report
  +--> Financial Score
  +--> Financial Insight
  +--> Financial Decision
  |
  +--> Reminder
  +--> Notification
  +--> Subscription
  +--> AI
```

# BAB 3. Detail Setiap Domain

## 3.1 Workspace

### Tujuan

Workspace adalah boundary utama seluruh data finansial Vinari. Setiap data penting harus berada dalam konteks Workspace.

### Tanggung Jawab

- Menjadi ruang kerja finansial personal, family, atau future business.
- Menjadi batas akses data.
- Menjadi konteks utama untuk Wallet, Transaction, Budget, Debt, Goal, Report, dan AI.
- Menjadi unit utama untuk permission dan premium entitlement.

### Data Utama

- Workspace ID.
- Nama workspace.
- Tipe workspace: personal, family, business future.
- Owner.
- Default currency.
- Status.
- Created at.
- Updated at.

### Hubungan dengan Domain Lain

- Workspace dimiliki oleh User.
- Workspace memiliki Member.
- Workspace memiliki Wallet, Transaction, Category, Budget, Debt, Goal, Report, Settings, dan Subscription.
- AI membaca data dalam batas Workspace.

### Aturan Bisnis

- Semua data finansial wajib terkait dengan Workspace.
- User hanya boleh mengakses Workspace jika menjadi owner atau Member aktif.
- Workspace personal hanya memiliki satu owner, tetapi dapat berkembang menjadi family workspace jika aturan produk mengizinkan.
- Workspace tidak boleh dihapus permanen tanpa kebijakan data retention.

### Contoh Penggunaan

Pengguna membuat workspace personal bernama "Keuangan Pribadi". Semua wallet, transaksi, budget, dan goal pengguna tersebut berada dalam workspace ini.

### Future Development

- Multi-workspace.
- Family workspace.
- Business workspace.
- Workspace archive.
- Workspace-level analytics.

## 3.2 User

### Tujuan

User adalah identitas individu yang menggunakan Vinari.

### Tanggung Jawab

- Menjadi identitas autentikasi.
- Mengelola profil pengguna.
- Mengakses satu atau lebih Workspace.
- Menjadi aktor dalam audit log dan aktivitas sistem.

### Data Utama

- User ID.
- Email.
- Nama.
- Avatar.
- Status verifikasi.
- Preferensi dasar.
- Created at.
- Updated at.

### Hubungan dengan Domain Lain

- User dapat memiliki Workspace.
- User dapat menjadi Member pada Workspace lain.
- User dapat membuat Transaction, Budget, Goal, Approval, dan Settings.

### Aturan Bisnis

- User harus terautentikasi untuk mengakses data privat.
- User tidak otomatis berhak melihat semua data jika tidak memiliki membership Workspace.
- User action penting harus dapat diaudit.

### Contoh Penggunaan

Seorang user mendaftar, membuat workspace personal, lalu diundang ke family workspace oleh pasangan.

### Future Development

- Multi-factor authentication.
- Account deletion.
- User activity history.
- Personalization.

## 3.3 Wallet

### Tujuan

Wallet adalah representasi tempat uang atau akun finansial dicatat.

### Tanggung Jawab

- Menyimpan konteks saldo.
- Menjadi sumber atau tujuan Transaction.
- Membedakan jenis akun seperti cash, bank, e-wallet, kartu kredit, tabungan, atau hutang.
- Menjadi dasar laporan saldo dan cashflow.

### Data Utama

- Wallet ID.
- Workspace ID.
- Nama wallet.
- Tipe wallet.
- Currency.
- Opening balance.
- Status aktif atau archived.
- Created at.
- Updated at.

### Hubungan dengan Domain Lain

- Wallet berada dalam Workspace.
- Wallet memiliki banyak Transaction.
- Wallet dapat terkait dengan Debt.
- Wallet digunakan oleh Report dan Dashboard.

### Aturan Bisnis

- Wallet wajib berada dalam Workspace.
- Wallet archived tidak boleh digunakan untuk transaksi baru kecuali diaktifkan kembali.
- Saldo wallet harus dihitung dari opening balance dan Transaction, bukan diubah manual tanpa audit.
- Transfer selalu melibatkan dua Wallet jika berada dalam sistem yang sama.

### Contoh Penggunaan

Pengguna membuat Wallet "BCA", "Cash", dan "GoPay" untuk mencatat uang di berbagai tempat.

### Future Development

- Bank integration.
- Multi-currency wallet.
- Wallet group.
- Reconciliation.

## 3.4 Transaction

### Tujuan

Transaction adalah catatan peristiwa finansial aktual dan menjadi sumber utama seluruh data finansial Vinari.

### Tanggung Jawab

- Mencatat pemasukan, pengeluaran, dan transfer.
- Mengubah saldo Wallet.
- Menjadi dasar Budget actual, Report, Financial Score, Dashboard, dan AI Insight.
- Menjadi sumber audit finansial utama.

### Data Utama

- Transaction ID.
- Workspace ID.
- Wallet ID.
- Destination Wallet ID untuk transfer.
- Category ID.
- Tipe: income, expense, transfer.
- Amount.
- Currency.
- Transaction date.
- Notes.
- Created by.
- Created at.
- Updated at.

### Hubungan dengan Domain Lain

- Transaction berada dalam Workspace.
- Transaction menggunakan Wallet.
- Transaction dapat memiliki Category.
- Transaction dapat berasal dari Recurring Transaction.
- Transaction dapat mewakili Debt Payment.
- Transaction dibaca oleh Budget, Report, Financial Score, Financial Insight, AI, dan Dashboard.

### Aturan Bisnis

- Semua Transaction wajib memiliki Workspace.
- Income dan expense wajib memiliki Wallet.
- Transfer wajib memiliki Wallet asal dan Wallet tujuan.
- Transfer selalu memengaruhi dua Wallet.
- Amount harus lebih besar dari nol.
- Transaction tidak boleh dibuat tanpa tanggal.
- Transaction adalah source of truth utama untuk data finansial aktual.

### Contoh Penggunaan

Pengguna mencatat pengeluaran makan sebesar Rp50.000 dari Wallet "Cash" dengan Category "Makanan".

### Future Development

- Split transaction.
- Attachment receipt.
- Import transaction.
- Duplicate detection.
- Transaction audit trail.

## 3.5 Category

### Tujuan

Category digunakan untuk mengelompokkan Transaction agar pengguna dapat memahami pola keuangan.

### Tanggung Jawab

- Mengklasifikasikan income dan expense.
- Menjadi dasar Budget.
- Menjadi dimensi laporan dan insight.
- Membantu AI memahami pola transaksi.

### Data Utama

- Category ID.
- Workspace ID.
- Nama kategori.
- Tipe kategori.
- Parent category.
- Icon.
- Color.
- Status.

### Hubungan dengan Domain Lain

- Category berada dalam Workspace.
- Category digunakan oleh Transaction.
- Category digunakan oleh Budget.
- Category dibaca oleh Report, Financial Insight, dan AI.

### Aturan Bisnis

- Category income tidak boleh digunakan untuk expense jika aturan tipe diterapkan.
- Category yang sudah digunakan Transaction sebaiknya diarsipkan, bukan dihapus permanen.
- Category default dapat dibuat otomatis untuk Workspace baru.

### Contoh Penggunaan

Kategori "Makanan", "Transportasi", "Gaji", dan "Cicilan" digunakan untuk mengelompokkan transaksi.

### Future Development

- Category template.
- Auto-categorization.
- Subcategory.
- Category analytics.

## 3.6 Budget

### Tujuan

Budget adalah rencana alokasi uang dalam periode tertentu.

### Tanggung Jawab

- Menetapkan batas atau rencana pengeluaran.
- Membandingkan planned amount dengan actual transaction.
- Membantu pengguna melakukan review keuangan.
- Menjadi dasar insight perilaku finansial.

### Data Utama

- Budget ID.
- Workspace ID.
- Periode.
- Category.
- Planned amount.
- Actual amount sebagai hasil perhitungan.
- Status.
- Created at.
- Updated at.

### Hubungan dengan Domain Lain

- Budget berada dalam Workspace.
- Budget menggunakan Category.
- Budget membaca Transaction.
- Budget dibaca oleh Report, Dashboard, Financial Score, dan AI.

### Aturan Bisnis

- Budget bukan sumber data finansial aktual.
- Actual budget harus dihitung dari Transaction.
- Budget tidak boleh mengubah saldo Wallet.
- Budget period harus jelas.
- Budget dapat menjadi dasar notifikasi jika pengeluaran mendekati batas.

### Contoh Penggunaan

Pengguna membuat budget "Makanan" sebesar Rp2.000.000 untuk bulan Januari.

### Future Development

- Rollover budget.
- Shared family budget.
- Budget recommendation.
- Zero-based budgeting.

## 3.7 Debt

### Tujuan

Debt merepresentasikan kewajiban finansial yang harus dilunasi.

### Tanggung Jawab

- Menyimpan informasi hutang.
- Menampilkan saldo dan progres pelunasan.
- Mendukung strategi pelunasan.
- Menjadi dasar Financial Score dan Insight.

### Data Utama

- Debt ID.
- Workspace ID.
- Nama hutang.
- Lender.
- Principal amount.
- Current balance.
- Interest rate.
- Minimum payment.
- Due date.
- Status.

### Hubungan dengan Domain Lain

- Debt berada dalam Workspace.
- Debt dapat terkait dengan Wallet.
- Debt memiliki Debt Payment.
- Debt Payment menghasilkan Transaction.
- Debt dibaca oleh Report, Financial Score, Financial Insight, dan AI.

### Aturan Bisnis

- Debt tidak boleh berkurang tanpa Debt Payment atau adjustment yang diaudit.
- Debt harus memiliki status.
- Interest calculation harus memiliki asumsi yang jelas.
- Debt payoff simulation tidak boleh dianggap nasihat finansial tersertifikasi.

### Contoh Penggunaan

Pengguna mencatat hutang kartu kredit dengan saldo Rp5.000.000 dan minimum payment Rp500.000 per bulan.

### Future Development

- Debt snowball.
- Debt avalanche.
- Amortization schedule.
- Debt consolidation simulation.

## 3.8 Debt Payment

### Tujuan

Debt Payment adalah pembayaran terhadap Debt dan harus terhubung dengan Transaction.

### Tanggung Jawab

- Mencatat pembayaran hutang.
- Mengurangi saldo Debt.
- Menghasilkan atau terhubung dengan Transaction.
- Menjaga audit antara pembayaran dan perubahan saldo hutang.

### Data Utama

- Debt Payment ID.
- Workspace ID.
- Debt ID.
- Transaction ID.
- Payment amount.
- Principal amount.
- Interest amount.
- Payment date.

### Hubungan dengan Domain Lain

- Debt Payment milik Debt.
- Debt Payment selalu terkait Transaction.
- Debt Payment memengaruhi Report, Financial Score, dan Dashboard.

### Aturan Bisnis

- Debt Payment selalu menghasilkan Transaction atau terhubung dengan Transaction.
- Debt Payment tidak boleh berdiri sendiri tanpa Debt.
- Payment amount harus lebih besar dari nol.
- Pembayaran hutang dari Wallet harus mengurangi saldo Wallet.

### Contoh Penggunaan

Pengguna membayar cicilan Rp1.000.000 dari Wallet "BCA" untuk Debt "Pinjaman Motor".

### Future Development

- Auto-split principal dan interest.
- Payment reminder.
- Early payoff simulation.

## 3.9 Goal

### Tujuan

Goal adalah target finansial yang ingin dicapai pengguna.

### Tanggung Jawab

- Menyimpan target amount dan target date.
- Menampilkan progres.
- Membantu perencanaan finansial.
- Menjadi motivasi kebiasaan finansial.

### Data Utama

- Goal ID.
- Workspace ID.
- Nama goal.
- Target amount.
- Current progress.
- Target date.
- Status.
- Priority.

### Hubungan dengan Domain Lain

- Goal berada dalam Workspace.
- Goal dapat membaca Transaction atau Wallet allocation.
- Goal dibaca oleh Dashboard, Report, Financial Insight, dan AI.

### Aturan Bisnis

- Goal tidak boleh langsung mengurangi saldo Wallet.
- Progress Goal harus berasal dari mekanisme yang jelas.
- Goal dapat diselesaikan, dibatalkan, atau diarsipkan.
- Goal tidak boleh dianggap transaksi aktual.

### Contoh Penggunaan

Pengguna membuat Goal "Dana Darurat" sebesar Rp30.000.000 dengan target 12 bulan.

### Future Development

- Auto-saving allocation.
- Shared family goal.
- Goal recommendation.
- Milestone tracking.

## 3.10 Subscription

### Tujuan

Subscription merepresentasikan status plan SaaS pengguna atau Workspace.

### Tanggung Jawab

- Menentukan akses free, premium, atau family premium.
- Menyimpan status billing.
- Menjadi dasar entitlement fitur.
- Mendukung upgrade, downgrade, dan cancellation.

### Data Utama

- Subscription ID.
- Workspace ID atau User ID.
- Plan.
- Status.
- Billing provider ID.
- Current period start.
- Current period end.
- Trial status.

### Hubungan dengan Domain Lain

- Subscription dapat terkait Workspace.
- Subscription mengatur akses Feature, AI, Export, Family, dan Premium Insight.
- Subscription dibaca oleh frontend dan backend guard.

### Aturan Bisnis

- Free user tetap harus mendapatkan manfaat inti.
- Downgrade tidak boleh menghapus data.
- Premium entitlement harus konsisten di frontend dan backend.
- Billing state harus dapat diaudit.

### Contoh Penggunaan

Pengguna meng-upgrade workspace ke Family Premium untuk mengundang pasangan dan menggunakan shared budget.

### Future Development

- Annual plan.
- Trial.
- Grace period.
- Add-on.

## 3.11 Recurring Transaction

### Tujuan

Recurring Transaction merepresentasikan pola transaksi berulang.

### Tanggung Jawab

- Menyimpan jadwal transaksi berulang.
- Membantu otomatisasi pencatatan.
- Menjadi dasar reminder atau auto-create transaction.
- Membantu cashflow prediction.

### Data Utama

- Recurring Transaction ID.
- Workspace ID.
- Wallet ID.
- Category ID.
- Amount.
- Frequency.
- Start date.
- End date.
- Next occurrence date.
- Mode: reminder atau auto-create.

### Hubungan dengan Domain Lain

- Recurring Transaction berada dalam Workspace.
- Dapat menghasilkan Transaction.
- Dapat menghasilkan Reminder dan Notification.
- Dibaca oleh Cashflow, Report, AI, dan Dashboard.

### Aturan Bisnis

- Recurring Transaction bukan Transaction aktual sampai kejadian dibuat.
- Auto-create harus memiliki aturan yang jelas.
- Pengguna harus dapat menjeda atau mengakhiri recurring rule.

### Contoh Penggunaan

Pengguna membuat recurring transaction untuk gaji bulanan atau pembayaran subscription streaming.

### Future Development

- Smart recurring detection.
- Subscription manager integration.
- Forecast recurring cashflow.

## 3.12 Reminder

### Tujuan

Reminder membantu pengguna mengingat tindakan finansial yang perlu dilakukan.

### Tanggung Jawab

- Menyimpan jadwal pengingat.
- Menghubungkan pengingat dengan Debt, Budget, Goal, atau Recurring Transaction.
- Menjadi input Notification.

### Data Utama

- Reminder ID.
- Workspace ID.
- User ID.
- Related domain.
- Reminder date.
- Message.
- Status.

### Hubungan dengan Domain Lain

- Reminder dapat terkait Debt, Goal, Budget, Recurring Transaction, Approval, atau Family Meeting.
- Reminder menghasilkan Notification.

### Aturan Bisnis

- Reminder tidak mengubah data finansial.
- Reminder harus dapat dimatikan atau disesuaikan pengguna.
- Reminder harus menghormati preferensi Notification.

### Contoh Penggunaan

Pengguna menerima reminder pembayaran cicilan tiga hari sebelum jatuh tempo.

### Future Development

- Smart reminder.
- Behavior-based reminder.
- Calendar integration.

## 3.13 Notification

### Tujuan

Notification adalah pesan sistem yang dikirim kepada pengguna.

### Tanggung Jawab

- Menyampaikan informasi penting.
- Memberi tahu perubahan status.
- Menyampaikan reminder.
- Mendukung engagement pengguna.

### Data Utama

- Notification ID.
- User ID.
- Workspace ID.
- Type.
- Title.
- Message.
- Read status.
- Created at.

### Hubungan dengan Domain Lain

- Notification dapat berasal dari Reminder, Approval, Budget, Debt, AI Insight, atau Subscription.

### Aturan Bisnis

- Notification tidak boleh mengubah data finansial.
- Notification harus relevan dan tidak berlebihan.
- Pengguna harus dapat mengatur preferensi notification.

### Contoh Penggunaan

Pengguna menerima notifikasi bahwa budget makanan sudah mencapai 80 persen.

### Future Development

- Push notification PWA.
- Email notification.
- Notification digest.

## 3.14 Report

### Tujuan

Report menyajikan ringkasan finansial berdasarkan data domain lain.

### Tanggung Jawab

- Menampilkan laporan pemasukan, pengeluaran, budget, hutang, dan goal.
- Mendukung export.
- Menjadi dasar review bulanan.

### Data Utama

- Report ID jika disimpan.
- Workspace ID.
- Report type.
- Period.
- Generated data.
- Generated at.

### Hubungan dengan Domain Lain

- Report membaca Transaction, Wallet, Budget, Debt, Goal, Category, dan Subscription.
- Report dapat digunakan oleh Dashboard dan AI.

### Aturan Bisnis

- Report bukan sumber data finansial utama.
- Report harus dapat ditelusuri ke data sumber.
- Report yang disimpan harus memiliki waktu generate.

### Contoh Penggunaan

Pengguna mengekspor laporan pengeluaran bulanan ke PDF.

### Future Development

- Custom report.
- Scheduled report.
- Family report.
- Tax support future.

## 3.15 Financial Score

### Tujuan

Financial Score adalah indikator ringkas kondisi finansial pengguna atau Workspace.

### Tanggung Jawab

- Menghitung skor berdasarkan data finansial.
- Menjelaskan faktor yang memengaruhi skor.
- Membantu pengguna memahami area perbaikan.

### Data Utama

- Score value.
- Workspace ID.
- Period.
- Score factors.
- Calculation version.
- Generated at.

### Hubungan dengan Domain Lain

- Financial Score membaca Transaction, Budget, Debt, Goal, Wallet, dan Cashflow.
- Financial Score dibaca Dashboard, Financial Insight, AI, dan Report.

### Aturan Bisnis

- Financial Score tidak boleh diinput manual.
- Financial Score harus dihitung dari data dan formula yang terdokumentasi.
- Score harus menjelaskan faktor utama, bukan hanya angka.

### Contoh Penggunaan

Vinari menampilkan skor 72 dengan penjelasan bahwa pengeluaran terkendali tetapi rasio hutang masih tinggi.

### Future Development

- Score model versioning.
- Personalized score.
- Family financial score.

## 3.16 Financial Insight

### Tujuan

Financial Insight menjelaskan pola, anomali, risiko, atau peluang dari data finansial.

### Tanggung Jawab

- Memberikan penjelasan terhadap data.
- Menyoroti perubahan penting.
- Membantu pengguna mengambil tindakan.
- Menjadi output dari analytics atau AI.

### Data Utama

- Insight ID.
- Workspace ID.
- Type.
- Source data reference.
- Message.
- Severity.
- Generated by: system atau AI.
- Generated at.

### Hubungan dengan Domain Lain

- Financial Insight membaca Transaction, Budget, Debt, Goal, Financial Score, dan Report.
- Financial Insight dapat ditampilkan di Dashboard.
- Financial Insight dapat dibuat oleh AI.

### Aturan Bisnis

- Insight harus memiliki sumber data.
- Insight tidak boleh mengarang data.
- Insight harus dapat diabaikan, disimpan, atau ditindaklanjuti jika relevan.

### Contoh Penggunaan

Sistem memberi insight bahwa pengeluaran transportasi naik 35 persen dibanding bulan lalu.

### Future Development

- AI insight personalization.
- Insight action tracking.
- Insight quality scoring.

## 3.17 Financial Decision

### Tujuan

Financial Decision merepresentasikan keputusan atau simulasi finansial yang dipertimbangkan pengguna.

### Tanggung Jawab

- Menyimpan skenario keputusan.
- Menghitung dampak terhadap cashflow, budget, debt, atau goal.
- Membantu pengguna membandingkan opsi.

### Data Utama

- Decision ID.
- Workspace ID.
- Decision type.
- Scenario input.
- Simulation result.
- Status.
- Created at.

### Hubungan dengan Domain Lain

- Financial Decision membaca Transaction, Wallet, Budget, Debt, Goal, dan Financial Score.
- Financial Decision dapat menggunakan AI untuk penjelasan.
- Financial Decision dapat muncul di Dashboard jika masih aktif.

### Aturan Bisnis

- Financial Decision bukan transaksi aktual.
- Simulasi tidak boleh mengubah saldo.
- Hasil simulasi harus diberi label sebagai estimasi.
- Pengguna tetap menjadi pengambil keputusan akhir.

### Contoh Penggunaan

Pengguna mensimulasikan apakah aman membeli motor dengan cicilan tertentu.

### Future Development

- Decision Simulator.
- Scenario comparison.
- What-if engine.
- Risk analysis.

## 3.18 Family

### Tujuan

Family adalah konteks kolaborasi finansial untuk pasangan atau keluarga.

### Tanggung Jawab

- Mengelola struktur keluarga dalam Workspace.
- Mendukung pengaturan role keluarga.
- Mendukung shared budget, shared goal, dan approval.

### Data Utama

- Family ID.
- Workspace ID.
- Family name.
- Owner.
- Family settings.

### Hubungan dengan Domain Lain

- Family berada dalam Workspace.
- Family memiliki Member.
- Family menggunakan Approval, Budget, Goal, Report, dan Notification.

### Aturan Bisnis

- Family hanya aktif pada workspace yang mendukung kolaborasi.
- Family data harus dilindungi oleh permission.
- Owner atau role tertentu dapat mengundang anggota.

### Contoh Penggunaan

Suami dan istri menggunakan Family Workspace untuk mengelola budget rumah tangga.

### Future Development

- Child role.
- Family financial meeting.
- Family report.

## 3.19 Member

### Tujuan

Member adalah representasi User dalam sebuah Workspace atau Family.

### Tanggung Jawab

- Menentukan siapa yang dapat mengakses Workspace.
- Menyimpan role dan permission.
- Menjadi dasar audit aktivitas kolaboratif.

### Data Utama

- Member ID.
- Workspace ID.
- User ID.
- Role.
- Status.
- Joined at.

### Hubungan dengan Domain Lain

- Member menghubungkan User dan Workspace.
- Member digunakan oleh Approval, Notification, Settings, dan Audit.

### Aturan Bisnis

- User harus menjadi Member aktif untuk mengakses Workspace.
- Role menentukan permission.
- Member yang keluar tidak boleh kehilangan audit history.

### Contoh Penggunaan

Seorang pasangan menjadi Member dengan role "Editor" yang dapat membuat transaksi tetapi tidak mengubah billing.

### Future Development

- Custom role.
- Permission matrix.
- Invite expiration.

## 3.20 Approval

### Tujuan

Approval adalah proses persetujuan untuk tindakan finansial tertentu.

### Tanggung Jawab

- Mengatur pengeluaran atau perubahan yang membutuhkan persetujuan.
- Mencatat status persetujuan.
- Menjaga transparansi family workspace.

### Data Utama

- Approval ID.
- Workspace ID.
- Requested by.
- Approved by.
- Related domain.
- Amount.
- Status.
- Reason.
- Created at.
- Resolved at.

### Hubungan dengan Domain Lain

- Approval dapat terkait Transaction, Budget, Goal, atau Debt.
- Approval menggunakan Member dan Notification.

### Aturan Bisnis

- Approval tidak otomatis menjadi Transaction sampai disetujui jika flow produk menetapkan demikian.
- Approval harus memiliki requester.
- Approval harus memiliki status.
- Approval yang ditolak tidak boleh mengubah data finansial.

### Contoh Penggunaan

Anggota keluarga mengajukan pengeluaran Rp2.000.000 dan owner menyetujui sebelum transaksi dibuat.

### Future Development

- Approval rules.
- Amount threshold.
- Multi-approver.

## 3.21 Settings

### Tujuan

Settings menyimpan preferensi dan konfigurasi User atau Workspace.

### Tanggung Jawab

- Mengatur currency default.
- Mengatur notification preference.
- Mengatur privacy preference.
- Mengatur workspace behavior.

### Data Utama

- Settings ID.
- User ID atau Workspace ID.
- Key.
- Value.
- Updated at.

### Hubungan dengan Domain Lain

- Settings dapat memengaruhi Notification, Reminder, Dashboard, AI, dan Workspace.

### Aturan Bisnis

- Settings tidak boleh melewati batas security.
- Settings yang memengaruhi Workspace harus hanya dapat diubah role berwenang.
- Default settings harus tersedia untuk user baru.

### Contoh Penggunaan

Pengguna mengatur currency default ke IDR dan mematikan reminder tertentu.

### Future Development

- Advanced privacy settings.
- AI personalization settings.
- Workspace policy settings.

## 3.22 AI

### Tujuan

AI membantu pengguna memahami data finansial, menemukan insight, dan mempertimbangkan keputusan.

### Tanggung Jawab

- Membaca data yang diizinkan.
- Menghasilkan insight dan penjelasan.
- Membantu kategorisasi.
- Membantu simulasi keputusan.
- Menjelaskan risiko dan peluang.

### Data Utama

- AI request.
- AI response.
- Context scope.
- Source reference.
- Generated insight.
- User feedback.

### Hubungan dengan Domain Lain

- AI membaca Transaction, Budget, Debt, Goal, Report, Financial Score, dan Settings.
- AI dapat menghasilkan Financial Insight.
- AI dapat membantu Financial Decision.
- AI tidak menjadi source of truth data finansial.

### Aturan Bisnis

- AI tidak boleh mengubah data transaksi.
- AI tidak boleh mengarang data.
- AI harus menjelaskan keterbatasan.
- AI harus menghormati permission Workspace.
- AI tidak boleh memberikan klaim nasihat finansial profesional tersertifikasi tanpa dasar compliance.

### Contoh Penggunaan

AI menjelaskan bahwa pengeluaran makanan meningkat dan menyarankan pengguna meninjau budget kategori tersebut.

### Future Development

- AI Financial Advisor.
- AI categorization.
- AI scenario explanation.
- AI coaching.

# BAB 4. Hubungan Antar Domain

## 4.1 Alur Domain Finansial Utama

```text
Workspace
  |
  v
Wallet
  |
  v
Transaction
  |
  v
Budget
  |
  v
Cashflow
  |
  v
Financial Score
  |
  v
Decision Engine
  |
  v
Dashboard
```

## 4.2 Penjelasan Alur

Workspace adalah konteks utama. Semua data finansial berada di bawah Workspace.

Wallet menyimpan konteks tempat uang berada. Transaction menggunakan Wallet untuk mencatat peristiwa finansial aktual. Transaction kemudian menjadi sumber utama untuk menghitung Budget actual, cashflow, Report, Financial Score, dan Dashboard.

Budget tidak mengubah Transaction. Budget membaca Transaction untuk membandingkan rencana dan realisasi.

Cashflow adalah hasil analisis dari Transaction, Recurring Transaction, Wallet, Budget, dan Debt. Cashflow dapat digunakan untuk Financial Score dan Financial Decision.

Financial Score adalah hasil kalkulasi dari data finansial. Score tidak diinput manual dan tidak menjadi sumber data aktual.

Decision Engine atau Financial Decision membaca data finansial dan membuat simulasi. Simulasi tidak mengubah data aktual kecuali pengguna memutuskan melakukan aksi nyata seperti membuat Transaction, Budget, atau Goal.

Dashboard adalah lapisan presentasi. Dashboard membaca domain lain dan tidak menjadi sumber kebenaran.

## 4.3 Hubungan Kolaborasi Family

```text
Workspace
  |
  v
Family
  |
  v
Member
  |
  v
Approval
  |
  v
Transaction / Budget / Goal
```

Family menggunakan Workspace sebagai boundary data. Member menentukan siapa yang dapat melakukan aksi. Approval mengontrol tindakan tertentu sebelum menjadi data finansial aktual.

## 4.4 Hubungan AI dan Insight

```text
Transaction + Budget + Debt + Goal + Report
              |
              v
        Financial Score
              |
              v
              AI
              |
              v
      Financial Insight
              |
              v
          Dashboard
```

AI membaca data yang diizinkan dan menghasilkan Financial Insight. AI tidak boleh menjadi sumber data aktual, tidak boleh mengubah transaksi, dan tidak boleh membuat klaim yang tidak didukung data.

# BAB 5. Domain Ownership

## 5.1 Source of Truth

| Domain       | Status Ownership                      | Penjelasan                                                        |
| ------------ | ------------------------------------- | ----------------------------------------------------------------- |
| Workspace    | Source of Truth konteks data          | Menentukan boundary dan ownership data                            |
| User         | Source of Truth identitas             | Menentukan identitas pengguna                                     |
| Member       | Source of Truth akses workspace       | Menentukan role dan permission                                    |
| Wallet       | Source of Truth struktur akun         | Menentukan tempat uang dicatat                                    |
| Transaction  | Source of Truth data finansial aktual | Menjadi sumber utama laporan, budget actual, score, dan dashboard |
| Category     | Source of Truth klasifikasi           | Menentukan pengelompokan transaksi                                |
| Debt         | Source of Truth kewajiban             | Menyimpan informasi hutang                                        |
| Debt Payment | Source of Truth pembayaran hutang     | Menghubungkan pembayaran hutang dengan transaksi                  |
| Goal         | Source of Truth target finansial      | Menyimpan rencana dan progres target                              |
| Subscription | Source of Truth akses premium         | Menentukan plan dan entitlement                                   |
| Settings     | Source of Truth preferensi            | Menyimpan konfigurasi user atau workspace                         |

## 5.2 Derived Domain

| Domain             | Status                  | Penjelasan                                            |
| ------------------ | ----------------------- | ----------------------------------------------------- |
| Budget             | Planning domain         | Bukan sumber transaksi aktual, tetapi sumber rencana  |
| Report             | Derived read model      | Membaca dan merangkum data                            |
| Financial Score    | Derived calculation     | Dihitung dari data finansial                          |
| Financial Insight  | Derived explanation     | Dihasilkan dari analisis data                         |
| Financial Decision | Simulation domain       | Membuat skenario, bukan data aktual                   |
| Dashboard          | Presentation read model | Hanya membaca data                                    |
| AI                 | Intelligence layer      | Membaca dan menjelaskan, bukan sumber data            |
| Notification       | Communication domain    | Menyampaikan informasi, bukan mengubah data finansial |
| Reminder           | Engagement domain       | Mengingatkan tindakan, bukan transaksi aktual         |

## 5.3 Prinsip Ownership

- Transaction adalah sumber utama seluruh data finansial aktual.
- Dashboard bukan sumber data.
- AI bukan sumber data.
- Budget bukan sumber data aktual.
- Financial Score bukan input manual.
- Report harus dapat ditelusuri ke data sumber.
- Subscription adalah sumber akses premium, bukan UI state.

# BAB 6. Domain Dependency

## 6.1 Matriks Dependency

| Domain                | Bergantung Pada                         | Digunakan Oleh                       |
| --------------------- | --------------------------------------- | ------------------------------------ |
| User                  | Auth provider                           | Workspace, Member, Settings          |
| Workspace             | User                                    | Semua domain workspace-scoped        |
| Member                | User, Workspace                         | Family, Approval, Permission         |
| Wallet                | Workspace                               | Transaction, Report, Dashboard       |
| Category              | Workspace                               | Transaction, Budget, Report          |
| Transaction           | Workspace, Wallet, Category             | Budget, Report, Score, AI, Dashboard |
| Budget                | Workspace, Category, Transaction        | Report, Score, Dashboard, AI         |
| Debt                  | Workspace, Wallet                       | Debt Payment, Score, Report          |
| Debt Payment          | Debt, Transaction                       | Report, Score, Dashboard             |
| Goal                  | Workspace                               | Dashboard, Insight, AI               |
| Subscription          | User atau Workspace                     | Entitlement, Premium Features        |
| Recurring Transaction | Workspace, Wallet, Category             | Transaction, Reminder, Cashflow      |
| Reminder              | User, Workspace, Related Domain         | Notification                         |
| Notification          | User, Workspace                         | UI, PWA                              |
| Report                | Transaction, Wallet, Budget, Debt, Goal | Dashboard, Export, AI                |
| Financial Score       | Transaction, Budget, Debt, Goal         | Dashboard, Insight, AI               |
| Financial Insight     | Source Data, AI atau Rules              | Dashboard, Notification              |
| Financial Decision    | Wallet, Transaction, Budget, Debt, Goal | AI, Dashboard                        |
| Family                | Workspace                               | Member, Approval, Shared Features    |
| Approval              | Member, Workspace, Related Domain       | Transaction, Notification            |
| Settings              | User atau Workspace                     | Notification, AI, UI                 |
| AI                    | Data yang diizinkan                     | Insight, Decision Support            |

## 6.2 Prinsip Dependency

- Domain core tidak boleh bergantung pada domain presentasi.
- Transaction tidak boleh bergantung pada Dashboard.
- Wallet tidak boleh bergantung pada Report.
- AI boleh membaca data, tetapi tidak boleh menjadi dependency wajib untuk pencatatan manual.
- Premium entitlement boleh membatasi fitur, tetapi tidak boleh merusak integritas data.
- Dashboard harus menjadi consumer, bukan owner.

# BAB 7. Business Rules

## 7.1 Aturan Umum

- Semua data finansial wajib memiliki Workspace.
- Semua akses data Workspace harus melalui membership atau ownership.
- Semua domain yang menyimpan data harus memiliki ownership yang jelas.
- Semua perubahan penting harus dapat diaudit.
- Semua fitur premium harus memeriksa entitlement.

## 7.2 Aturan Transaction

- Transaction adalah sumber utama data finansial aktual.
- Semua Transaction wajib memiliki Workspace.
- Income harus menambah saldo Wallet.
- Expense harus mengurangi saldo Wallet.
- Transfer selalu memengaruhi dua Wallet.
- Transfer tidak boleh menggunakan Wallet asal dan tujuan yang sama.
- Amount harus lebih besar dari nol.
- Transaction date wajib ada.
- AI tidak boleh mengubah Transaction.

## 7.3 Aturan Wallet

- Wallet wajib berada dalam Workspace.
- Wallet archived tidak boleh digunakan untuk Transaction baru.
- Saldo Wallet harus dapat ditelusuri dari opening balance dan Transaction.
- Perubahan saldo manual harus menggunakan adjustment yang diaudit.

## 7.4 Aturan Budget

- Budget bukan sumber data aktual.
- Budget tidak boleh mengubah saldo Wallet.
- Budget actual harus dihitung dari Transaction.
- Budget harus memiliki periode.
- Budget harus terkait Workspace.

## 7.5 Aturan Debt dan Debt Payment

- Debt Payment selalu menghasilkan Transaction atau terhubung dengan Transaction.
- Debt tidak boleh berkurang tanpa Debt Payment atau adjustment yang diaudit.
- Payment amount harus lebih besar dari nol.
- Debt payoff simulation adalah estimasi.

## 7.6 Aturan Goal

- Goal tidak boleh langsung mengurangi saldo.
- Goal bukan Transaction.
- Progress Goal harus memiliki sumber perhitungan yang jelas.
- Goal dapat bersifat personal atau shared sesuai Workspace dan permission.

## 7.7 Aturan Financial Score

- Financial Score tidak boleh diinput manual.
- Financial Score harus dihitung dari data finansial.
- Formula score harus terdokumentasi.
- Score harus menjelaskan faktor yang memengaruhi hasil.

## 7.8 Aturan AI

- AI tidak boleh mengubah data transaksi.
- AI tidak boleh mengarang data.
- AI hanya boleh membaca data yang diizinkan.
- AI harus menghormati Workspace permission.
- AI harus memberi label bahwa output adalah bantuan, bukan kepastian mutlak.
- AI tidak boleh menjadi sumber kebenaran data finansial.

## 7.9 Aturan Dashboard dan Report

- Dashboard hanya membaca data.
- Dashboard bukan sumber data.
- Report harus dapat ditelusuri ke Transaction, Wallet, Budget, Debt, Goal, atau domain sumber lain.
- Export harus mengikuti permission dan entitlement.

## 7.10 Aturan Family dan Approval

- Family workspace wajib memiliki Member dan role.
- Member harus aktif untuk mengakses Family Workspace.
- Approval yang ditolak tidak boleh mengubah data finansial.
- Approval harus mencatat requester, status, dan waktu.
- Pengeluaran yang membutuhkan approval harus mengikuti policy Workspace.

## 7.11 Aturan Subscription

- Free user tetap harus mendapatkan manfaat inti.
- Premium memberikan nilai tambah, bukan menghapus fungsi dasar secara tidak adil.
- Downgrade tidak boleh menghapus data pengguna.
- Entitlement harus konsisten di backend dan frontend.
- Billing state harus dapat diaudit.

# BAB 8. Future Domain

## 8.1 Investment

Domain Investment dapat digunakan untuk mencatat aset investasi seperti saham, reksadana, obligasi, atau crypto. Domain ini belum menjadi prioritas karena memiliki kompleksitas valuasi, risiko pasar, dan potensi regulasi.

## 8.2 Insurance

Domain Insurance dapat digunakan untuk mengelola polis, premi, manfaat, jatuh tempo, dan coverage keluarga.

## 8.3 Tax

Domain Tax dapat membantu pengguna menyiapkan ringkasan pajak atau laporan keuangan tertentu. Domain ini membutuhkan perhatian compliance dan lokalisasi.

## 8.4 Payroll Personal

Domain Payroll Personal dapat digunakan untuk pengguna yang mengelola pemasukan rutin, bonus, potongan, dan benefit pekerjaan.

## 8.5 Asset Management

Domain Asset Management dapat digunakan untuk mencatat aset seperti properti, kendaraan, barang bernilai, dan depresiasi sederhana.

## 8.6 Financial Vault

Financial Vault dapat menjadi tempat menyimpan dokumen finansial penting seperti kontrak, polis, bukti pembayaran, atau dokumen keluarga.

## 8.7 Financial Timeline

Financial Timeline dapat menampilkan sejarah finansial pengguna dari waktu ke waktu, termasuk milestone, hutang lunas, target tercapai, dan keputusan besar.

## 8.8 Decision Simulator

Decision Simulator adalah pengembangan lanjut dari Financial Decision untuk membuat simulasi yang lebih kuat, seperti membeli rumah, mengambil cicilan, pindah kerja, atau menambah anggota keluarga.

## 8.9 Business Workspace

Business Workspace dapat mendukung kebutuhan UMKM ringan, seperti cashflow usaha, kategori usaha, export laporan, dan pemisahan personal-business.

## 8.10 Shared Financial Contract

Domain ini dapat digunakan untuk mencatat kesepakatan finansial keluarga atau pasangan, seperti kontribusi bulanan, pembagian pengeluaran, atau aturan approval.

# BAB 9. Kesimpulan

Domain Model ini menjadi acuan seluruh pengembangan Vinari.

Seluruh database, ERD, API, backend, frontend, AI, dashboard, report, dan testing harus mengikuti pemahaman domain yang tertulis dalam dokumen ini. Database tidak boleh menentukan logika produk secara sepihak. UI tidak boleh menciptakan aturan bisnis sendiri. AI tidak boleh menjadi sumber data. Dashboard tidak boleh menyimpan kebenaran finansial.

Vinari harus dibangun dari domain bisnis yang jelas:

- Workspace sebagai boundary.
- Transaction sebagai sumber utama data finansial aktual.
- Wallet sebagai konteks tempat uang berada.
- Budget, Debt, dan Goal sebagai domain planning.
- Report, Financial Score, dan Financial Insight sebagai domain turunan.
- AI sebagai layer bantuan dan penjelasan.
- Dashboard sebagai read model.
- Subscription sebagai pengatur akses premium.
- Family, Member, dan Approval sebagai fondasi kolaborasi.

Dengan Domain Model ini, Vinari dapat berkembang sebagai Personal & Family Financial Operating System yang konsisten, aman, scalable, dan siap untuk pengembangan jangka panjang.

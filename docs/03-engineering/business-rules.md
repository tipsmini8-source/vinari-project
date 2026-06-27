# Business Rule Book Vinari

## Status Dokumen

| Atribut      | Keterangan                               |
| ------------ | ---------------------------------------- |
| Nama Dokumen | Business Rule Book Vinari                |
| Produk       | Vinari Project                           |
| Bahasa       | Indonesia                                |
| Status       | Draft Foundation                         |
| Pemilik      | Product & Engineering Team               |
| Fungsi Utama | Kitab hukum seluruh aturan bisnis Vinari |

# BAB 1. Pendahuluan

## Apa itu Business Rule

Business Rule adalah aturan formal yang menentukan bagaimana sistem Vinari harus berperilaku dalam konteks bisnis, produk, data, keamanan, UI, AI, dan operasional. Business Rule menjelaskan apa yang boleh, tidak boleh, wajib, dan harus divalidasi oleh sistem.

Business Rule bukan sekadar catatan teknis. Business Rule adalah kontrak bisnis yang harus dipatuhi oleh domain model, engine, database, API, frontend, dashboard, AI, testing, dan dokumentasi.

## Mengapa Business Rule Lebih Penting daripada Implementasi

Implementasi dapat berubah. Framework dapat berubah. Struktur database dapat berevolusi. Namun aturan bisnis yang menjaga kebenaran data finansial, keamanan pengguna, dan konsistensi produk harus tetap menjadi acuan utama.

Jika terdapat konflik antara kode, desain UI, endpoint API, struktur database, atau output AI dengan Business Rule Book ini, maka Business Rule Book menjadi acuan sampai aturan diperbarui melalui proses review.

# BAB 2. Prinsip Umum

| Prinsip                | Penjelasan                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Single Source of Truth | Setiap angka atau status utama harus memiliki sumber kebenaran yang jelas.                  |
| Auditability           | Semua perubahan penting harus dapat ditelusuri ke aktor, waktu, alasan, dan data sumber.    |
| Consistency            | Perhitungan yang sama harus menghasilkan angka yang sama di dashboard, report, API, dan AI. |
| Workspace Isolation    | Data antar workspace harus terisolasi secara ketat.                                         |
| Security by Default    | Keamanan harus menjadi perilaku default, bukan tambahan.                                    |
| Data Integrity         | Data finansial harus valid, konsisten, dan tidak boleh berubah tanpa aturan yang jelas.     |

# BAB 3. Business Rules Workspace

| Kode     | Judul                 | Deskripsi                                               | Alasan                                       | Contoh                                  | Dampak                     |
| -------- | --------------------- | ------------------------------------------------------- | -------------------------------------------- | --------------------------------------- | -------------------------- |
| RULE-001 | Workspace Wajib       | Semua data finansial wajib berada dalam workspace.      | Workspace adalah boundary data.              | Transaction memiliki workspace_id.      | Data terisolasi.           |
| RULE-002 | Owner Workspace       | Setiap workspace wajib memiliki owner.                  | Mencegah data tanpa penanggung jawab.        | User pembuat menjadi owner.             | Akses jelas.               |
| RULE-003 | Akses Member          | Hanya member aktif yang boleh mengakses workspace.      | Menjaga privasi.                             | Mantan member ditolak.                  | Kebocoran data dicegah.    |
| RULE-004 | Tipe Workspace        | Workspace harus memiliki tipe.                          | Mendukung personal, family, future business. | personal atau family.                   | Fitur dapat dikontrol.     |
| RULE-005 | Default Currency      | Workspace wajib memiliki default currency.              | Perhitungan butuh konteks mata uang.         | IDR sebagai default.                    | Laporan konsisten.         |
| RULE-006 | Isolasi Data          | Data workspace tidak boleh tercampur.                   | Keamanan dan akurasi.                        | Budget family tidak muncul di personal. | Integritas akses.          |
| RULE-007 | Invite Terbatas       | Undangan hanya dapat dibuat role berwenang.             | Mencegah akses sembarang.                    | Owner mengundang pasangan.              | Kontrol kolaborasi.        |
| RULE-008 | Status Workspace      | Workspace harus memiliki status aktif atau archived.    | Mengatur lifecycle.                          | Workspace lama diarsipkan.              | Data historis tetap aman.  |
| RULE-009 | Archive Aman          | Workspace archived tidak boleh menerima data baru.      | Mencegah perubahan tak sengaja.              | Transaction baru ditolak.               | Histori stabil.            |
| RULE-010 | Delete Terkontrol     | Penghapusan workspace wajib memiliki kebijakan retensi. | Data finansial sensitif.                     | Soft delete sebelum purge.              | Audit tetap tersedia.      |
| RULE-011 | Role Didefinisikan    | Setiap member wajib memiliki role.                      | Permission bergantung role.                  | Owner, editor, viewer.                  | Hak akses jelas.           |
| RULE-012 | Transfer Ownership    | Transfer owner harus eksplisit.                         | Mencegah kehilangan kontrol.                 | Owner lama memilih owner baru.          | Workspace tetap terkelola. |
| RULE-013 | Workspace Context     | UI harus menampilkan workspace aktif.                   | Mengurangi salah input.                      | Label workspace di header.              | Pengguna tidak bingung.    |
| RULE-014 | Entitlement Workspace | Fitur premium workspace mengikuti subscription terkait. | Fitur family perlu plan.                     | Family premium aktif.                   | Akses premium konsisten.   |
| RULE-015 | Audit Aktivitas       | Aktivitas penting workspace harus diaudit.              | Transparansi kolaborasi.                     | Invite member dicatat.                  | Investigasi mudah.         |
| RULE-016 | Batas Member          | Jumlah member dapat dibatasi plan.                      | Mendukung monetisasi.                        | Free hanya owner.                       | Premium bernilai.          |
| RULE-017 | Workspace Name        | Nama workspace wajib valid dan tidak kosong.            | Identifikasi pengguna.                       | "Keuangan Keluarga".                    | UX jelas.                  |
| RULE-018 | Workspace Settings    | Pengaturan workspace hanya diubah role berwenang.       | Menghindari perubahan liar.                  | Currency diubah owner.                  | Konsistensi data.          |
| RULE-019 | Leave Workspace       | User keluar tidak menghapus data historis.              | Audit dan integritas.                        | Transaksi lama tetap ada.               | Laporan tidak rusak.       |
| RULE-020 | Workspace Scope Query | Semua query finansial wajib scoped ke workspace.        | Mencegah data bocor.                         | API filter workspace_id.                | Security terjaga.          |

# BAB 4. Business Rules Wallet

| Kode     | Judul                  | Deskripsi                                                           | Alasan                                  | Contoh                                 | Dampak                    |
| -------- | ---------------------- | ------------------------------------------------------------------- | --------------------------------------- | -------------------------------------- | ------------------------- |
| RULE-021 | Wallet Wajib Workspace | Wallet wajib memiliki workspace_id.                                 | Wallet adalah data finansial workspace. | Wallet BCA di personal.                | Isolasi data.             |
| RULE-022 | Nama Wallet            | Wallet wajib memiliki nama.                                         | Memudahkan identifikasi.                | Cash, BCA, GoPay.                      | UX jelas.                 |
| RULE-023 | Tipe Wallet            | Wallet wajib memiliki tipe.                                         | Perhitungan berbeda per tipe.           | cash, bank, e-wallet.                  | Laporan akurat.           |
| RULE-024 | Currency Wallet        | Wallet wajib memiliki currency.                                     | Nominal perlu konteks.                  | IDR.                                   | Perhitungan benar.        |
| RULE-025 | Initial Balance        | Wallet boleh memiliki initial balance.                              | Titik awal perhitungan saldo.           | Saldo awal Rp1.000.000.                | Balance dapat dihitung.   |
| RULE-026 | Balance Derived        | Wallet balance harus dihitung dari initial balance dan transaction. | Mencegah angka palsu.                   | Income menambah saldo.                 | Auditability.             |
| RULE-027 | No Manual Balance      | Saldo tidak boleh diedit langsung.                                  | Mencegah data tidak terlacak.           | Gunakan adjustment.                    | Data valid.               |
| RULE-028 | Adjustment Reason      | Koreksi wallet wajib memiliki alasan.                               | Audit perubahan.                        | "Koreksi saldo awal".                  | Review mudah.             |
| RULE-029 | Wallet Aktif           | Hanya wallet aktif boleh dipakai transaksi baru.                    | Menghindari input ke akun lama.         | Wallet archived ditolak.               | Histori aman.             |
| RULE-030 | Archive Wallet         | Wallet yang punya transaksi sebaiknya diarsipkan, bukan dihapus.    | Menjaga histori.                        | Wallet lama archived.                  | Report tetap valid.       |
| RULE-031 | Delete Wallet Kosong   | Wallet tanpa transaksi dapat dihapus sesuai permission.             | Mengurangi clutter.                     | Wallet salah buat dihapus.             | Data bersih.              |
| RULE-032 | Wallet Transfer        | Transfer internal harus menggunakan dua wallet.                     | Uang berpindah tempat.                  | BCA ke Cash.                           | Balance benar.            |
| RULE-033 | Same Wallet Transfer   | Transfer ke wallet yang sama harus ditolak.                         | Tidak ada perubahan finansial.          | BCA ke BCA ditolak.                    | Data bersih.              |
| RULE-034 | Wallet Ownership       | Wallet hanya terlihat oleh member berizin.                          | Privasi finansial.                      | Viewer melihat sesuai role.            | Akses aman.               |
| RULE-035 | Wallet Ordering        | Wallet boleh memiliki urutan tampilan.                              | UX personalisasi.                       | Cash di atas.                          | Navigasi nyaman.          |
| RULE-036 | Wallet Icon            | Icon wallet hanya atribut tampilan.                                 | Tidak memengaruhi perhitungan.          | Icon bank.                             | Data core aman.           |
| RULE-037 | Wallet Color           | Warna wallet hanya atribut tampilan.                                | Tidak memengaruhi domain.               | Biru untuk BCA.                        | UI fleksibel.             |
| RULE-038 | Negative Balance       | Negative balance harus mengikuti tipe wallet.                       | Kredit bisa negatif.                    | Cash tidak boleh negatif jika dikunci. | Validasi sesuai konteks.  |
| RULE-039 | Credit Wallet          | Wallet kredit harus diperlakukan sebagai liability jika relevan.    | Net worth akurat.                       | Kartu kredit.                          | Score benar.              |
| RULE-040 | Wallet Reconciliation  | Rekonsiliasi harus menghasilkan adjustment terpisah.                | Audit koreksi.                          | Selisih saldo dicatat.                 | Transparansi.             |
| RULE-041 | Wallet Import          | Import transaksi harus tetap masuk transaction.                     | Transaction source of truth.            | CSV bank.                              | Konsistensi.              |
| RULE-042 | Wallet Limit           | Limit wallet opsional tidak mengganti saldo.                        | Limit adalah metadata.                  | Limit kartu kredit.                    | Perhitungan tidak rancu.  |
| RULE-043 | Wallet Snapshot        | Snapshot wallet bukan source of truth.                              | Hanya performa/histori.                 | Saldo akhir bulan.                     | Audit tetap ke transaksi. |
| RULE-044 | Wallet Multi-Currency  | Multi-currency future wajib punya exchange rule.                    | Agregasi butuh kurs.                    | USD ke IDR.                            | Laporan valid.            |
| RULE-045 | Wallet Audit           | Perubahan wallet penting wajib diaudit.                             | Menjaga jejak.                          | Rename, archive, adjustment.           | Kontrol internal.         |

# BAB 5. Business Rules Transaction

| Kode     | Judul                     | Deskripsi                                                                       | Alasan                                    | Contoh                      | Dampak                    |
| -------- | ------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------- | ------------------------- |
| RULE-046 | Transaction Source        | Transaction adalah source of truth finansial aktual.                            | Semua angka berasal dari transaksi.       | Expense makan.              | Sistem konsisten.         |
| RULE-047 | Transaction Workspace     | Semua transaction wajib memiliki workspace_id.                                  | Isolasi data.                             | Transaction personal.       | Security.                 |
| RULE-048 | Transaction Wallet        | Transaction wajib memiliki wallet_id kecuali draft non-aktual.                  | Saldo butuh wallet.                       | Expense dari Cash.          | Balance benar.            |
| RULE-049 | Transaction Type          | Tipe transaksi wajib valid.                                                     | Logic berbeda.                            | income, expense, transfer.  | Validasi jelas.           |
| RULE-050 | Amount Positive           | Amount wajib lebih besar dari nol.                                              | Nominal negatif membingungkan.            | Rp50.000.                   | Data bersih.              |
| RULE-051 | Transaction Date          | Tanggal transaksi wajib ada.                                                    | Periode laporan.                          | 2026-06-26.                 | Cashflow benar.           |
| RULE-052 | Income Rule               | Income menambah wallet balance.                                                 | Pemasukan meningkatkan saldo.             | Gaji masuk BCA.             | Saldo naik.               |
| RULE-053 | Expense Rule              | Expense mengurangi wallet balance.                                              | Pengeluaran mengurangi saldo.             | Beli makan.                 | Saldo turun.              |
| RULE-054 | Transfer Rule             | Transfer mengurangi sumber dan menambah tujuan.                                 | Uang berpindah tempat.                    | BCA ke Cash.                | Dua saldo berubah.        |
| RULE-055 | Transfer No Income        | Transfer tidak dihitung sebagai income.                                         | Bukan pemasukan baru.                     | Tarik ATM.                  | Laporan benar.            |
| RULE-056 | Transfer No Expense       | Transfer tidak dihitung sebagai expense.                                        | Bukan konsumsi.                           | Bank ke e-wallet.           | Cashflow benar.           |
| RULE-057 | Transfer Fee              | Fee transfer harus dicatat sebagai expense.                                     | Fee adalah biaya.                         | Biaya admin Rp2.500.        | Expense akurat.           |
| RULE-058 | Category Expense          | Expense sebaiknya memiliki category.                                            | Analisis pengeluaran.                     | Makanan.                    | Report bermakna.          |
| RULE-059 | Category Income           | Income sebaiknya memiliki category.                                             | Analisis pemasukan.                       | Gaji.                       | Report lengkap.           |
| RULE-060 | Transfer Category         | Transfer boleh tanpa category atau memakai system category.                     | Tidak termasuk budget biasa.              | Transfer internal.          | Klasifikasi bersih.       |
| RULE-061 | Notes Optional            | Catatan transaksi opsional.                                                     | Tidak semua transaksi butuh memo.         | "Makan siang".              | UX ringan.                |
| RULE-062 | Attachment Optional       | Attachment opsional dan tidak mengubah amount.                                  | Bukti transaksi.                          | Foto struk.                 | Audit visual.             |
| RULE-063 | Attachment Ownership      | Attachment wajib mengikuti permission transaksi.                                | Bukti finansial sensitif.                 | Struk hanya member berizin. | Privasi.                  |
| RULE-064 | Attachment Delete         | Menghapus attachment tidak menghapus transaksi.                                 | Lampiran bukan transaksi.                 | Foto struk dihapus.         | Data finansial tetap.     |
| RULE-065 | Update Recalculate        | Update transaksi wajib memicu recalculation.                                    | Angka turunan berubah.                    | Amount diedit.              | Dashboard akurat.         |
| RULE-066 | Update Audit              | Update transaksi penting wajib diaudit.                                         | Jejak perubahan.                          | Amount lama dan baru.       | Investigasi mudah.        |
| RULE-067 | Delete Strategy           | Delete transaksi harus soft delete atau audit-safe.                             | Histori finansial penting.                | Deleted_at.                 | Audit terjaga.            |
| RULE-068 | Delete Recalculate        | Delete transaksi wajib membalik dampak finansial.                               | Saldo dan report berubah.                 | Expense dihapus.            | Angka benar.              |
| RULE-069 | Backdate Allowed          | Backdate boleh jika role mengizinkan.                                           | Pengguna sering mencatat terlambat.       | Transaksi minggu lalu.      | Fleksibel.                |
| RULE-070 | Backdate Recalculate      | Backdate wajib recalculation periode terkait.                                   | Laporan lampau berubah.                   | Expense bulan lalu.         | Histori akurat.           |
| RULE-071 | Future Date               | Future transaction harus ditandai planned jika belum aktual.                    | Membedakan rencana dan realisasi.         | Tagihan besok.              | Data tidak rancu.         |
| RULE-072 | Duplicate Detection       | Sistem harus mendukung deteksi duplikat.                                        | Menghindari double count.                 | Amount dan tanggal sama.    | Data bersih.              |
| RULE-073 | Duplicate Not Auto Delete | Duplikat tidak boleh dihapus otomatis tanpa aturan.                             | Bisa transaksi valid.                     | Dua kopi sama.              | Mencegah kehilangan data. |
| RULE-074 | Adjustment Type           | Adjustment harus tipe khusus.                                                   | Koreksi bukan income biasa.               | Koreksi saldo.              | Laporan jelas.            |
| RULE-075 | Adjustment Reason         | Adjustment wajib memiliki alasan.                                               | Audit koreksi.                            | "Selisih cash".             | Transparansi.             |
| RULE-076 | Adjustment Permission     | Adjustment hanya role berwenang.                                                | Dampak langsung ke saldo.                 | Owner approve.              | Kontrol.                  |
| RULE-077 | Transaction Currency      | Currency transaction wajib jelas.                                               | Multi-currency future.                    | IDR.                        | Perhitungan aman.         |
| RULE-078 | Workspace Currency        | Currency berbeda harus mengikuti aturan konversi future.                        | Agregasi butuh kurs.                      | USD wallet.                 | Tidak salah hitung.       |
| RULE-079 | Transaction Actor         | Pembuat transaksi harus dicatat.                                                | Audit aktivitas.                          | created_by.                 | Accountability.           |
| RULE-080 | Transaction Import        | Imported transaction tetap tunduk validasi.                                     | Data eksternal bisa salah.                | CSV bank.                   | Kualitas data.            |
| RULE-081 | Transaction Source        | Source transaksi harus dapat dicatat.                                           | Manual, import, recurring, AI suggestion. | source=manual.              | Audit asal.               |
| RULE-082 | Recurring Generated       | Transaksi dari recurring wajib refer ke rule asal.                              | Traceability.                             | recurring_id.               | Debug mudah.              |
| RULE-083 | Debt Payment Link         | Transaksi pembayaran hutang wajib link debt payment jika relevan.               | Debt balance sinkron.                     | Cicilan motor.              | Hutang akurat.            |
| RULE-084 | Goal Contribution Link    | Kontribusi goal wajib link sumber valid.                                        | Progress tidak palsu.                     | Transfer ke wallet goal.    | Goal benar.               |
| RULE-085 | Subscription Payment      | Pembayaran subscription harus dicatat expense jika masuk keuangan user.         | Biaya aktual.                             | Netflix.                    | Cashflow benar.           |
| RULE-086 | Refund Handling           | Refund harus dicatat jelas.                                                     | Mengoreksi expense atau income.           | Pengembalian barang.        | Report akurat.            |
| RULE-087 | Reimbursement             | Reimbursement harus dapat diklasifikasi.                                        | Pengeluaran diganti.                      | Klaim kantor.               | Insight benar.            |
| RULE-088 | Split Future              | Split transaction future harus menjaga total amount.                            | Satu transaksi multi kategori.            | Belanja supermarket.        | Budget akurat.            |
| RULE-089 | Validation Required       | Semua input transaksi wajib divalidasi.                                         | Data finansial sensitif.                  | Amount kosong ditolak.      | Data valid.               |
| RULE-090 | No Silent Failure         | Gagal simpan transaksi harus diberi pesan jelas.                                | UX dan kepercayaan.                       | Error koneksi.              | User paham.               |
| RULE-091 | Permission Create         | Create transaksi mengikuti permission workspace.                                | Kolaborasi aman.                          | Viewer ditolak.             | Akses tepat.              |
| RULE-092 | Permission Update         | Update transaksi mengikuti permission.                                          | Mencegah manipulasi.                      | Editor boleh, viewer tidak. | Data aman.                |
| RULE-093 | Permission Delete         | Delete transaksi mengikuti permission lebih ketat.                              | Risiko tinggi.                            | Owner only.                 | Histori aman.             |
| RULE-094 | Transaction Lock          | Periode closed dapat dikunci future.                                            | Laporan final.                            | Bulan lalu locked.          | Stabilitas report.        |
| RULE-095 | Transaction Auditability  | Setiap transaksi harus dapat ditelusuri ke wallet, workspace, actor, dan waktu. | Kebenaran sistem.                         | Audit detail.               | Trust meningkat.          |

# BAB 6. Business Rules Budget

| Kode     | Judul                 | Deskripsi                                                                  | Alasan                                   | Contoh                             | Dampak               |
| -------- | --------------------- | -------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------- | -------------------- |
| RULE-096 | Budget Workspace      | Budget wajib terkait workspace.                                            | Isolasi planning.                        | Budget personal.                   | Data aman.           |
| RULE-097 | Budget Period         | Budget wajib memiliki periode.                                             | Perbandingan waktu.                      | Juni 2026.                         | Actual jelas.        |
| RULE-098 | Budget Category       | Budget item sebaiknya terkait category.                                    | Actual dihitung dari transaksi kategori. | Makanan.                           | Perhitungan tepat.   |
| RULE-099 | Planned Amount        | Planned amount tidak boleh negatif.                                        | Budget adalah alokasi.                   | Rp2.000.000.                       | Validasi benar.      |
| RULE-100 | Actual Derived        | Actual budget dihitung dari transaction.                                   | Transaction source of truth.             | Expense makanan.                   | Audit.               |
| RULE-101 | Budget No Balance     | Budget tidak mengubah wallet balance.                                      | Rencana bukan uang aktual.               | Buat budget tidak mengurangi cash. | Data tidak rancu.    |
| RULE-102 | Overlap Rule          | Budget periode yang overlap harus punya aturan jelas.                      | Mencegah double count.                   | Dua budget Juni.                   | Report konsisten.    |
| RULE-103 | Budget Status         | Budget memiliki status draft, active, closed, archived.                    | Lifecycle jelas.                         | Active bulan ini.                  | UX rapi.             |
| RULE-104 | Draft Budget          | Draft budget tidak memengaruhi dashboard utama kecuali ditampilkan khusus. | Rencana belum aktif.                     | Budget simulasi.                   | Dashboard bersih.    |
| RULE-105 | Active Budget         | Hanya budget active dihitung untuk periode berjalan.                       | Fokus pengguna.                          | Budget Juni aktif.                 | Summary tepat.       |
| RULE-106 | Closed Budget         | Closed budget tetap terbaca histori.                                       | Review masa lalu.                        | Budget Mei.                        | Trend tersedia.      |
| RULE-107 | Archive Budget        | Archived budget tidak digunakan untuk planning baru.                       | Mengurangi clutter.                      | Budget lama archived.              | Data historis aman.  |
| RULE-108 | Budget Update         | Update budget harus mencatat waktu perubahan.                              | Audit planning.                          | Planned amount diubah.             | Review jelas.        |
| RULE-109 | Budget Delete         | Budget dengan histori sebaiknya diarsipkan.                                | Histori review penting.                  | Budget lama.                       | Insight tidak rusak. |
| RULE-110 | Category Archived     | Budget dengan category archived tetap dapat dihitung historis.             | Report lama valid.                       | Kategori lama.                     | Konsistensi.         |
| RULE-111 | Budget Usage          | Usage = actual / planned.                                                  | Formula standar.                         | 80%.                               | UI konsisten.        |
| RULE-112 | Available Budget      | Available = planned - actual.                                              | Sisa budget.                             | Sisa Rp500.000.                    | Keputusan mudah.     |
| RULE-113 | Zero Budget           | Planned nol butuh tampilan khusus.                                         | Hindari bagi nol.                        | Budget Rp0.                        | Error dicegah.       |
| RULE-114 | Budget Alert          | Alert boleh dibuat saat mendekati batas.                                   | Habit support.                           | 80% usage.                         | User sadar.          |
| RULE-115 | Budget Premium        | Advanced budget dapat menjadi premium.                                     | Monetisasi sehat.                        | Rollover.                          | Value premium.       |
| RULE-116 | Shared Budget         | Shared budget hanya untuk family workspace.                                | Kolaborasi sesuai scope.                 | Budget rumah tangga.               | Permission relevan.  |
| RULE-117 | Budget Permission     | Create/update budget mengikuti role.                                       | Menghindari perubahan sembarang.         | Owner mengubah.                    | Kontrol.             |
| RULE-118 | Budget Currency       | Budget mengikuti currency workspace atau aturan multi-currency.            | Konsistensi angka.                       | IDR.                               | Laporan tepat.       |
| RULE-119 | Budget Template       | Template budget tidak menjadi budget aktif sebelum dibuat.                 | Template bukan data aktual.              | Template 50/30/20.                 | Data bersih.         |
| RULE-120 | Budget Recommendation | Rekomendasi budget tidak boleh auto-apply tanpa konfirmasi.                | User control.                            | AI saran Rp1.5 juta.               | Aman.                |
| RULE-121 | Budget Report         | Report budget harus menyebut periode.                                      | Konteks.                                 | Juni 2026.                         | Tidak ambigu.        |
| RULE-122 | Budget Cashflow       | Budget dapat memengaruhi planning cashflow, bukan actual cashflow.         | Rencana vs realisasi.                    | Budget bulan depan.                | Insight benar.       |
| RULE-123 | Budget Recalculate    | Perubahan transaksi kategori budget memicu recalculation.                  | Actual berubah.                          | Expense diedit.                    | Data akurat.         |
| RULE-124 | Budget Goal Link      | Budget dapat terkait goal future tanpa mengubah saldo.                     | Planning.                                | Dana liburan.                      | Relasi jelas.        |
| RULE-125 | Budget Audit          | Perubahan budget penting wajib diaudit.                                    | Family transparency.                     | Shared budget diubah.              | Kepercayaan.         |

# BAB 7. Business Rules Debt

| Kode     | Judul                   | Deskripsi                                                                 | Alasan                                | Contoh                  | Dampak                |
| -------- | ----------------------- | ------------------------------------------------------------------------- | ------------------------------------- | ----------------------- | --------------------- |
| RULE-126 | Debt Workspace          | Debt wajib terkait workspace.                                             | Isolasi kewajiban.                    | Hutang personal.        | Security.             |
| RULE-127 | Debt Name               | Debt wajib memiliki nama.                                                 | Identifikasi.                         | Kartu kredit.           | UX jelas.             |
| RULE-128 | Debt Balance            | Debt harus memiliki outstanding balance.                                  | Menghitung kewajiban.                 | Rp5.000.000.            | Net worth benar.      |
| RULE-129 | Debt Amount Positive    | Nilai debt tidak boleh negatif.                                           | Hutang bukan aset.                    | Rp10.000.000.           | Validasi.             |
| RULE-130 | Debt Status             | Debt wajib memiliki status.                                               | Lifecycle.                            | active, paid.           | Filter jelas.         |
| RULE-131 | Debt Payment Required   | Pengurangan debt harus melalui payment atau adjustment.                   | Audit.                                | Bayar cicilan.          | Balance valid.        |
| RULE-132 | Debt Payment Link       | Debt payment wajib terkait debt.                                          | Tidak boleh yatim.                    | debt_id.                | Integritas.           |
| RULE-133 | Payment Transaction     | Debt payment harus menghasilkan atau terhubung transaction.               | Wallet juga terpengaruh.              | Bayar dari BCA.         | Cashflow benar.       |
| RULE-134 | Payment Amount Positive | Payment amount harus lebih besar dari nol.                                | Validasi finansial.                   | Rp500.000.              | Data bersih.          |
| RULE-135 | Partial Payment         | Pembayaran sebagian mengurangi balance.                                   | Progres hutang.                       | Bayar Rp1 juta.         | Debt progress naik.   |
| RULE-136 | Full Payment            | Pembayaran penuh dapat mengubah status paid.                              | Lifecycle selesai.                    | Balance nol.            | Dashboard bersih.     |
| RULE-137 | Overpayment Rule        | Overpayment harus ditolak atau diproses sebagai aturan khusus.            | Mencegah balance negatif.             | Bayar lebih.            | Data aman.            |
| RULE-138 | Interest Rate           | Interest rate opsional tetapi harus valid jika ada.                       | Simulasi payoff.                      | 12% per tahun.          | Perhitungan benar.    |
| RULE-139 | Interest Assumption     | Perhitungan bunga harus menyebut asumsi.                                  | Transparansi.                         | Flat atau efektif.      | User paham.           |
| RULE-140 | Minimum Payment         | Minimum payment opsional tetapi harus positif jika diisi.                 | Reminder.                             | Rp500.000.              | Planning akurat.      |
| RULE-141 | Due Date                | Due date opsional untuk reminder.                                         | Menghindari telat bayar.              | Tanggal 10.             | Notification relevan. |
| RULE-142 | Debt Wallet             | Debt dapat terkait wallet liability.                                      | Integrasi balance.                    | Kartu kredit wallet.    | Net worth akurat.     |
| RULE-143 | Debt No Direct Wallet   | Membuat debt tidak otomatis mengubah cash wallet kecuali ada transaction. | Hutang bukan arus kas baru selalu.    | Catat hutang lama.      | Data tidak rancu.     |
| RULE-144 | Loan Disbursement       | Pencairan pinjaman harus dicatat sebagai transaction jika uang masuk.     | Cash bertambah.                       | Pinjaman masuk BCA.     | Cashflow tercatat.    |
| RULE-145 | Debt Category           | Payment interest dapat dikategorikan expense.                             | Bunga adalah biaya.                   | Bunga kartu kredit.     | Expense akurat.       |
| RULE-146 | Principal Split         | Split principal-interest future harus jelas.                              | Payoff akurat.                        | Cicilan KPR.            | Analisis valid.       |
| RULE-147 | Debt Adjustment         | Adjustment debt wajib alasan.                                             | Audit.                                | Koreksi saldo bank.     | Transparansi.         |
| RULE-148 | Debt Delete             | Debt dengan payment tidak boleh hard delete tanpa audit.                  | Histori penting.                      | Hutang lunas tetap ada. | Report stabil.        |
| RULE-149 | Debt Archive            | Debt paid dapat diarsipkan.                                               | Mengurangi clutter.                   | Cicilan selesai.        | Histori tetap.        |
| RULE-150 | Debt Score              | Debt memengaruhi Financial Score.                                         | Kewajiban bagian kesehatan finansial. | Rasio hutang.           | Score bermakna.       |
| RULE-151 | Debt Net Worth          | Total debt mengurangi net worth.                                          | Definisi kekayaan bersih.             | Asset 50, debt 10.      | Net worth 40.         |
| RULE-152 | Debt Reminder           | Debt due date dapat membuat reminder.                                     | Membantu disiplin.                    | Reminder cicilan.       | Habit support.        |
| RULE-153 | Debt Permission         | Create/update debt mengikuti role.                                        | Data sensitif.                        | Owner/editor.           | Security.             |
| RULE-154 | Debt Family             | Shared debt hanya di family workspace.                                    | Kolaborasi.                           | KPR keluarga.           | Permission relevan.   |
| RULE-155 | Debt Simulation         | Simulasi payoff tidak mengubah debt.                                      | Estimasi bukan aktual.                | Avalanche.              | Aman.                 |
| RULE-156 | Debt Strategy           | Strategy payoff harus tersimpan sebagai preference.                       | Planning.                             | Snowball.               | Saran konsisten.      |
| RULE-157 | Debt Currency           | Debt wajib memiliki currency.                                             | Perhitungan.                          | IDR.                    | Multi-currency siap.  |
| RULE-158 | Debt Created Audit      | Debt created wajib mencatat actor.                                        | Audit.                                | created_by.             | Accountability.       |
| RULE-159 | Payment Date            | Debt payment wajib memiliki tanggal.                                      | Periode laporan.                      | 10 Juni.                | Cashflow benar.       |
| RULE-160 | Payment Source Wallet   | Payment dengan uang keluar wajib punya wallet sumber.                     | Wallet berkurang.                     | BCA.                    | Balance benar.        |
| RULE-161 | Payment Delete          | Delete payment harus membalik debt dan transaction terkait.               | Konsistensi.                          | Cicilan dihapus.        | Balance pulih.        |
| RULE-162 | Payment Update          | Update payment memicu recalculation debt dan wallet.                      | Angka berubah.                        | Amount diedit.          | Data akurat.          |
| RULE-163 | Debt Import Future      | Import debt harus tetap divalidasi.                                       | Data eksternal.                       | CSV pinjaman.           | Data bersih.          |
| RULE-164 | Debt Disclosure         | Insight debt harus menyebut estimasi jika ada bunga.                      | Transparansi.                         | Payoff estimate.        | Trust.                |
| RULE-165 | Debt Auditability       | Debt balance harus dapat ditelusuri ke payment dan adjustment.            | Kebenaran finansial.                  | Riwayat pembayaran.     | Audit kuat.           |

# BAB 8. Business Rules Goal

| Kode     | Judul                    | Deskripsi                                                        | Alasan                       | Contoh                           | Dampak             |
| -------- | ------------------------ | ---------------------------------------------------------------- | ---------------------------- | -------------------------------- | ------------------ |
| RULE-166 | Goal Workspace           | Goal wajib terkait workspace.                                    | Isolasi target.              | Dana darurat personal.           | Security.          |
| RULE-167 | Goal Name                | Goal wajib memiliki nama.                                        | Identifikasi.                | Liburan Bali.                    | UX jelas.          |
| RULE-168 | Target Amount            | Target amount harus positif.                                     | Target finansial bernilai.   | Rp20.000.000.                    | Validasi.          |
| RULE-169 | Goal Status              | Goal wajib memiliki status.                                      | Lifecycle.                   | active, completed.               | Tracking jelas.    |
| RULE-170 | Goal No Balance          | Goal tidak mengurangi saldo secara langsung.                     | Goal adalah rencana.         | Buat goal tidak mengurangi cash. | Data benar.        |
| RULE-171 | Progress Source          | Progress goal harus punya sumber jelas.                          | Audit.                       | Contribution transaction.        | Trust.             |
| RULE-172 | Contribution Transaction | Contribution yang mengurangi wallet wajib berupa transaction.    | Cash berubah.                | Transfer ke tabungan.            | Saldo akurat.      |
| RULE-173 | Manual Progress          | Manual progress harus diaudit jika diizinkan.                    | Mencegah angka palsu.        | Koreksi progress.                | Transparansi.      |
| RULE-174 | Goal Date                | Target date opsional tetapi disarankan.                          | Planning.                    | 12 bulan.                        | Saran lebih baik.  |
| RULE-175 | Goal Priority            | Priority opsional untuk planning.                                | Pengambilan keputusan.       | Dana darurat prioritas tinggi.   | Fokus.             |
| RULE-176 | Goal Category            | Goal dapat memiliki tipe.                                        | Segmentasi.                  | saving, purchase, education.     | Insight tepat.     |
| RULE-177 | Goal Completed           | Goal completed jika progress mencapai target atau dikonfirmasi.  | Lifecycle.                   | 100%.                            | Dashboard bersih.  |
| RULE-178 | Goal Overfunded          | Progress melebihi target harus ditampilkan jelas.                | Pengguna perlu tahu.         | 110%.                            | Keputusan lanjut.  |
| RULE-179 | Goal Cancelled           | Goal cancelled tidak menghapus histori.                          | Keputusan masa lalu penting. | Target batal.                    | Report tetap.      |
| RULE-180 | Goal Archived            | Goal archived tidak tampil utama.                                | UX.                          | Target lama.                     | Fokus.             |
| RULE-181 | Shared Goal              | Shared goal membutuhkan family workspace.                        | Kolaborasi.                  | Dana pendidikan anak.            | Permission.        |
| RULE-182 | Goal Permission          | Create/update goal mengikuti role.                               | Data planning sensitif.      | Editor boleh.                    | Security.          |
| RULE-183 | Goal Recommendation      | Rekomendasi goal tidak auto-create tanpa konfirmasi.             | User control.                | AI saran dana darurat.           | Aman.              |
| RULE-184 | Goal Cashflow            | Goal dapat memengaruhi planning cashflow, bukan actual cashflow. | Rencana vs realisasi.        | Tabungan bulanan.                | Simulasi tepat.    |
| RULE-185 | Goal Budget Link         | Goal dapat dikaitkan dengan budget.                              | Perencanaan.                 | Budget tabungan.                 | Konsistensi.       |
| RULE-186 | Goal Wallet Link         | Goal dapat dikaitkan wallet khusus.                              | Tracking jelas.              | Wallet dana darurat.             | Progress mudah.    |
| RULE-187 | Goal Delete              | Goal dengan kontribusi sebaiknya archived, bukan hard delete.    | Audit.                       | Goal lama.                       | Histori aman.      |
| RULE-188 | Goal Update Audit        | Perubahan target amount/date wajib diaudit.                      | Planning berubah.            | Target naik.                     | Transparansi.      |
| RULE-189 | Goal Progress Formula    | Progress = current / target.                                     | Konsistensi.                 | 50%.                             | UI konsisten.      |
| RULE-190 | Goal Negative Progress   | Progress tidak boleh negatif.                                    | Tidak logis.                 | -10 ditolak.                     | Data valid.        |
| RULE-191 | Goal Currency            | Goal wajib memiliki currency.                                    | Konteks nominal.             | IDR.                             | Perhitungan benar. |
| RULE-192 | Goal Insight             | Insight goal harus berbasis data.                                | Tidak mengarang.             | Perlu Rp1 juta/bulan.            | Saran akurat.      |
| RULE-193 | Goal Notification        | Goal dapat memicu reminder.                                      | Habit.                       | Progress bulanan.                | Engagement.        |
| RULE-194 | Goal Snapshot            | Progress goal dapat disimpan snapshot histori.                   | Trend.                       | Progress akhir bulan.            | Analisis.          |
| RULE-195 | Goal Auditability        | Setiap progress harus dapat ditelusuri.                          | Kebenaran.                   | Contribution list.               | Trust.             |

# BAB 9. Business Rules Financial Core

| Kode     | Judul                   | Deskripsi                                                   | Alasan                      | Contoh                   | Dampak           |
| -------- | ----------------------- | ----------------------------------------------------------- | --------------------------- | ------------------------ | ---------------- |
| RULE-196 | Core Authority          | Financial Core menjadi pusat perhitungan.                   | Konsistensi sistem.         | Dashboard pakai core.    | Angka sama.      |
| RULE-197 | Source Transaction      | Transaction sumber utama data aktual.                       | Audit.                      | Expense.                 | Kebenaran.       |
| RULE-198 | Derived Balance         | Balance derived dari transaction dan initial balance.       | Tidak ada angka palsu.      | Wallet balance.          | Audit.           |
| RULE-199 | Scoped Calculation      | Semua kalkulasi scoped workspace.                           | Isolasi.                    | Summary workspace A.     | Security.        |
| RULE-200 | Recalculate Event       | Event finansial wajib memicu recalculation relevan.         | Data turunan berubah.       | Transaction update.      | Akurat.          |
| RULE-201 | Snapshot Non-Truth      | Snapshot bukan source of truth.                             | Hanya histori/performa.     | Snapshot bulanan.        | Data aman.       |
| RULE-202 | Formula Version         | Formula penting harus punya versi.                          | Evolusi sistem.             | Score v1.                | Audit historis.  |
| RULE-203 | Cashflow Formula        | Cashflow = income - expense.                                | Standar.                    | 10 juta - 7 juta.        | Konsisten.       |
| RULE-204 | Net Worth Formula       | Net worth = asset - debt.                                   | Definisi finansial.         | 100 - 30.                | Laporan benar.   |
| RULE-205 | Total Cash              | Total cash hanya cash-equivalent.                           | Tidak semua asset likuid.   | Cash + bank.             | Analisis aman.   |
| RULE-206 | Total Debt              | Total debt dari debt aktif.                                 | Kewajiban berjalan.         | Pinjaman aktif.          | Net worth tepat. |
| RULE-207 | Budget Actual           | Budget actual dari expense transaction.                     | Actual bukan input manual.  | Makanan.                 | Budget valid.    |
| RULE-208 | Goal Progress           | Goal progress harus derived.                                | Target bukan saldo.         | Contribution.            | Trust.           |
| RULE-209 | Debt Progress           | Debt progress dari original dan balance.                    | Payoff tracking.            | 40%.                     | Insight.         |
| RULE-210 | Emergency Coverage      | Emergency coverage harus berbasis expense esensial.         | Ukur ketahanan.             | 6 bulan.                 | Score bermakna.  |
| RULE-211 | No UI Calculation Truth | UI tidak boleh menjadi sumber kalkulasi utama.              | Hindari divergensi.         | API/core hitung.         | Konsisten.       |
| RULE-212 | API Same Logic          | API harus memakai logic core yang sama.                     | Tidak duplikasi.            | Summary endpoint.        | Angka sama.      |
| RULE-213 | AI Reads Core           | AI membaca hasil core, bukan menghitung bebas tanpa aturan. | Menghindari mismatch.       | Insight cashflow.        | Trust.           |
| RULE-214 | Report Traceable        | Report harus traceable ke data sumber.                      | Audit.                      | Laporan Juni.            | Verifikasi.      |
| RULE-215 | Period Explicit         | Perhitungan periodik wajib menyebut periode.                | Konteks.                    | Juni 2026.               | Tidak ambigu.    |
| RULE-216 | Timezone Rule           | Periode mengikuti timezone workspace/user.                  | Batas hari/bulan.           | Asia/Jakarta.            | Akurat.          |
| RULE-217 | Backdate Impact         | Backdate memengaruhi periode lampau.                        | Data berubah.               | Expense Mei dibuat Juni. | Recalc.          |
| RULE-218 | Multi-Currency Guard    | Agregasi beda currency ditolak sampai rule tersedia.        | Hindari salah hitung.       | IDR+USD.                 | Aman.            |
| RULE-219 | Cache Invalidated       | Cache/snapshot harus invalidated saat data sumber berubah.  | Hindari stale.              | Transaction edit.        | Akurat.          |
| RULE-220 | Financial Event Log     | Event penting harus dicatat.                                | Audit core.                 | Transaction created.     | Traceability.    |
| RULE-221 | Adjustment Core         | Adjustment masuk core sebagai event khusus.                 | Koreksi terkontrol.         | Wallet adjustment.       | Balance valid.   |
| RULE-222 | No Manual Score         | Score tidak boleh manual.                                   | Objektivitas.               | Admin edit ditolak.      | Trust.           |
| RULE-223 | No Manual Cashflow      | Cashflow tidak boleh input manual.                          | Derived metric.             | API hitung.              | Konsisten.       |
| RULE-224 | Rounded Display         | Pembulatan display tidak mengubah data sumber.              | Presisi.                    | Rp10.001 tampil Rp10 rb. | Data aman.       |
| RULE-225 | Decimal Safety          | Nominal harus disimpan presisi aman.                        | Uang sensitif.              | Decimal, bukan float.    | Akurat.          |
| RULE-226 | Idempotent Recalc       | Recalculation harus idempotent.                             | Aman dijalankan ulang.      | Recalc dua kali sama.    | Stabil.          |
| RULE-227 | Partial Failure         | Kegagalan recalculation harus terdeteksi.                   | Mencegah angka setengah.    | Job gagal.               | Alert.           |
| RULE-228 | Core Testing            | Semua formula core wajib punya test scenario.               | Risiko tinggi.              | Wallet balance test.     | Kualitas.        |
| RULE-229 | Financial State         | Financial state adalah hasil perhitungan, bukan input.      | Model jelas.                | Summary.                 | Konsisten.       |
| RULE-230 | Snapshot Schedule       | Snapshot periodik harus punya jadwal.                       | Histori.                    | Akhir bulan.             | Trend.           |
| RULE-231 | Snapshot Rebuild        | Snapshot harus bisa dibangun ulang.                         | Data historis bisa berubah. | Backdate.                | Akurat.          |
| RULE-232 | Core Permission         | Perhitungan privat wajib validasi akses.                    | Data sensitif.              | Summary workspace.       | Security.        |
| RULE-233 | Core Error              | Error core harus aman dan tidak bocor data.                 | Security.                   | "Tidak berhak".          | Aman.            |
| RULE-234 | Core Observability      | Perhitungan penting perlu logging aman.                     | Debug.                      | Duration recalc.         | Operasional.     |
| RULE-235 | Core Documentation      | Formula core wajib terdokumentasi.                          | Konsensus.                  | Net worth formula.       | Tim selaras.     |

# BAB 10. Business Rules AI

| Kode     | Judul                   | Deskripsi                                                     | Alasan                       | Contoh                               | Dampak             |
| -------- | ----------------------- | ------------------------------------------------------------- | ---------------------------- | ------------------------------------ | ------------------ |
| RULE-236 | AI Read Only            | AI hanya membaca data kecuali user mengonfirmasi aksi.        | Keamanan.                    | Saran kategori.                      | Data aman.         |
| RULE-237 | No Transaction Mutation | AI tidak boleh mengubah transaksi langsung.                   | Transaction source of truth. | Edit otomatis ditolak.               | Integritas.        |
| RULE-238 | No Fabrication          | AI tidak boleh mengarang data.                                | Trust.                       | Tidak membuat saldo palsu.           | Aman.              |
| RULE-239 | Source Reference        | Insight AI harus punya referensi sumber.                      | Audit.                       | Berdasarkan transaksi Juni.          | Verifikasi.        |
| RULE-240 | Permission Bound        | AI hanya membaca data yang boleh diakses user.                | Security.                    | Workspace sendiri.                   | Privasi.           |
| RULE-241 | Workspace Bound         | AI context wajib scoped workspace.                            | Isolasi.                     | Family workspace.                    | Tidak bocor.       |
| RULE-242 | Sensitive Data Limit    | AI hanya menerima data yang diperlukan.                       | Data minimization.           | Summary bukan raw detail jika cukup. | Privasi.           |
| RULE-243 | AI Label                | Output AI harus diberi label bantuan.                         | Menghindari klaim mutlak.    | "Insight AI".                        | Transparansi.      |
| RULE-244 | No Certified Advice     | AI tidak boleh mengklaim nasihat profesional tersertifikasi.  | Compliance.                  | Bukan financial planner.             | Risiko turun.      |
| RULE-245 | User Control            | User dapat menerima atau menolak saran AI.                    | Kontrol pengguna.            | Accept category.                     | Aman.              |
| RULE-246 | Explainability          | AI harus menjelaskan alasan insight.                          | Trust.                       | Pengeluaran naik 30%.                | Dipahami.          |
| RULE-247 | Uncertainty             | AI harus menyebut data tidak lengkap jika relevan.            | Akurasi.                     | "Data bulan ini belum lengkap".      | Tidak menyesatkan. |
| RULE-248 | AI Audit                | Request penting AI harus dapat diaudit.                       | Keamanan dan kualitas.       | Insight generated.                   | Review.            |
| RULE-249 | No Secret Exposure      | AI tidak boleh menerima secrets.                              | Security.                    | API key tidak dikirim.               | Aman.              |
| RULE-250 | No Cross User           | AI tidak boleh membandingkan data user tanpa izin dan anonim. | Privasi.                     | Benchmark future.                    | Compliance.        |
| RULE-251 | AI Premium              | AI advanced dapat dibatasi premium.                           | Monetisasi.                  | Advanced insight.                    | Value premium.     |
| RULE-252 | AI Basic Value          | Free AI jika ada harus tetap aman dan terbatas.               | Cost control.                | Insight dasar.                       | Berkelanjutan.     |
| RULE-253 | AI Categorization       | Kategorisasi AI harus suggestion sebelum diterapkan.          | Mencegah salah data.         | Suggested category.                  | Kontrol.           |
| RULE-254 | AI Decision             | AI decision simulation tidak mengubah data aktual.            | Simulasi.                    | Beli motor.                          | Aman.              |
| RULE-255 | AI Score                | AI tidak menghitung score berbeda dari core.                  | Konsistensi.                 | Score dari core.                     | Angka sama.        |
| RULE-256 | AI Logging Redaction    | Log AI harus meredaksi data sensitif.                         | Privasi.                     | Nominal detail masked jika perlu.    | Aman.              |
| RULE-257 | AI Feedback             | User feedback AI dapat dicatat.                               | Peningkatan kualitas.        | Insight helpful.                     | Iterasi.           |
| RULE-258 | AI Rate Limit           | AI perlu rate limit sesuai plan.                              | Biaya dan abuse.             | Limit harian.                        | Stabil.            |
| RULE-259 | AI Locale               | AI harus memakai bahasa dan konteks user.                     | UX.                          | Bahasa Indonesia.                    | Relevan.           |
| RULE-260 | AI Fallback             | Jika AI gagal, fitur core tetap berjalan.                     | AI bukan dependency core.    | Transaksi tetap bisa dibuat.         | Resilience.        |

# BAB 11. Business Rules Dashboard

| Kode     | Judul                 | Deskripsi                                                    | Alasan                  | Contoh                       | Dampak               |
| -------- | --------------------- | ------------------------------------------------------------ | ----------------------- | ---------------------------- | -------------------- |
| RULE-261 | Dashboard Read Only   | Dashboard hanya membaca data.                                | Bukan source of truth.  | Menampilkan summary.         | Konsisten.           |
| RULE-262 | No Permanent Truth    | Dashboard tidak menyimpan angka permanen kecuali snapshot.   | Hindari divergensi.     | Net worth baca core.         | Aman.                |
| RULE-263 | Workspace Context     | Dashboard wajib sesuai workspace aktif.                      | Isolasi.                | Family dashboard.            | Tidak salah data.    |
| RULE-264 | Permission Display    | Dashboard hanya menampilkan data sesuai permission.          | Security.               | Viewer terbatas.             | Privasi.             |
| RULE-265 | Period Label          | Dashboard metric periodik wajib label periode.               | Konteks.                | Bulan ini.                   | Jelas.               |
| RULE-266 | Stale Indicator       | Data snapshot stale harus ditandai.                          | Transparansi.           | Perlu refresh.               | Trust.               |
| RULE-267 | Loading State         | Dashboard wajib punya loading state.                         | UX.                     | Skeleton.                    | Tidak membingungkan. |
| RULE-268 | Empty State           | Dashboard wajib punya empty state.                           | Onboarding.             | Belum ada transaksi.         | User tahu aksi.      |
| RULE-269 | Error State           | Error dashboard harus aman dan jelas.                        | UX/security.            | Gagal memuat.                | User paham.          |
| RULE-270 | Metric Source         | Metric penting harus berasal dari core/report.               | Konsistensi.            | Cashflow dari core.          | Angka benar.         |
| RULE-271 | No Hidden Mutation    | Dashboard action tidak boleh mengubah data tanpa konfirmasi. | Mencegah salah klik.    | Delete confirm.              | Aman.                |
| RULE-272 | Quick Action          | Quick action dashboard tetap mengikuti validasi domain.      | Shortcut bukan bypass.  | Add transaction.             | Rule patuh.          |
| RULE-273 | Score Display         | Score display harus menyertakan faktor utama.                | Tidak hanya angka.      | Score 72 karena debt tinggi. | Insight.             |
| RULE-274 | AI Insight Display    | Insight AI harus diberi label.                               | Transparansi.           | "AI Insight".                | Trust.               |
| RULE-275 | Budget Warning        | Warning budget harus berdasarkan data aktual.                | Tidak menyesatkan.      | 90% usage.                   | Keputusan tepat.     |
| RULE-276 | Debt Summary          | Debt summary harus berasal dari debt aktif.                  | Akurasi.                | Total debt.                  | Net worth benar.     |
| RULE-277 | Goal Summary          | Goal summary harus menampilkan progress valid.               | Motivasi.               | 40% dana darurat.            | Engagement.          |
| RULE-278 | Mobile Dashboard      | Dashboard harus mobile-first.                                | Pengguna sering mobile. | Card ringkas.                | UX baik.             |
| RULE-279 | Dashboard Performance | Dashboard harus ringan.                                      | Halaman utama.          | Gunakan snapshot/cache.      | Cepat.               |
| RULE-280 | Dashboard Audit Link  | Metric penting sebaiknya dapat ditelusuri ke detail.         | Audit pengguna.         | Klik expense ke transaksi.   | Kepercayaan.         |

# BAB 12. Business Rules Premium

| Kode     | Judul              | Deskripsi                                                      | Alasan                      | Contoh                  | Dampak               |
| -------- | ------------------ | -------------------------------------------------------------- | --------------------------- | ----------------------- | -------------------- |
| RULE-281 | Free Useful        | Free user harus mendapat manfaat nyata.                        | Akuisisi dan trust.         | Transaksi dasar.        | Retensi.             |
| RULE-282 | Premium Add Value  | Premium menambah nilai, bukan mengunci core secara tidak adil. | Etika monetisasi.           | Advanced insight.       | Brand sehat.         |
| RULE-283 | Entitlement Source | Entitlement harus punya source of truth.                       | Akses konsisten.            | Subscription status.    | Tidak kacau.         |
| RULE-284 | Backend Guard      | Fitur premium wajib dijaga backend.                            | Frontend bisa dimanipulasi. | Export endpoint.        | Security.            |
| RULE-285 | Frontend Guard     | UI harus menampilkan akses sesuai entitlement.                 | UX jelas.                   | Badge premium.          | Tidak membingungkan. |
| RULE-286 | Downgrade Safe     | Downgrade tidak boleh menghapus data.                          | Trust.                      | Family data readonly.   | Aman.                |
| RULE-287 | Cancel Safe        | Cancel subscription tidak menghapus histori.                   | Data milik user.            | Report lama tetap.      | Trust.               |
| RULE-288 | Plan Change Audit  | Perubahan plan harus diaudit.                                  | Billing sensitif.           | Upgrade family.         | Support mudah.       |
| RULE-289 | Premium Disclosure | Benefit premium harus jelas.                                   | Transparansi.               | Fitur export.           | Conversion sehat.    |
| RULE-290 | No Dark Pattern    | Upgrade prompt tidak boleh manipulatif.                        | Etika.                      | Tidak paksa berlebihan. | Trust.               |
| RULE-291 | Trial Rule         | Trial harus punya tanggal mulai dan akhir.                     | Billing jelas.              | 14 hari.                | Tidak sengketa.      |
| RULE-292 | Grace Period       | Grace period harus didefinisikan.                              | Pembayaran gagal.           | 7 hari.                 | UX baik.             |
| RULE-293 | Payment Failure    | Payment failure tidak langsung menghapus akses tanpa aturan.   | Keadilan.                   | Past_due.               | Retensi.             |
| RULE-294 | Family Premium     | Family workspace premium membutuhkan plan sesuai.              | Monetisasi.                 | Invite member.          | Akses tepat.         |
| RULE-295 | Premium AI         | AI advanced dapat dibatasi premium.                            | Biaya.                      | Cashflow prediction.    | Cost control.        |
| RULE-296 | Export Premium     | Export lanjutan dapat premium.                                 | Value.                      | PDF/Excel.              | Revenue.             |
| RULE-297 | Snapshot Premium   | Historical snapshot analysis dapat premium.                    | Nilai lanjutan.             | Trend tahunan.          | Monetisasi.          |
| RULE-298 | Limit Transparency | Batas free harus ditampilkan sebelum tercapai.                 | UX.                         | Limit wallet.           | Tidak frustrasi.     |
| RULE-299 | Billing Isolation  | Billing data harus terlindungi.                                | Sensitif.                   | Provider ID.            | Security.            |
| RULE-300 | Refund Policy      | Refund future harus punya aturan.                              | Operasional.                | Prorata atau tidak.     | Support jelas.       |

# BAB 13. Business Rules Security

| Kode     | Judul                 | Deskripsi                                                | Alasan                    | Contoh                      | Dampak             |
| -------- | --------------------- | -------------------------------------------------------- | ------------------------- | --------------------------- | ------------------ |
| RULE-301 | Auth Required         | Data privat wajib membutuhkan autentikasi.               | Security dasar.           | User login.                 | Aman.              |
| RULE-302 | RLS Required          | Data workspace wajib dilindungi RLS.                     | Defense in depth.         | Supabase RLS.               | Kebocoran dicegah. |
| RULE-303 | Workspace Membership  | Akses workspace wajib validasi member.                   | Isolasi.                  | Non-member ditolak.         | Security.          |
| RULE-304 | Least Privilege       | Role mendapat akses minimum yang diperlukan.             | Mengurangi risiko.        | Viewer read only.           | Aman.              |
| RULE-305 | Role Enforcement      | Role harus ditegakkan backend.                           | Frontend tidak cukup.     | API update budget.          | Aman.              |
| RULE-306 | Sensitive Logs        | Log tidak boleh berisi data sensitif tanpa redaksi.      | Privasi.                  | Nominal detail masked.      | Compliance.        |
| RULE-307 | Secret Storage        | Secrets tidak boleh masuk repository.                    | Keamanan.                 | API key env.                | Aman.              |
| RULE-308 | Input Validation      | Semua input harus divalidasi.                            | Mencegah data rusak.      | Amount positif.             | Integritas.        |
| RULE-309 | Output Filtering      | Response API hanya memuat data perlu.                    | Data minimization.        | Tidak kirim billing secret. | Privasi.           |
| RULE-310 | Error Safe            | Error message tidak boleh bocor detail internal.         | Security.                 | "Akses ditolak".            | Aman.              |
| RULE-311 | Audit Sensitive       | Aksi sensitif wajib diaudit.                             | Investigasi.              | Delete transaction.         | Traceability.      |
| RULE-312 | Delete Permission     | Delete data finansial membutuhkan permission tinggi.     | Risiko besar.             | Owner only.                 | Histori aman.      |
| RULE-313 | Adjustment Permission | Adjustment membutuhkan permission tinggi.                | Mengubah saldo.           | Owner/editor senior.        | Kontrol.           |
| RULE-314 | Export Permission     | Export data mengikuti permission dan entitlement.        | Data keluar sistem.       | PDF export.                 | Privasi.           |
| RULE-315 | AI Permission         | AI hanya mengakses data sesuai permission user.          | AI bukan bypass.          | User viewer.                | Aman.              |
| RULE-316 | Attachment Security   | Attachment finansial wajib protected.                    | Bukti transaksi sensitif. | Receipt private.            | Privasi.           |
| RULE-317 | Session Management    | Session harus dikelola aman.                             | Account takeover risk.    | Logout.                     | Security.          |
| RULE-318 | Account Deletion      | Penghapusan akun harus punya kebijakan.                  | Data privacy.             | Delete request.             | Compliance.        |
| RULE-319 | Data Retention        | Retensi data harus terdokumentasi.                       | Legal/operasional.        | Soft delete 30 hari.        | Jelas.             |
| RULE-320 | Backup Strategy       | Data finansial perlu strategi backup future.             | Disaster recovery.        | Backup DB.                  | Resilience.        |
| RULE-321 | Rate Limit            | Endpoint sensitif perlu rate limit.                      | Abuse prevention.         | AI/export.                  | Stabil.            |
| RULE-322 | Webhook Verify        | Webhook billing future wajib diverifikasi.               | Mencegah spoofing.        | Signature check.            | Billing aman.      |
| RULE-323 | No Client Trust       | Backend tidak boleh percaya klaim ownership dari client. | Client bisa dimanipulasi. | Validate workspace.         | Aman.              |
| RULE-324 | ID Enumeration        | Sistem harus mencegah akses dengan menebak ID.           | Data breach.              | UUID + RLS.                 | Aman.              |
| RULE-325 | Privacy Settings      | Privacy preference harus dihormati.                      | User control.             | AI disabled.                | Trust.             |
| RULE-326 | Incident Logging      | Insiden keamanan harus dicatat.                          | Response.                 | Unauthorized attempt.       | Investigasi.       |
| RULE-327 | Security Review       | Fitur sensitif wajib security review.                    | Risiko tinggi.            | Family permission.          | Aman.              |
| RULE-328 | Dependency Review     | Dependency baru harus ditinjau.                          | Supply chain risk.        | Library baru.               | Stabil.            |
| RULE-329 | Admin Access          | Admin access future harus dibatasi dan diaudit.          | Risiko internal.          | Support view.               | Trust.             |
| RULE-330 | Compliance Future     | Fitur finansial regulatif harus review compliance.       | Risiko hukum.             | Advice/investasi.           | Aman.              |

# BAB 14. Business Rules Notification

| Kode     | Judul                  | Deskripsi                                                | Alasan                 | Contoh                     | Dampak             |
| -------- | ---------------------- | -------------------------------------------------------- | ---------------------- | -------------------------- | ------------------ |
| RULE-331 | Notification Workspace | Notification terkait finansial harus scoped workspace.   | Konteks.               | Budget alert family.       | Tidak salah kirim. |
| RULE-332 | Notification User      | Notification wajib memiliki penerima.                    | Delivery jelas.        | user_id.                   | Tepat sasaran.     |
| RULE-333 | Preference Respect     | Notification harus mengikuti preferensi user.            | User control.          | Matikan email.             | Tidak mengganggu.  |
| RULE-334 | No Financial Mutation  | Notification tidak boleh mengubah data finansial.        | Hanya komunikasi.      | Alert budget.              | Aman.              |
| RULE-335 | Reminder Source        | Reminder notification harus punya sumber.                | Traceability.          | Debt due date.             | Jelas.             |
| RULE-336 | Approval Notification  | Approval harus memberi tahu pihak relevan.               | Kolaborasi.            | Request pengeluaran.       | Respons cepat.     |
| RULE-337 | Budget Alert           | Budget alert berdasarkan actual usage.                   | Akurasi.               | 90% budget.                | User sadar.        |
| RULE-338 | Debt Reminder          | Debt reminder berdasarkan due date valid.                | Hindari telat.         | Jatuh tempo 3 hari.        | Habit.             |
| RULE-339 | Goal Reminder          | Goal reminder tidak boleh memaksa.                       | Empatik.               | Cek progress.              | Engagement sehat.  |
| RULE-340 | Notification Frequency | Frekuensi harus dikontrol.                               | Mencegah spam.         | Digest harian.             | UX baik.           |
| RULE-341 | Read Status            | Notification harus punya read status.                    | UX.                    | unread/read.               | Inbox rapi.        |
| RULE-342 | Action Link            | Notification actionable harus mengarah ke konteks benar. | Efisiensi.             | Buka budget.               | User cepat.        |
| RULE-343 | Sensitive Content      | Konten sensitif harus hati-hati di push/email.           | Privasi layar.         | Jangan tampil saldo penuh. | Aman.              |
| RULE-344 | Delivery Failure       | Gagal kirim tidak boleh merusak data core.               | Notification non-core. | Push gagal.                | Resilience.        |
| RULE-345 | Notification Audit     | Notification penting dapat diaudit.                      | Support.               | Approval sent.             | Debug.             |
| RULE-346 | Premium Notification   | Notification premium harus mengikuti entitlement.        | Fitur plan.            | Advanced insight alert.    | Konsisten.         |
| RULE-347 | AI Notification        | AI insight notification harus diberi label AI.           | Transparansi.          | Insight AI baru.           | Trust.             |
| RULE-348 | Timezone Notification  | Jadwal notification mengikuti timezone user/workspace.   | Relevansi waktu.       | 08:00 WIB.                 | UX.                |
| RULE-349 | Unsubscribe            | User dapat mengatur jenis notification.                  | Kontrol.               | Matikan promo.             | Trust.             |
| RULE-350 | Notification Retention | Retensi notification harus ditentukan.                   | Data hygiene.          | Hapus setelah periode.     | Sistem bersih.     |

# BAB 15. Business Rules Future Modules

## Investment

Investment harus diperlakukan sebagai future domain dengan aturan valuasi, risiko pasar, sumber harga, dan compliance. Nilai investasi tidak boleh dicampur dengan cash tanpa label yang jelas.

## Insurance

Insurance harus menyimpan polis, premi, manfaat, dan jatuh tempo. Insurance bukan asset tunai kecuali terdapat cash value yang terdefinisi.

## Asset

Asset management harus membedakan aset likuid dan tidak likuid. Nilai aset harus memiliki sumber valuasi dan tanggal penilaian.

## Tax

Tax module harus mengikuti aturan regional dan tidak boleh memberikan klaim kepatuhan pajak tanpa validasi hukum.

## Payroll

Payroll personal harus membedakan gross income, deduction, net income, bonus, dan benefit.

## Financial Vault

Financial Vault harus menyimpan dokumen sensitif dengan akses terbatas, audit, dan proteksi storage.

## Decision Simulator

Decision Simulator hanya menghasilkan skenario dan estimasi. Simulator tidak boleh mengubah data aktual tanpa aksi eksplisit dari pengguna.

# Penutup

Business Rule Book ini menjadi kitab hukum Vinari. Seluruh domain, engine, database, API, UI, AI, dashboard, dan testing harus mengikuti aturan di dalam dokumen ini.

Aturan bisnis dapat berkembang, tetapi perubahan harus dilakukan secara sadar, terdokumentasi, dan selaras dengan Master PRD, Domain Model, Development Constitution, dan Financial Core Engine.

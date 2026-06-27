# Master Product Requirements Document

## Status Dokumen

| Atribut         | Keterangan                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| Nama Produk     | Vinari Project                                                               |
| Jenis Dokumen   | Master Product Requirements Document                                         |
| Bahasa          | Indonesia                                                                    |
| Status          | Draft Foundation                                                             |
| Pemilik Dokumen | Product Team Vinari                                                          |
| Pembaca Utama   | Founder, Product Manager, Designer, Developer, QA, AI Agent, dan Kontributor |
| Fungsi Utama    | Acuan utama seluruh pengembangan produk Vinari                               |

## Prinsip Penggunaan Dokumen

Dokumen ini adalah acuan utama pengembangan Vinari. Seluruh keputusan database, UI, API, coding, testing, AI, monetisasi, dan roadmap harus mengacu pada dokumen ini.

Jika terdapat konflik antara asumsi teknis, preferensi desain, atau ide fitur dengan Master PRD ini, maka Master PRD menjadi rujukan utama sampai dokumen diperbarui melalui proses review yang jelas.

# 1. Pendahuluan

## 1.1 Latar Belakang

Pengelolaan keuangan pribadi dan keluarga sering dilakukan secara terpisah, tidak konsisten, dan sulit dievaluasi. Banyak pengguna mencatat pengeluaran di aplikasi sederhana, spreadsheet, catatan manual, atau bahkan hanya mengandalkan ingatan. Cara ini membantu sebagian pengguna mengetahui transaksi, tetapi belum cukup untuk memahami kondisi finansial secara menyeluruh.

Masalah keuangan sehari-hari tidak hanya terjadi karena pengguna tidak mencatat uang. Masalah yang lebih besar adalah pengguna sering tidak memiliki sistem untuk memahami pola pengeluaran, membuat rencana, mengelola hutang, menetapkan target, dan mengambil keputusan finansial dengan data yang jelas.

Vinari dibangun untuk menjawab kebutuhan tersebut. Vinari bukan sekadar aplikasi pencatatan keuangan. Vinari adalah Personal & Family Financial Operating System yang membantu pengguna mencatat, memahami, merencanakan, memutuskan, dan bertumbuh secara finansial.

## 1.2 Mengapa Vinari Dibuat

Vinari dibuat karena pengguna membutuhkan alat yang lebih menyeluruh daripada expense tracker biasa.

Pengguna membutuhkan sistem yang dapat:

- Mencatat pemasukan, pengeluaran, transfer, hutang, budget, dan target.
- Menjelaskan kondisi finansial dengan bahasa yang mudah dipahami.
- Membantu membuat budget dan rencana pelunasan hutang.
- Membantu pasangan dan keluarga bekerja sama dalam mengelola uang.
- Membantu pengguna mengambil keputusan finansial sebelum konsekuensinya terjadi.
- Membantu membangun kebiasaan finansial yang lebih sehat dari waktu ke waktu.

Vinari dibuat untuk menjadi ruang kerja finansial yang dapat dipercaya, bukan hanya tempat menyimpan angka.

## 1.3 Permasalahan yang Ingin Diselesaikan

Masalah utama yang ingin diselesaikan Vinari:

| Masalah                                          | Dampak pada Pengguna                              | Arah Solusi Vinari                            |
| ------------------------------------------------ | ------------------------------------------------- | --------------------------------------------- |
| Pencatatan tidak konsisten                       | Pengguna tidak mengetahui kondisi uang sebenarnya | Pencatatan transaksi yang sederhana dan cepat |
| Budget tidak dipantau                            | Budget hanya menjadi rencana tanpa kontrol        | Budget tracking dan review berkala            |
| Hutang tidak memiliki strategi                   | Pelunasan terasa tidak terarah                    | Debt tracking dan rencana pelunasan           |
| Target finansial tidak terlihat progresnya       | Pengguna kehilangan motivasi                      | Goal tracking dan visualisasi progres         |
| Keuangan pasangan atau keluarga tidak transparan | Keputusan rumah tangga sulit disepakati           | Family workspace, role, dan kolaborasi        |
| Data keuangan tidak menghasilkan insight         | Pengguna punya data tetapi tidak tahu maknanya    | Financial insight dan ringkasan kondisi       |
| Keputusan finansial dibuat tanpa simulasi        | Pengguna mengambil risiko tanpa gambaran dampak   | Simulation dan cashflow planning              |

## 1.4 Peluang Produk

Peluang Vinari berada pada pertemuan antara personal finance, family finance, financial planning, AI insight, dan SaaS subscription.

Sebagian besar aplikasi keuangan berfokus pada pencatatan. Vinari memiliki peluang untuk bergerak lebih jauh dengan menjadi sistem operasi finansial yang membantu pengguna membuat keputusan. Dengan pendekatan freemium SaaS, Vinari dapat memberikan manfaat nyata bagi pengguna gratis dan membuka fitur lanjutan bagi pengguna premium.

Peluang utama:

- Meningkatnya kebutuhan literasi finansial.
- Banyak pengguna membutuhkan alat keuangan yang sederhana namun serius.
- Pasangan dan keluarga membutuhkan ruang finansial bersama.
- AI dapat membantu menjelaskan data keuangan dengan bahasa yang lebih mudah.
- Model subscription memungkinkan pengembangan produk berkelanjutan.

## 1.5 Visi

Menjadi sistem operasi finansial pribadi dan keluarga yang membantu pengguna memahami kondisi keuangan, merencanakan masa depan, dan mengambil keputusan finansial dengan lebih jelas, tenang, dan percaya diri.

## 1.6 Misi

Misi Vinari adalah membantu pengguna:

- Mencatat aktivitas finansial secara mudah dan konsisten.
- Memahami kondisi finansial secara jelas dan relevan.
- Membuat budget, target, dan rencana pelunasan hutang.
- Berkolaborasi dengan pasangan atau keluarga dalam pengelolaan uang.
- Mensimulasikan keputusan finansial sebelum bertindak.
- Membangun kebiasaan finansial yang lebih sehat dari waktu ke waktu.

# 2. Tujuan Produk

## 2.1 Tujuan Jangka Pendek

Tujuan jangka pendek Vinari adalah membangun fondasi produk yang kuat dan dapat digunakan untuk kebutuhan personal finance dasar.

Fokus jangka pendek:

- Membuat pengguna dapat membuat akun dan workspace personal.
- Membuat pengguna dapat mencatat akun finansial.
- Membuat pengguna dapat mencatat pemasukan, pengeluaran, dan transfer.
- Membuat pengguna dapat mengelompokkan transaksi dengan kategori.
- Membuat pengguna dapat membuat budget dasar.
- Membuat pengguna dapat membuat target finansial dasar.
- Membuat pengguna dapat melihat ringkasan kondisi finansial sederhana.
- Menyiapkan fondasi database, security, dan architecture untuk pengembangan lanjutan.

## 2.2 Tujuan Jangka Menengah

Tujuan jangka menengah Vinari adalah mengubah data pencatatan menjadi insight, perencanaan, dan kolaborasi.

Fokus jangka menengah:

- Mengembangkan debt management.
- Mengembangkan Financial Health Score.
- Mengembangkan cashflow overview dan prediction.
- Mengembangkan recurring transaction.
- Mengembangkan subscription manager.
- Mengembangkan family workspace.
- Mengembangkan approval pengeluaran.
- Mengembangkan export PDF dan Excel.
- Menyiapkan sistem premium dan entitlement.

## 2.3 Tujuan Jangka Panjang

Tujuan jangka panjang Vinari adalah menjadi Financial Operating System yang matang untuk individu, pasangan, keluarga, dan segmen lanjutan seperti UMKM.

Fokus jangka panjang:

- Menjadi platform finansial keluarga yang kolaboratif.
- Menyediakan AI Financial Advisor yang aman dan dapat dipercaya.
- Mendukung simulasi keputusan finansial yang lebih komprehensif.
- Mendukung multi-workspace untuk personal, family, dan bisnis kecil.
- Mendukung integrasi eksternal jika diperlukan.
- Menjadi SaaS berkelanjutan dengan model premium yang sehat.

# 3. Target Pengguna

## 3.1 Segmentasi Pengguna

Vinari dirancang untuk beberapa kelompok pengguna dengan kebutuhan finansial yang berbeda.

| Segmen      | Karakteristik                                                               | Kebutuhan Utama                                                                       |
| ----------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Mahasiswa   | Penghasilan terbatas, banyak pengeluaran kecil, mulai belajar mengatur uang | Pencatatan sederhana, budget bulanan, kontrol pengeluaran, target tabungan            |
| Karyawan    | Penghasilan rutin, kebutuhan bulanan stabil, mulai punya target finansial   | Budget, tracking pengeluaran, target, dana darurat, insight bulanan                   |
| Freelancer  | Penghasilan tidak stabil, cashflow fluktuatif                               | Cashflow planning, pencatatan pemasukan variatif, prediksi bulan sulit, dana cadangan |
| Pasangan    | Mulai berbagi pengeluaran atau target                                       | Budget bersama, transparansi, target bersama, diskusi berbasis data                   |
| Suami Istri | Mengelola rumah tangga, cicilan, kebutuhan anak, dan rencana jangka panjang | Family workspace, role, approval, target keluarga, debt tracking                      |
| Keluarga    | Banyak anggota, banyak kebutuhan rutin dan masa depan                       | Budget keluarga, target pendidikan, meeting finansial, cashflow prediction            |
| UMKM        | Keuangan personal dan usaha sering tercampur                                | Workspace terpisah, kategori usaha ringan, cashflow, export laporan                   |

## 3.2 Mahasiswa

Mahasiswa membutuhkan alat yang ringan, mudah digunakan, dan tidak terasa rumit. Fokus utama mereka adalah memahami pengeluaran harian, mengatur uang bulanan, dan mulai membangun kebiasaan finansial.

Kebutuhan utama:

- Catat pengeluaran cepat.
- Budget mingguan atau bulanan.
- Kategori sederhana.
- Target tabungan.
- Reminder kebiasaan.

## 3.3 Karyawan

Karyawan biasanya memiliki pemasukan rutin dan kebutuhan bulanan yang relatif stabil. Mereka membutuhkan sistem untuk mengelola budget, target, hutang, dana darurat, dan pengeluaran lifestyle.

Kebutuhan utama:

- Budget bulanan.
- Ringkasan pemasukan dan pengeluaran.
- Target dana darurat.
- Tracking cicilan atau hutang.
- Insight pengeluaran rutin.

## 3.4 Freelancer

Freelancer memiliki tantangan utama pada ketidakstabilan pemasukan. Mereka membutuhkan perencanaan cashflow yang lebih fleksibel.

Kebutuhan utama:

- Pencatatan pemasukan tidak tetap.
- Cashflow prediction.
- Budget adaptif.
- Dana cadangan.
- Pemisahan proyek atau sumber pemasukan.

## 3.5 Pasangan

Pasangan membutuhkan transparansi dan koordinasi. Tidak semua pasangan memiliki sistem keuangan gabungan, sehingga Vinari harus mendukung fleksibilitas.

Kebutuhan utama:

- Target bersama.
- Budget bersama.
- Catatan pengeluaran bersama.
- Role sederhana.
- Ruang diskusi finansial berbasis data.

## 3.6 Suami Istri

Suami istri biasanya memiliki kebutuhan finansial yang lebih kompleks, seperti cicilan rumah, pendidikan anak, dana darurat, asuransi, dan pengeluaran rumah tangga.

Kebutuhan utama:

- Family workspace.
- Approval pengeluaran besar.
- Debt management.
- Target keluarga.
- Monthly financial review.

## 3.7 Keluarga

Keluarga membutuhkan sistem yang dapat membantu perencanaan jangka panjang dan pengambilan keputusan bersama.

Kebutuhan utama:

- Family budget.
- Family Financial Meeting.
- Target pendidikan.
- Target aset.
- Cashflow jangka panjang.
- Multi-member role.

## 3.8 UMKM

UMKM bukan fokus utama MVP, tetapi merupakan peluang pengembangan masa depan. Banyak pemilik usaha kecil masih mencampur keuangan pribadi dan usaha.

Kebutuhan utama:

- Workspace bisnis terpisah.
- Kategori pemasukan dan pengeluaran usaha.
- Export laporan.
- Cashflow usaha sederhana.
- Pemisahan personal dan bisnis.

# 4. Product Positioning

## 4.1 Positioning Utama

Vinari diposisikan sebagai Personal & Family Financial Operating System.

Artinya, Vinari bukan hanya tempat mencatat transaksi, tetapi sistem untuk mengelola proses finansial yang lebih lengkap: record, understand, plan, decide, dan grow.

## 4.2 Perbedaan dengan Aplikasi Pencatatan Keuangan Biasa

| Aspek        | Aplikasi Pencatatan Biasa          | Vinari                                      |
| ------------ | ---------------------------------- | ------------------------------------------- |
| Fokus utama  | Mencatat pemasukan dan pengeluaran | Mengelola kehidupan finansial               |
| Nilai utama  | Riwayat transaksi                  | Insight, planning, decision support         |
| Pengguna     | Umumnya individu                   | Individu, pasangan, keluarga, future UMKM   |
| Budget       | Sering hanya angka batas           | Budget sebagai proses review dan kebiasaan  |
| Hutang       | Sering hanya catatan               | Debt planning dan payoff progress           |
| Target       | Sederhana                          | Goal tracking dan perencanaan               |
| Kolaborasi   | Terbatas atau tidak ada            | Family workspace dan role                   |
| AI           | Jika ada, biasanya umum            | AI Financial Advisor berbasis data pengguna |
| Model bisnis | Aplikasi utilitas                  | SaaS freemium jangka panjang                |

## 4.3 Pernyataan Positioning

Untuk individu, pasangan, dan keluarga yang ingin memahami dan mengelola keuangan secara lebih baik, Vinari adalah Personal & Family Financial Operating System yang membantu mencatat transaksi, memahami kondisi finansial, membuat rencana, mensimulasikan keputusan, dan membangun kebiasaan sehat.

Berbeda dari aplikasi pencatatan biasa, Vinari berfokus pada pengambilan keputusan dan pertumbuhan finansial jangka panjang.

# 5. Core Value

## 5.1 Sederhana

Vinari harus mudah digunakan oleh pengguna non-teknis dan pengguna yang tidak memiliki latar belakang keuangan. Kesederhanaan bukan berarti fitur minim, tetapi setiap fitur harus disajikan dengan alur yang jelas.

Contoh penerapan:

- Form transaksi yang ringkas.
- Bahasa finansial yang mudah dipahami.
- Dashboard yang tidak penuh informasi berlebihan.
- Empty state yang membantu pengguna mulai.

## 5.2 Aman

Vinari menangani data finansial pribadi dan keluarga. Keamanan adalah nilai inti, bukan fitur tambahan.

Contoh penerapan:

- Supabase Auth.
- Row Level Security.
- Permission berbasis workspace.
- Redaksi data sensitif di log.
- Review keamanan untuk fitur sensitif.

## 5.3 Kolaboratif

Keuangan sering menjadi urusan bersama. Vinari harus mendukung kolaborasi pasangan dan keluarga tanpa mengorbankan privasi.

Contoh penerapan:

- Family workspace.
- Role dan permission.
- Shared budget.
- Shared goal.
- Approval pengeluaran.

## 5.4 Insightful

Vinari harus membantu pengguna memahami makna dari data keuangan, bukan hanya menampilkan angka.

Contoh penerapan:

- Ringkasan pengeluaran.
- Financial Health Score.
- AI Financial Insight.
- Budget variance.
- Cashflow prediction.

## 5.5 Future Ready

Vinari harus dibangun dengan fondasi yang memungkinkan pengembangan jangka panjang.

Contoh penerapan:

- Struktur workspace.
- Entitlement premium.
- Audit log.
- Data model yang mendukung family dan future UMKM.
- Architecture yang modular.

# 6. Lima Pilar Vinari

## 6.1 Record

Tujuan pilar Record adalah memastikan pengguna dapat mencatat aktivitas finansial dengan mudah, cepat, dan konsisten.

Contoh implementasi:

- Mencatat pemasukan.
- Mencatat pengeluaran.
- Mencatat transfer antar akun.
- Mencatat hutang.
- Mencatat budget.
- Mencatat target.
- Recurring transaction.

## 6.2 Understand

Tujuan pilar Understand adalah membantu pengguna memahami kondisi finansial berdasarkan data yang sudah dicatat.

Contoh implementasi:

- Dashboard ringkasan.
- Kategori pengeluaran terbesar.
- Perbandingan pemasukan dan pengeluaran.
- Financial Health Score.
- Insight bulanan.
- Deteksi pola pengeluaran.

## 6.3 Plan

Tujuan pilar Plan adalah membantu pengguna membuat rencana finansial yang realistis.

Contoh implementasi:

- Budget bulanan.
- Target dana darurat.
- Target liburan.
- Target pendidikan.
- Rencana pelunasan hutang.
- Rencana cashflow.

## 6.4 Decide

Tujuan pilar Decide adalah membantu pengguna mempertimbangkan keputusan finansial sebelum bertindak.

Contoh implementasi:

- Simulasi pembelian besar.
- Simulasi pelunasan hutang.
- Simulasi menambah cicilan.
- Cashflow prediction.
- AI explanation terhadap risiko keputusan.

## 6.5 Grow

Tujuan pilar Grow adalah membantu pengguna membangun kebiasaan finansial yang lebih sehat dari waktu ke waktu.

Contoh implementasi:

- Habit insight.
- Review bulanan.
- Goal progress.
- Reminder budget.
- Family Financial Meeting.
- Saran perbaikan berdasarkan pola.

# 7. Scope Produk

## 7.1 Ruang Lingkup V1

V1 Vinari harus memberikan pengalaman personal finance yang utuh dan siap menjadi dasar pengembangan premium.

Ruang lingkup V1:

- Authentication.
- Personal workspace.
- Account atau wallet management.
- Category management.
- Transaction management.
- Budget dasar.
- Debt tracking dasar.
- Goal tracking dasar.
- Dashboard ringkasan.
- Basic financial insight.
- Settings dasar.
- PWA readiness.
- Security foundation.

## 7.2 Ruang Lingkup Premium Awal

Fitur premium awal dapat mencakup:

- Financial Health Score.
- Recurring Transaction.
- Export PDF dan Excel.
- Cashflow Prediction sederhana.
- AI Financial Insight terbatas.
- Subscription Manager.

## 7.3 Ruang Lingkup Family

Family scope dapat dikembangkan setelah personal foundation stabil.

Ruang lingkup family:

- Family workspace.
- Invite member.
- Role dan permission.
- Shared budget.
- Shared goal.
- Approval pengeluaran.
- Family Financial Meeting.

## 7.4 Di Luar Ruang Lingkup V1

Hal berikut tidak termasuk dalam V1:

- Bank integration otomatis.
- Investasi dan trading.
- Tax filing.
- Akuntansi UMKM penuh.
- Payroll.
- Financial advice tersertifikasi.
- Multi-currency kompleks.
- Marketplace produk finansial.

# 8. Use Case Utama

## 8.1 Use Case Personal

### Tujuan

Pengguna individu dapat mengelola pemasukan, pengeluaran, budget, hutang, dan target dalam satu workspace personal.

### Alur Penggunaan

1. Pengguna membuat akun.
2. Pengguna membuat workspace personal.
3. Pengguna menambahkan wallet atau akun finansial.
4. Pengguna mencatat transaksi.
5. Pengguna membuat budget.
6. Pengguna membuat target.
7. Pengguna melihat dashboard dan insight.
8. Pengguna melakukan review berkala.

### Hasil yang Diharapkan

- Pengguna mengetahui kondisi uangnya.
- Pengguna dapat mengontrol pengeluaran.
- Pengguna memiliki rencana finansial yang lebih jelas.

## 8.2 Use Case Couple

### Tujuan

Pasangan dapat mengelola sebagian keuangan bersama dengan transparansi dan fleksibilitas.

### Alur Penggunaan

1. Salah satu pengguna membuat workspace bersama.
2. Pengguna mengundang pasangan.
3. Pasangan menentukan kategori dan budget bersama.
4. Transaksi bersama dicatat.
5. Target bersama dibuat.
6. Pasangan meninjau kondisi finansial secara berkala.

### Hasil yang Diharapkan

- Pasangan memiliki data yang sama.
- Diskusi keuangan menjadi lebih objektif.
- Target bersama lebih mudah dipantau.

## 8.3 Use Case Family

### Tujuan

Keluarga dapat mengelola budget, target, hutang, dan keputusan finansial bersama dengan role dan permission yang aman.

### Alur Penggunaan

1. Owner membuat family workspace.
2. Owner mengundang anggota keluarga.
3. Owner menentukan role dan permission.
4. Keluarga membuat budget keluarga.
5. Anggota mencatat atau mengusulkan pengeluaran.
6. Pengeluaran tertentu melalui approval.
7. Keluarga melakukan Family Financial Meeting.
8. Keluarga meninjau target dan kondisi finansial.

### Hasil yang Diharapkan

- Keuangan keluarga lebih transparan.
- Pengeluaran besar lebih terkendali.
- Target keluarga dapat dikelola bersama.

# 9. Business Model

## 9.1 Freemium

Free user harus tetap mendapatkan manfaat nyata. Free tier adalah cara pengguna memahami nilai inti Vinari.

Fitur free dapat mencakup:

- Workspace personal.
- Wallet atau account dasar.
- Transaksi manual.
- Kategori dasar.
- Budget dasar.
- Goal dasar.
- Dashboard ringkasan.

## 9.2 Premium

Premium ditujukan untuk pengguna yang membutuhkan insight, automation, export, dan planning lanjutan.

Fitur premium dapat mencakup:

- Financial Health Score.
- AI Financial Insight.
- Cashflow Prediction.
- Export PDF dan Excel.
- Recurring Transaction.
- Subscription Manager.
- Insight historis lebih dalam.

## 9.3 Family Premium

Family Premium ditujukan untuk pasangan dan keluarga yang membutuhkan kolaborasi.

Fitur Family Premium dapat mencakup:

- Multi-user family workspace.
- Role dan permission.
- Shared budget.
- Shared goal.
- Approval pengeluaran.
- Family Financial Meeting.
- Family financial report.

## 9.4 Future Plan

Future plan dapat mencakup:

- UMKM workspace.
- Business cashflow.
- Export akuntansi ringan.
- Integrasi bank.
- Integrasi pembayaran.
- Advanced AI Advisor.
- Regional localization.

# 10. Success Metrics

Keberhasilan Vinari harus diukur dari kemampuan produk membantu pengguna membangun perilaku finansial yang lebih baik, bukan hanya jumlah akun terdaftar.

## 10.1 Activation Metrics

- Persentase pengguna yang membuat workspace.
- Persentase pengguna yang membuat wallet pertama.
- Persentase pengguna yang mencatat transaksi pertama.
- Persentase pengguna yang membuat budget pertama.
- Waktu dari sign up ke first value.

## 10.2 Engagement Metrics

- Jumlah transaksi per pengguna per minggu.
- Jumlah budget yang aktif.
- Jumlah goal yang dibuat.
- Frekuensi review dashboard.
- Frekuensi penggunaan insight.

## 10.3 Retention Metrics

- Day 1 retention.
- Day 7 retention.
- Day 30 retention.
- Monthly active user retention.
- Repeat transaction logging rate.

## 10.4 Business Metrics

- Conversion rate ke premium.
- Conversion rate ke family premium.
- Monthly recurring revenue.
- Annual recurring revenue.
- Churn rate.
- Average revenue per user.

## 10.5 Outcome Metrics

- Persentase goal yang tercapai.
- Persentase budget yang direview.
- Penurunan kategori overspending.
- Peningkatan konsistensi pencatatan.
- Pengguna yang merasa lebih paham kondisi finansial.

# 11. KPI Produk

| KPI                      | Definisi                              | Tujuan                             |
| ------------------------ | ------------------------------------- | ---------------------------------- |
| DAU                      | Jumlah pengguna aktif harian          | Mengukur penggunaan harian         |
| MAU                      | Jumlah pengguna aktif bulanan         | Mengukur basis pengguna aktif      |
| Retention                | Persentase pengguna yang kembali      | Mengukur nilai jangka panjang      |
| Transaction Created      | Jumlah transaksi yang dibuat          | Mengukur core usage                |
| Budget Created           | Jumlah budget yang dibuat             | Mengukur adopsi planning           |
| Budget Reviewed          | Jumlah budget yang ditinjau           | Mengukur kebiasaan review          |
| Goal Created             | Jumlah target dibuat                  | Mengukur penggunaan fitur planning |
| Goal Completion          | Target yang berhasil dicapai          | Mengukur outcome finansial         |
| Debt Tracked             | Jumlah hutang yang dilacak            | Mengukur adopsi debt management    |
| Premium Conversion       | Pengguna free yang upgrade            | Mengukur nilai premium             |
| Family Workspace Created | Workspace keluarga yang dibuat        | Mengukur adopsi kolaborasi         |
| AI Insight Used          | Insight AI yang dibaca atau digunakan | Mengukur nilai AI                  |
| Export Generated         | Laporan yang diekspor                 | Mengukur kebutuhan reporting       |
| Churn Rate               | Pengguna premium yang berhenti        | Mengukur kesehatan bisnis          |

# 12. Risiko Produk

## 12.1 Risiko Teknis

| Risiko                                          | Dampak                       | Mitigasi                                      |
| ----------------------------------------------- | ---------------------------- | --------------------------------------------- |
| Struktur data tidak siap untuk family workspace | Refactor besar di masa depan | Gunakan workspace sebagai boundary sejak awal |
| Query lambat saat transaksi banyak              | UX buruk dan biaya meningkat | Rancang indexing, pagination, dan agregasi    |
| Logic finansial tersebar di UI                  | Sulit diuji dan dirawat      | Pisahkan business logic dari UI               |
| Integrasi premium tidak konsisten               | Akses fitur kacau            | Gunakan entitlement layer yang jelas          |

## 12.2 Risiko Bisnis

| Risiko                                      | Dampak                         | Mitigasi                                               |
| ------------------------------------------- | ------------------------------ | ------------------------------------------------------ |
| Free tier terlalu kuat tanpa alasan upgrade | Revenue sulit tumbuh           | Bedakan value premium pada insight, automation, family |
| Free tier terlalu dibatasi                  | Pengguna tidak merasakan value | Pastikan fitur inti tetap berguna                      |
| Pricing tidak sesuai pasar                  | Conversion rendah              | Lakukan riset willingness to pay                       |
| Churn premium tinggi                        | Revenue tidak stabil           | Fokus pada recurring value dan habit loop              |

## 12.3 Risiko UX

| Risiko                           | Dampak                           | Mitigasi                                       |
| -------------------------------- | -------------------------------- | ---------------------------------------------- |
| Pencatatan terasa berat          | Pengguna berhenti memakai produk | Buat form cepat, default cerdas, dan recurring |
| Dashboard terlalu ramai          | Pengguna bingung                 | Prioritaskan informasi penting                 |
| Istilah finansial sulit          | Pengguna merasa tidak mampu      | Gunakan bahasa sederhana                       |
| Family workflow terlalu kompleks | Adopsi rendah                    | Mulai dari role dan flow sederhana             |

## 12.4 Risiko Keamanan

| Risiko                      | Dampak                   | Mitigasi                                    |
| --------------------------- | ------------------------ | ------------------------------------------- |
| RLS salah konfigurasi       | Kebocoran data finansial | Security review dan test permission         |
| Data sensitif muncul di log | Pelanggaran privasi      | Redaksi log dan logging policy              |
| Role family tidak jelas     | Akses tidak semestinya   | Definisikan permission matrix               |
| AI menerima data berlebihan | Risiko privasi           | Batasi input dan lakukan masking jika perlu |

## 12.5 Risiko Skalabilitas

| Risiko                                 | Dampak                            | Mitigasi                                           |
| -------------------------------------- | --------------------------------- | -------------------------------------------------- |
| Data transaksi tumbuh besar            | Performa menurun                  | Pagination, indexing, dan archival strategy        |
| Fitur premium bertambah tanpa struktur | Kompleksitas meningkat            | Gunakan entitlement dan modular architecture       |
| Multi-workspace tidak dirancang awal   | Sulit ekspansi ke family dan UMKM | Workspace menjadi konsep inti                      |
| Reporting real-time terlalu berat      | Biaya dan latency tinggi          | Gunakan agregasi terukur dan cache jika diperlukan |

# 13. Roadmap Tingkat Tinggi

## 13.1 MVP

Fokus MVP adalah membuktikan core loop personal finance.

Ruang lingkup MVP:

- Auth.
- Personal workspace.
- Wallet atau account.
- Category.
- Transaction.
- Budget dasar.
- Goal dasar.
- Dashboard ringkas.
- Security foundation.

## 13.2 V1

Fokus V1 adalah membuat produk personal finance yang lebih utuh.

Ruang lingkup V1:

- Debt tracking dasar.
- Budget review.
- Goal progress.
- Financial summary.
- PWA readiness.
- Settings dan profile.
- Basic export jika memungkinkan.

## 13.3 V2

Fokus V2 adalah insight dan premium value.

Ruang lingkup V2:

- Financial Health Score.
- AI Financial Insight.
- Cashflow Prediction.
- Recurring Transaction.
- Subscription Manager.
- Export PDF dan Excel.
- Premium entitlement.

## 13.4 V3

Fokus V3 adalah kolaborasi keluarga dan ekspansi platform.

Ruang lingkup V3:

- Family workspace.
- Role dan permission.
- Shared budget.
- Shared goal.
- Approval pengeluaran.
- Family Financial Meeting.
- Advanced AI Advisor.
- Eksplorasi UMKM workspace.

# 14. Glossary

| Istilah               | Definisi                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Workspace             | Ruang kerja finansial yang menjadi boundary data, dapat berupa personal, family, atau future business |
| Wallet                | Akun atau tempat penyimpanan uang seperti cash, bank, e-wallet, atau kartu                            |
| Account               | Entitas finansial yang mewakili wallet, rekening, kartu kredit, tabungan, atau hutang                 |
| Transaction           | Catatan aktivitas finansial seperti pemasukan, pengeluaran, atau transfer                             |
| Income                | Transaksi pemasukan                                                                                   |
| Expense               | Transaksi pengeluaran                                                                                 |
| Transfer              | Perpindahan uang antar wallet atau account                                                            |
| Category              | Pengelompokan transaksi untuk analisis, budget, dan laporan                                           |
| Budget                | Rencana alokasi uang dalam periode tertentu                                                           |
| Debt                  | Kewajiban atau hutang yang perlu dibayar                                                              |
| Goal                  | Target finansial seperti dana darurat, liburan, pendidikan, atau pembelian besar                      |
| Financial Score       | Indikator ringkas kondisi finansial berdasarkan beberapa faktor                                       |
| AI Insight            | Penjelasan atau saran berbasis data yang dihasilkan AI                                                |
| Family Workspace      | Workspace kolaboratif untuk pasangan atau keluarga                                                    |
| Role                  | Tingkat akses pengguna dalam workspace                                                                |
| Permission            | Hak pengguna untuk melihat, membuat, mengubah, atau menyetujui data                                   |
| Approval              | Proses persetujuan untuk tindakan tertentu seperti pengeluaran besar                                  |
| Recurring Transaction | Transaksi berulang seperti gaji, sewa, cicilan, atau subscription                                     |
| Subscription Manager  | Fitur untuk mengelola pengeluaran berlangganan                                                        |
| Cashflow Prediction   | Prediksi arus kas berdasarkan data historis dan rencana keuangan                                      |
| Entitlement           | Hak akses fitur berdasarkan plan pengguna                                                             |
| Premium               | Plan berbayar untuk fitur lanjutan personal                                                           |
| Family Premium        | Plan berbayar untuk fitur kolaborasi keluarga                                                         |
| Churn                 | Pengguna premium yang berhenti berlangganan                                                           |
| Retention             | Kemampuan produk mempertahankan pengguna agar kembali menggunakan produk                              |

# 15. Lampiran

Dokumen berikut menjadi referensi pendukung Master PRD:

| Dokumen                                          | Fungsi                                           |
| ------------------------------------------------ | ------------------------------------------------ |
| `docs/00-foundation/manifesto.md`                | Menjelaskan filosofi dasar Vinari                |
| `docs/00-foundation/vision.md`                   | Menjelaskan visi produk                          |
| `docs/00-foundation/mission.md`                  | Menjelaskan misi produk                          |
| `docs/00-foundation/product-principles.md`       | Menjelaskan prinsip pengambilan keputusan produk |
| `docs/00-foundation/development-constitution.md` | Aturan tertinggi pengembangan Vinari             |
| `docs/01-product/feature-catalog.md`             | Daftar fitur dan prioritas produk                |
| `docs/01-product/user-persona.md`                | Segmentasi dan persona pengguna                  |
| `docs/01-product/user-journey.md`                | Alur penggunaan utama                            |
| `docs/01-product/information-architecture.md`    | Struktur informasi dan navigasi produk           |
| `docs/02-business/business-model.md`             | Model bisnis Vinari                              |
| `docs/02-business/free-vs-premium.md`            | Perbedaan free dan premium                       |
| `docs/02-business/pricing.md`                    | Strategi harga                                   |
| `docs/03-engineering/database.md`                | Database blueprint                               |
| `docs/03-engineering/erd.md`                     | Rancangan relasi entitas                         |
| `docs/03-engineering/api.md`                     | Rancangan API                                    |
| `docs/03-engineering/security.md`                | Prinsip keamanan                                 |
| `docs/03-engineering/architecture.md`            | Arsitektur teknis                                |
| `docs/04-design/design-system.md`                | Arah design system                               |
| `docs/04-design/ui-guideline.md`                 | Pedoman UI                                       |
| `docs/04-design/wireframe.md`                    | Perencanaan wireframe                            |
| `docs/05-development/roadmap.md`                 | Roadmap pengembangan                             |
| `docs/05-development/sprint.md`                  | Template sprint planning                         |
| `docs/05-development/changelog.md`               | Riwayat perubahan                                |

## Catatan Penutup

Master PRD ini harus diperbarui setiap kali terjadi perubahan besar pada arah produk, ruang lingkup, business model, atau strategi pengembangan. Perubahan terhadap dokumen ini harus dicatat di changelog agar seluruh tim memiliki pemahaman yang sama.

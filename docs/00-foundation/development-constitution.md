# Development Constitution

## Tujuan

Dokumen ini adalah konstitusi pengembangan Vinari. Semua AI Agent, developer, kontributor, dan pihak yang terlibat dalam pengembangan Vinari wajib mengikuti aturan yang tertulis di dalam dokumen ini.

Konstitusi ini dibuat agar seluruh proses pengembangan memiliki standar yang sama, arah yang konsisten, dan kualitas yang dapat dipertahankan dalam jangka panjang. Vinari menangani data finansial pribadi dan keluarga, sehingga setiap keputusan produk, desain, database, keamanan, dan kode harus dilakukan secara hati-hati.

Dokumen ini menjadi acuan utama ketika terjadi perbedaan pendapat dalam pengembangan. Jika terdapat konflik antara preferensi individu, keputusan teknis sementara, atau interpretasi fitur dengan konstitusi ini, maka konstitusi ini menjadi rujukan utama.

## Filosofi Pengembangan

Vinari bukan sekadar project. Vinari adalah produk SaaS jangka panjang yang harus dirancang, dibangun, dan dirawat seperti produk software profesional.

Setiap keputusan pengembangan harus mempertimbangkan:

- Skalabilitas.
- Maintainability.
- Security.
- User Experience.
- Business Value.

Pengembangan Vinari tidak boleh hanya mengejar fitur yang cepat terlihat selesai. Setiap fitur harus memperkuat fondasi produk, menjaga kepercayaan pengguna, dan mendukung arah bisnis jangka panjang.

## Prinsip Pengembangan

### 1. Product First

Semua coding harus berasal dari kebutuhan produk, bukan sebaliknya.

Developer tidak boleh membuat fitur hanya karena secara teknis menarik. Setiap fitur harus memiliki alasan produk yang jelas, persona target, masalah pengguna, dan nilai bisnis.

Sebelum implementasi, pastikan fitur memiliki hubungan dengan salah satu pilar Vinari:

- Record.
- Understand.
- Plan.
- Decide.
- Grow.

### 2. Documentation First

Semua fitur harus memiliki dokumentasi terlebih dahulu.

Dokumentasi minimum untuk fitur baru harus menjelaskan:

- Tujuan fitur.
- Latar belakang.
- Ruang lingkup.
- User story.
- Aturan bisnis.
- Data yang dibutuhkan.
- Risiko keamanan.
- Acceptance criteria.
- Catatan teknis.

Tidak ada fitur besar yang boleh langsung dibuat tanpa dokumentasi yang memadai. Dokumentasi adalah single source of truth untuk semua pengembangan Vinari.

### 3. Database First

Database harus dirancang sebelum coding fitur yang bergantung pada data.

Setiap fitur yang menyimpan, membaca, mengubah, atau menghapus data wajib memiliki rancangan data yang jelas. Relasi antar entitas harus dipahami sebelum UI dan logic dikembangkan.

Database Vinari harus mendukung:

- Ownership data yang jelas.
- Workspace personal dan family.
- Auditability.
- Row Level Security.
- Performa query yang masuk akal.
- Pengembangan fitur premium di masa depan.

### 4. Security by Design

Keamanan harus dipertimbangkan sejak awal, bukan ditambahkan setelah fitur selesai.

Setiap fitur harus menjawab pertanyaan berikut:

- Siapa yang boleh mengakses data ini?
- Siapa yang boleh mengubah data ini?
- Apakah data ini terkait workspace?
- Apakah fitur ini membutuhkan role atau permission?
- Apakah data ini aman jika muncul di log?
- Apakah fitur ini terhubung dengan billing, AI, atau data sensitif?

Vinari menangani data finansial, sehingga kesalahan akses data adalah risiko serius.

### 5. Mobile First

Seluruh UI harus dirancang untuk mobile terlebih dahulu.

Pengguna kemungkinan besar akan mencatat transaksi, melihat budget, dan memeriksa kondisi keuangan dari perangkat mobile. Karena itu, pengalaman mobile harus menjadi prioritas utama.

Prinsip mobile first mencakup:

- Form singkat dan mudah diisi.
- Navigasi sederhana.
- Informasi penting terlihat cepat.
- Aksi utama mudah dijangkau.
- Layout tetap jelas pada layar kecil.

### 6. Reusable Components

Komponen tidak boleh dibuat berulang tanpa alasan kuat.

Jika sebuah pola UI, logic, atau fungsi digunakan lebih dari satu kali, pertimbangkan untuk membuat reusable component, reusable function, atau shared utility yang jelas.

Reusable bukan berarti membuat abstraksi terlalu dini. Komponen dibuat reusable ketika pola benar-benar berulang dan manfaatnya jelas.

### 7. Clean Architecture

Vinari harus menjaga pemisahan tanggung jawab antar lapisan sistem.

Pisahkan:

- UI.
- Business Logic.
- Data.
- Infrastructure.

UI tidak boleh berisi logic bisnis yang kompleks. Business logic tidak boleh bergantung langsung pada detail tampilan. Akses data harus memiliki pola yang konsisten. Integrasi eksternal harus dipisahkan agar mudah diuji dan diganti di masa depan.

### 8. Simplicity

Kode sederhana lebih baik daripada kode pintar tetapi sulit dipahami.

Vinari harus dibangun agar mudah dirawat oleh developer masa depan. Hindari solusi yang terlalu abstrak, terlalu generik, atau sulit dibaca tanpa manfaat nyata.

Kode yang baik harus:

- Mudah dibaca.
- Mudah diuji.
- Mudah diubah.
- Memiliki alur yang jelas.
- Tidak menyembunyikan kompleksitas bisnis.

### 9. Performance

Semua halaman harus ringan dan responsif.

Produk finansial sering digunakan untuk aktivitas cepat seperti mencatat transaksi atau melihat ringkasan. Performa buruk akan langsung mengurangi kepercayaan pengguna.

Pengembangan harus memperhatikan:

- Ukuran bundle.
- Query yang efisien.
- Loading state yang jelas.
- Optimistic update jika relevan.
- Pagination atau virtualisasi untuk data besar.
- Hindari render dan fetch yang tidak perlu.

### 10. Future Ready

Semua fitur harus mudah dikembangkan di masa depan.

Future ready bukan berarti membangun semua hal dari awal. Artinya, keputusan saat ini tidak boleh menutup kemungkinan penting seperti:

- Family workspace.
- Premium entitlement.
- AI Financial Insight.
- Export data.
- Multi-currency.
- Audit log.
- Integrasi eksternal.
- Ekspansi small business.

Setiap fitur harus cukup sederhana untuk MVP, tetapi tidak merusak arah jangka panjang.

## Standar Dokumentasi

Dokumentasi adalah bagian dari produk, bukan pekerjaan tambahan.

Semua keputusan penting harus dicatat. Semua perubahan besar harus memiliki changelog. Semua fitur harus memiliki spesifikasi sebelum implementasi.

Standar dokumentasi Vinari:

- Gunakan Bahasa Indonesia yang jelas, formal, dan mudah dipahami.
- Jelaskan konteks sebelum menjelaskan solusi.
- Bedakan MVP, premium, dan future scope.
- Catat aturan bisnis secara eksplisit.
- Catat risiko keamanan dan teknis.
- Perbarui dokumentasi ketika keputusan berubah.
- Hindari dokumentasi yang hanya berupa daftar tanpa konteks.

Dokumen yang wajib dirujuk sebelum membangun fitur:

- PRD.
- Feature Catalog.
- Database Blueprint.
- Security.
- Architecture.
- UI Guideline.
- Roadmap.
- Changelog.

## Standar Coding

Vinari direncanakan menggunakan TypeScript sebagai bahasa utama di frontend.

Standar coding:

- Gunakan TypeScript.
- Gunakan penamaan yang konsisten.
- Gunakan struktur file yang mudah dipahami.
- Gunakan komentar seperlunya untuk menjelaskan alasan, bukan menjelaskan hal yang sudah jelas.
- Hindari duplikasi kode.
- Gunakan reusable function untuk logic yang berulang.
- Hindari function yang terlalu panjang.
- Hindari komponen yang memiliki terlalu banyak tanggung jawab.
- Gunakan validasi input yang jelas.
- Tangani error dengan aman dan informatif.

Kode harus ditulis untuk dibaca oleh manusia terlebih dahulu, baru kemudian dijalankan oleh mesin.

## Standar Database

Database Vinari harus dirancang dengan prinsip keamanan, kejelasan relasi, dan kemampuan berkembang.

Setiap tabel utama harus mempertimbangkan field berikut:

- `id`.
- `created_at`.
- `updated_at`.
- `workspace_id` jika data terkait workspace.

Standar database:

- Semua relasi harus jelas.
- Gunakan foreign key untuk menjaga integritas data.
- Gunakan Row Level Security.
- Tentukan ownership data sejak awal.
- Tentukan aturan archive, delete, dan soft delete.
- Gunakan tipe data yang aman untuk nominal uang.
- Hindari menyimpan data turunan yang tidak dapat direkonsiliasi.
- Pastikan query utama dapat diskalakan.

Semua perubahan database harus melalui review karena dampaknya dapat menyentuh keamanan, laporan, insight, dan pengalaman pengguna.

## Standar UX

UI Vinari harus sederhana, mudah dipahami, dan tidak membingungkan.

Prinsip UX:

- Pengguna harus memahami apa yang terjadi.
- Pengguna harus tahu tindakan berikutnya.
- Fitur utama dapat diakses maksimal tiga klik.
- Form harus membantu, bukan menghambat.
- Error message harus jelas dan dapat ditindaklanjuti.
- Empty state harus menjelaskan manfaat dan aksi berikutnya.
- Istilah finansial harus disederhanakan.
- Pengalaman mobile harus nyaman.

Vinari tidak boleh membuat pengguna merasa disalahkan atas kondisi finansialnya. Bahasa, warna, status, dan insight harus dirancang secara empatik.

## Standar AI

AI di Vinari bukan chatbot biasa. AI adalah Financial Advisor yang membantu pengguna memahami kondisi finansial, membaca pola, dan mempertimbangkan keputusan.

AI di Vinari harus:

- Memberikan insight.
- Membantu pengambilan keputusan.
- Menjelaskan alasan di balik saran.
- Menggunakan data yang tersedia secara bertanggung jawab.
- Mengakui keterbatasan.
- Tidak mengarang data.
- Tidak memberikan kepastian palsu.
- Tidak menggantikan keputusan pengguna.

AI tidak boleh mengklaim sebagai penasihat keuangan profesional tersertifikasi kecuali Vinari memenuhi persyaratan hukum dan compliance yang relevan.

Setiap fitur AI harus memiliki:

- Batasan data input.
- Batasan output.
- Label bahwa hasil adalah bantuan.
- Mekanisme koreksi atau penolakan dari pengguna.
- Pertimbangan privasi dan keamanan.

## Standar Premium

Vinari menggunakan model freemium SaaS.

Versi gratis harus tetap berguna. Pengguna free harus dapat merasakan nilai inti Vinari, terutama pencatatan, pemahaman dasar, budget dasar, dan target dasar.

Versi premium memberikan nilai tambah, bukan membatasi fungsi dasar secara tidak adil.

Fitur premium dapat mencakup:

- Multi-user family workspace.
- Financial Health Score.
- AI Financial Insight.
- Cashflow Prediction.
- Export PDF dan Excel.
- Approval pengeluaran.
- Family Financial Meeting.
- Recurring Transaction.
- Subscription Manager.

Aturan premium:

- Premium harus memiliki value proposition yang jelas.
- Downgrade tidak boleh menghapus data pengguna.
- Batasan free tier harus dijelaskan dengan transparan.
- Entitlement harus konsisten di frontend dan backend.
- Billing state harus dapat diaudit.

## Standar Testing

Semua fitur wajib memiliki test scenario.

Testing bukan hanya memastikan kode berjalan, tetapi memastikan aturan bisnis, keamanan, dan pengalaman pengguna tetap sesuai.

Standar testing:

- Setiap fitur memiliki skenario happy path.
- Setiap fitur memiliki skenario error.
- Fitur finansial memiliki skenario validasi nominal dan tanggal.
- Fitur workspace memiliki skenario permission.
- Fitur premium memiliki skenario entitlement.
- Bug harus memiliki dokumentasi penyebab dan penyelesaian.
- Semua perubahan penting harus memiliki changelog.

Jenis testing yang dapat digunakan sesuai kebutuhan:

- Unit test.
- Integration test.
- End-to-end test.
- Manual QA scenario.
- Security review.
- Regression test.

## Penutup

Development Constitution ini menjadi acuan utama seluruh pengembangan Vinari.

Vinari harus dibangun dengan disiplin produk, disiplin engineering, dan tanggung jawab terhadap data finansial pengguna. Setiap AI Agent, developer, dan kontributor wajib menjaga agar keputusan harian tetap selaras dengan arah jangka panjang.

Jika terdapat konflik antara keputusan developer dan dokumen ini, maka dokumen ini yang menjadi acuan.

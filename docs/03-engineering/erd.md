# ERD

## Tujuan

Dokumen ini menjadi tempat perencanaan Entity Relationship Diagram Vinari.

## Latar Belakang

ERD diperlukan agar relasi antar entitas finansial dapat dipahami sebelum implementasi database dilakukan. ERD membantu developer, product manager, dan reviewer keamanan melihat konsekuensi desain data.

## Entitas Utama

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
- Audit Log.

## Relasi Awal

- User dapat memiliki banyak Workspace.
- Workspace dapat memiliki banyak Workspace Member.
- Workspace memiliki banyak Account.
- Workspace memiliki banyak Category.
- Account memiliki banyak Transaction.
- Category dapat digunakan oleh banyak Transaction.
- Budget memiliki banyak Budget Item.
- Debt dapat terhubung dengan Account.
- Workspace dapat memiliki Subscription.

## Prinsip Relasi

- Relasi harus mendukung personal dan family workspace.
- Relasi harus memudahkan enforcement RLS.
- Relasi harus mendukung laporan historis.
- Relasi tidak boleh membuat data finansial sulit diaudit.

## Aturan Bisnis

- Workspace menjadi boundary utama akses data.
- Workspace Member menentukan permission pada data bersama.
- Penghapusan entitas harus mempertimbangkan data historis.
- Transaction tidak boleh kehilangan konteks penting setelah category diarsipkan.

## Catatan Teknis

- Diagram visual belum dibuat pada tahap dokumentasi awal.
- Format ERD dapat menggunakan Mermaid, dbdiagram, atau tool visual lain pada fase berikutnya.

## Pengembangan Masa Depan

- Menambahkan ERD visual.
- Menambahkan cardinality detail.
- Menambahkan foreign key candidate.
- Menambahkan constraint candidate.
